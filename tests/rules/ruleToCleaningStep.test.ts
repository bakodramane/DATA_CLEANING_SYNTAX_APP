import { describe, expect, it } from 'vitest'
import { sampleCleaningPlan, type SurveyVariable } from '../../src/core'
import {
  createCleaningStepsFromRules,
  getApplicableRules,
  getRecommendedRules,
} from '../../src/rules'

function sampleVariable(name: string): SurveyVariable {
  const variable = sampleCleaningPlan.variables.find(
    (candidate) => candidate.name === name,
  )

  if (!variable) {
    throw new Error(`Expected sample variable "${name}".`)
  }

  return structuredClone(variable)
}

describe('rule to CleaningStep conversion', () => {
  it('copies valid-range metadata into range-check step parameters', () => {
    const age = sampleVariable('age')
    const rangeRule = getRecommendedRules(age).find(
      (rule) => rule.id === 'range_check_from_metadata',
    )

    if (!rangeRule) {
      throw new Error('Expected range rule for age.')
    }

    const [step] = createCleaningStepsFromRules(age, [rangeRule])

    expect(step).toMatchObject({
      id: 'step_age_range_check_from_metadata',
      type: 'range_check',
      variables: ['age'],
      parameters: {
        min: 0,
        max: 120,
        ruleId: 'range_check_from_metadata',
      },
      defaultAction: 'flag',
    })
  })

  it('copies labelled values and missing codes into domain-check parameters', () => {
    const sex = sampleVariable('sex')
    const domainRule = getRecommendedRules(sex).find(
      (rule) => rule.id === 'domain_check_from_labels',
    )

    if (!domainRule) {
      throw new Error('Expected domain rule for sex.')
    }

    const [step] = createCleaningStepsFromRules(sex, [domainRule])

    expect(step.parameters.allowedValues).toEqual([1, 2, 9])
    expect(step.type).toBe('domain_check')
    expect(step.citationKeys).toEqual(['DE_WAAL_2011', 'IHSN_DDI'])
  })

  it('adds predictor variables and structural protections to imputation steps', () => {
    const expenditure: SurveyVariable = {
      name: 'expenditure',
      label: 'Household expenditure',
      type: 'continuous',
      role: 'analysis',
      declaredMissingCodes: [
        { value: -9, label: 'Refused', category: 'refusal' },
      ],
    }
    const imputationRule = getApplicableRules(expenditure, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age', 'sex'],
    }).find((rule) => rule.id === 'impute_continuous_mice_pmm')

    if (!imputationRule) {
      throw new Error('Expected continuous imputation rule.')
    }

    const [step] = createCleaningStepsFromRules(expenditure, [imputationRule], {
      availableAuxiliaryVariables: ['age', 'sex'],
    })

    expect(step.type).toBe('imputation')
    expect(step.parameters).toMatchObject({
      method: 'mice_pmm',
      includeStructuralMissing: false,
      predictorVariables: ['age', 'sex'],
    })
  })

  it('carries rule warnings into rationale and parameters', () => {
    const income = sampleVariable('income')
    const structuralRule = getRecommendedRules(income).find(
      (rule) => rule.id === 'structural_missingness_check',
    )

    if (!structuralRule) {
      throw new Error('Expected structural missingness rule.')
    }

    const [step] = createCleaningStepsFromRules(income, [structuralRule])

    expect(step.rationale).toContain('Warning:')
    expect(step.parameters.ruleWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'protect_structural_missingness' }),
      ]),
    )
  })
})
