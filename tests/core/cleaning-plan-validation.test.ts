import { describe, expect, it } from 'vitest'
import {
  getRendererSupport,
  sampleCleaningPlan,
  validateCleaningPlan,
  type CleaningPlan,
  type CleaningStep,
  type ValidationIssueCode,
  type VariableType,
} from '../../src/core'

function cloneSamplePlan(): CleaningPlan {
  return structuredClone(sampleCleaningPlan)
}

function findVariable(plan: CleaningPlan, name: string) {
  const variable = plan.variables.find((candidate) => candidate.name === name)

  if (!variable) {
    throw new Error(`Expected sample plan to include variable "${name}".`)
  }

  return variable
}

function findStep(plan: CleaningPlan, id: string): CleaningStep {
  const step = plan.steps.find((candidate) => candidate.id === id)

  if (!step) {
    throw new Error(`Expected sample plan to include step "${id}".`)
  }

  return step
}

function expectErrorCode(plan: CleaningPlan, code: ValidationIssueCode) {
  const result = validateCleaningPlan(plan)

  expect(result.valid).toBe(false)
  expect(result.errors.map((issue) => issue.code)).toContain(code)
}

describe('Cleaning Plan validation', () => {
  it('accepts the sample household survey Cleaning Plan', () => {
    const result = validateCleaningPlan(sampleCleaningPlan)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects duplicate variable names', () => {
    const plan = cloneSamplePlan()
    const age = findVariable(plan, 'age')

    plan.variables.push({ ...age, label: 'Duplicate age variable' })

    expectErrorCode(plan, 'duplicate_variable_name')
  })

  it('rejects unsupported variable types', () => {
    const plan = cloneSamplePlan()
    const age = findVariable(plan, 'age')

    ;(age as unknown as { type: string }).type = 'ratio'

    expectErrorCode(plan, 'unsupported_variable_type')
  })

  it('rejects unsupported cleaning step types', () => {
    const plan = cloneSamplePlan()
    const step = findStep(plan, 'step_age_range')

    ;(step as unknown as { type: string }).type = 'logic_spell'

    expectErrorCode(plan, 'invalid_cleaning_step')
  })

  it('rejects cleaning steps that reference missing variables', () => {
    const plan = cloneSamplePlan()
    const step = findStep(plan, 'step_age_range')

    plan.steps.push({
      ...step,
      id: 'step_missing_variable_reference',
      variables: ['missing_variable'],
    })

    expectErrorCode(plan, 'missing_step_variable')
  })

  it('rejects imputation for identifier variables', () => {
    const plan = cloneSamplePlan()
    const imputationStep = findStep(plan, 'step_income_imputation_review')

    plan.steps.push({
      ...imputationStep,
      id: 'step_bad_identifier_imputation',
      variables: ['household_id'],
      parameters: { method: 'hot_deck' },
    })

    expectErrorCode(plan, 'identifier_imputation')
  })

  it.each([
    { variableName: 'sex', variableType: 'nominal' },
    { variableName: 'sex', variableType: 'string' },
    { variableName: 'household_id', variableType: 'identifier' },
  ] satisfies Array<{ variableName: string; variableType: VariableType }>)(
    'rejects Tukey or MAD outlier rules for $variableType variables',
    ({ variableName, variableType }) => {
      const plan = cloneSamplePlan()
      const variable = findVariable(plan, variableName)
      const outlierStep = findStep(plan, 'step_income_outlier_mad')

      variable.type = variableType
      plan.steps.push({
        ...outlierStep,
        id: `step_bad_${variableType}_outlier`,
        variables: [variableName],
        parameters: { method: 'tukey', threshold: 1.5 },
      })

      expectErrorCode(plan, 'invalid_outlier_method_for_type')
    },
  )

  it('protects structural missing values from imputation', () => {
    const plan = cloneSamplePlan()
    const imputationStep = findStep(plan, 'step_income_imputation_review')

    plan.steps.push({
      ...imputationStep,
      id: 'step_bad_structural_missing_imputation',
      parameters: {
        method: 'mice',
        targetMissingness: ['item_nonresponse', 'structural'],
        includeStructuralMissing: true,
      },
    })

    expectErrorCode(plan, 'structural_missing_imputation')
  })

  it('records and queries renderer capability entries', () => {
    const plan = cloneSamplePlan()

    plan.capabilityMatrix.skip_pattern_check = {
      stata14: {
        status: 'partially_supported',
        note: 'Transparent conditional flags can be generated for Stata v14.',
      },
    }

    expect(
      getRendererSupport(plan.capabilityMatrix, 'imputation', 'python')?.status,
    ).toBe('partially_supported')
    expect(
      getRendererSupport(plan.capabilityMatrix, 'skip_pattern_check', 'stata14')
        ?.status,
    ).toBe('partially_supported')
  })
})
