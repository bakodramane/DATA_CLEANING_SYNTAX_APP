import { describe, expect, it } from 'vitest'
import {
  buildRuleEngineContext,
  createCleaningPlanFromSelectedRules,
  createDefaultSelectedRuleIds,
  createInitialProjectMetadata,
  importCsvDictionaryText,
  renderScriptsForPlan,
  validatePlanForPreview,
} from '../../src/app/state/appState'
import {
  officialStatisticsDemoDictionaries,
  officialStatisticsExamplePlans,
  validateCleaningPlan,
  type CleaningPlan,
} from '../../src/core'
import { renderPythonScript } from '../../src/renderers/python'
import { renderRScript } from '../../src/renderers/r'
import { renderSpssScript } from '../../src/renderers/spss'
import { renderStataDoFile } from '../../src/renderers/stata'

const fixedGeneratedAt = '2026-06-03T12:00:00.000Z'

describe('official-statistics Phase 16 examples', () => {
  it.each(officialStatisticsDemoDictionaries)(
    'imports $label dictionary, builds a valid Cleaning Plan, and renders all languages',
    (dictionary) => {
      const project = {
        ...createInitialProjectMetadata(),
        surveyName: dictionary.label,
        countryOrOrganisation: 'Synthetic official statistics example',
        surveyYear: '2026',
      }
      const importResult = importCsvDictionaryText(
        dictionary.csv,
        dictionary.label,
      )
      const context = buildRuleEngineContext(project)
      const selectedRuleIds = createDefaultSelectedRuleIds(
        importResult.variables,
        context,
      )
      const plan = createCleaningPlanFromSelectedRules(
        project,
        importResult.variables,
        selectedRuleIds,
        context,
      )
      const validation = validatePlanForPreview(plan)
      const renderedScripts = renderScriptsForPlan(plan, [
        'spss18',
        'stata14',
        'r',
        'python',
      ])

      expect(importResult.importedVariableCount).toBeGreaterThanOrEqual(10)
      expect(
        importResult.variables.some((variable) => variable.role === 'weight'),
      ).toBe(true)
      expect(validation?.valid).toBe(true)
      expect(Object.keys(renderedScripts).sort()).toEqual([
        'python',
        'r',
        'spss18',
        'stata14',
      ])
      expect(renderedScripts.spss18?.content).toContain(
        'Generated target: SPSS',
      )
      expect(renderedScripts.stata14?.content).toContain(
        'Generated target: Stata',
      )
      expect(renderedScripts.r?.content).toContain('Generated target: R')
      expect(renderedScripts.python?.content).toContain(
        'Generated target: Python',
      )
    },
  )

  it.each(officialStatisticsExamplePlans)(
    'validates and renders reviewer plan for $label',
    ({ createPlan }) => {
      const plan = createPlan()
      const validation = validateCleaningPlan(plan)
      const scripts = renderExamplePlan(plan)

      expect(validation.valid).toBe(true)
      expect(plan.metadata.assumptions.join(' ')).toContain('synthetic')
      expect(plan.steps.some((step) => step.type === 'outlier_flag')).toBe(true)
      expect(plan.steps.some((step) => step.type === 'imputation')).toBe(true)
      expect(
        plan.steps
          .filter((step) => step.type === 'imputation')
          .every((step) => step.requiresReview && !step.isAutomatic),
      ).toBe(true)
      expect(
        plan.steps.some((step) => step.type === 'structural_missing_check'),
      ).toBe(true)
      expect(scripts.join('\n')).toContain('Structural missing')
      expect(scripts.join('\n')).toContain('must be reviewed')
    },
  )
})

function renderExamplePlan(plan: CleaningPlan): string[] {
  return [
    renderSpssScript(plan, { generatedAt: fixedGeneratedAt }).content,
    renderStataDoFile(plan, { generatedAt: fixedGeneratedAt }).content,
    renderRScript(plan, { generatedAt: fixedGeneratedAt }).content,
    renderPythonScript(plan, { generatedAt: fixedGeneratedAt }).content,
  ]
}
