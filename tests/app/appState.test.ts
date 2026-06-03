import { describe, expect, it } from 'vitest'
import {
  buildRuleEngineContext,
  createCleaningPlanFromSelectedRules,
  createDefaultSelectedRuleIds,
  createDownloadArtifacts,
  createInitialProjectMetadata,
  formatValidationMessages,
  getRuleReviewItems,
  importDemoDictionary,
  renderScriptsForPlan,
  updateVariableTypeRole,
  validatePlanForPreview,
} from '../../src/app/state/appState'
import { validateCleaningPlan } from '../../src/core'

describe('workflow state helpers', () => {
  it('imports demo household variables for the workflow', () => {
    const result = importDemoDictionary()

    expect(result.variables.map((variable) => variable.name)).toEqual(
      expect.arrayContaining(['household_id', 'age', 'wage_income_month']),
    )
    expect(result.importedVariableCount).toBe(11)
  })

  it('updates variable type and role corrections in state', () => {
    const variables = importDemoDictionary().variables
    const corrected = updateVariableTypeRole(variables, 'sex', {
      type: 'nominal',
      role: 'auxiliary',
    })
    const sex = corrected.find((variable) => variable.name === 'sex')

    expect(sex).toMatchObject({ type: 'nominal', role: 'auxiliary' })
    expect(sex?.sourceMetadata?.notes?.join(' ')).toContain('User correction')
  })

  it('shows recommended and blocked rules for imported variables', () => {
    const project = createInitialProjectMetadata()
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const reviews = getRuleReviewItems(
      variables,
      context,
      createDefaultSelectedRuleIds(variables, context),
    )
    const sexReview = reviews.find((item) => item.variable.name === 'sex')
    const householdIdReview = reviews.find(
      (item) => item.variable.name === 'household_id',
    )

    expect(sexReview?.recommendedRules.map((rule) => rule.id)).toContain(
      'domain_check_from_labels',
    )
    expect(householdIdReview?.blockedRules.map((rule) => rule.code)).toContain(
      'identifier_imputation',
    )
  })

  it('generates a valid Cleaning Plan from selected rules', () => {
    const project = createInitialProjectMetadata()
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const selectedRuleIds = createDefaultSelectedRuleIds(variables, context)
    const plan = createCleaningPlanFromSelectedRules(
      project,
      variables,
      selectedRuleIds,
      context,
    )
    const validation = validatePlanForPreview(plan)

    expect(plan.steps.length).toBeGreaterThan(20)
    expect(validation?.valid).toBe(true)
  })

  it('formats validation errors for display', () => {
    const project = createInitialProjectMetadata()
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const plan = createCleaningPlanFromSelectedRules(
      project,
      variables,
      createDefaultSelectedRuleIds(variables, context),
      context,
    )
    const invalidPlan = {
      ...plan,
      variables: [...plan.variables, { ...plan.variables[0] }],
    }
    const validation = validateCleaningPlan(invalidPlan)

    expect(validation.valid).toBe(false)
    expect(formatValidationMessages(validation).join(' ')).toContain(
      'duplicates',
    )
  })

  it('renders all four syntax previews from a valid plan', () => {
    const project = createInitialProjectMetadata()
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const plan = createCleaningPlanFromSelectedRules(
      project,
      variables,
      createDefaultSelectedRuleIds(variables, context),
      context,
    )
    const renderedScripts = renderScriptsForPlan(plan, project.targetLanguages)

    expect(Object.keys(renderedScripts).sort()).toEqual([
      'python',
      'r',
      'spss18',
      'stata14',
    ])
    expect(renderedScripts.r?.content).toContain('Generated target: R')
    expect(renderedScripts.spss18?.content).toContain('SPSS')
    expect(renderedScripts.stata14?.content).toContain('Stata')
    expect(renderedScripts.python?.content).toContain('Python')
  })

  it('creates download content for Cleaning Plan JSON and scripts', () => {
    const project = createInitialProjectMetadata()
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const plan = createCleaningPlanFromSelectedRules(
      project,
      variables,
      createDefaultSelectedRuleIds(variables, context),
      context,
    )
    const validation = validatePlanForPreview(plan)
    const renderedScripts = renderScriptsForPlan(plan, ['r'])
    const downloads = createDownloadArtifacts(
      project,
      variables,
      plan,
      validation,
      renderedScripts,
    )

    expect(downloads.map((download) => download.id)).toEqual(
      expect.arrayContaining(['cleaning-plan-json', 'r-script']),
    )
    expect(
      downloads.find((download) => download.id === 'cleaning-plan-json')
        ?.content,
    ).toContain('"steps"')
    expect(
      downloads.find((download) => download.id === 'r-script')?.content,
    ).toContain('Generated target: R')
  })
})
