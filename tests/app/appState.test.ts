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
import { loadDefaultRules, type MethodologyPresetId } from '../../src/rules'

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

  it.each([
    [
      'documentation_only',
      ['variable_labelling'],
      ['imputation', 'outlier_detection'],
    ],
    [
      'basic_validation',
      ['missing_value_declaration', 'range_and_domain_checks'],
      ['imputation', 'outlier_detection'],
    ],
    [
      'validation_outlier_review',
      ['outlier_detection', 'missingness_diagnosis'],
      ['imputation'],
    ],
    [
      'analysis_ready_imputation',
      ['imputation', 'outlier_detection', 'missingness_diagnosis'],
      [],
    ],
  ] as const)(
    'selects expected rule families for the %s preset',
    (methodologyPreset, includedFamilies, excludedFamilies) => {
      const project = {
        ...createInitialProjectMetadata(),
        methodologyPreset,
      }
      const variables = importDemoDictionary().variables
      const context = buildRuleEngineContext(project)
      const selectedRuleIds = createDefaultSelectedRuleIds(variables, context)
      const selectedFamilies = selectedRuleFamilies(selectedRuleIds)

      includedFamilies.forEach((family) => {
        expect(selectedFamilies).toContain(family)
      })
      excludedFamilies.forEach((family) => {
        expect(selectedFamilies).not.toContain(family)
      })
    },
  )

  it('keeps hard protections enforced under every methodology preset', () => {
    const variables = importDemoDictionary().variables

    ;(
      [
        'documentation_only',
        'basic_validation',
        'validation_outlier_review',
        'analysis_ready_imputation',
      ] as MethodologyPresetId[]
    ).forEach((methodologyPreset) => {
      const context = buildRuleEngineContext({
        ...createInitialProjectMetadata(),
        methodologyPreset,
      })
      const householdIdReview = getRuleReviewItems(
        variables,
        context,
        createDefaultSelectedRuleIds(variables, context),
      ).find((item) => item.variable.name === 'household_id')

      expect(
        householdIdReview?.blockedRules.map((rule) => rule.code),
      ).toContain('identifier_imputation')
    })
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

  it('renders selected-language comments into script downloads', () => {
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
    const renderedScripts = renderScriptsForPlan(plan, ['r'], 'fr')
    const downloads = createDownloadArtifacts(
      project,
      variables,
      plan,
      validation,
      renderedScripts,
      'fr',
    )
    const script = downloads.find((download) => download.id === 'r-script')

    expect(script?.content).toContain("Syntaxe d'apurement")
    expect(script?.content).toContain('Justification')
    expect(script?.content).toContain('income')
    expect(script?.content).not.toContain('Survey Microdata Cleaning Syntax')
  })

  it('creates French reviewer-facing summary report content', () => {
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
    const downloads = createDownloadArtifacts(
      project,
      variables,
      plan,
      validation,
      {},
      'fr',
    )
    const summary = downloads.find(
      (download) => download.id === 'summary-report',
    )

    expect(summary?.content).toContain('## Résumé du projet')
    expect(summary?.content).toContain('## Règles sélectionnées')
    expect(summary?.content).toContain("## Étapes du Plan d'apurement")
    expect(summary?.content).toContain('Conserver le libelle de variable')
    expect(summary?.content).toContain('À examiner avant utilisation')
  })

  it('includes methodology preset context in the summary report', () => {
    const project = {
      ...createInitialProjectMetadata(),
      methodologyPreset: 'validation_outlier_review' as const,
    }
    const variables = importDemoDictionary().variables
    const context = buildRuleEngineContext(project)
    const plan = createCleaningPlanFromSelectedRules(
      project,
      variables,
      createDefaultSelectedRuleIds(variables, context),
      context,
    )
    const validation = validatePlanForPreview(plan)
    const downloads = createDownloadArtifacts(
      project,
      variables,
      plan,
      validation,
      {},
    )
    const summary = downloads.find(
      (download) => download.id === 'summary-report',
    )

    expect(summary?.content).toContain('## Methodology preset')
    expect(summary?.content).toContain('Validation + outlier review')
    expect(summary?.content).toContain('outlier flagging')
    expect(summary?.content).toContain('imputation suggestions')
    expect(summary?.content).toContain('User review is still required')
  })
})

function selectedRuleFamilies(selectedRuleIds: Record<string, string[]>) {
  const ruleById = new Map(loadDefaultRules().map((rule) => [rule.id, rule]))

  return [
    ...new Set(
      Object.values(selectedRuleIds)
        .flat()
        .map((ruleId) => ruleById.get(ruleId)?.family)
        .filter((family): family is NonNullable<typeof family> =>
          Boolean(family),
        ),
    ),
  ]
}
