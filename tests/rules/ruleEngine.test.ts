import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseCsvDictionary } from '../../src/importers'
import { renderRScript } from '../../src/renderers/r'
import {
  createCandidateCleaningStepsFromVariables,
  createDefaultCleaningPlanFromVariables,
  getRuleWarnings,
} from '../../src/rules'
import { validateCleaningPlan, type SurveyVariable } from '../../src/core'

function readHouseholdCsvFixture(): string {
  const testDirectory = dirname(fileURLToPath(import.meta.url))
  return readFileSync(
    join(
      testDirectory,
      '..',
      'fixtures',
      'dictionaries',
      'household_dictionary.csv',
    ),
    'utf8',
  )
}

function importedHouseholdVariables(): SurveyVariable[] {
  return parseCsvDictionary(readHouseholdCsvFixture(), {
    sourceName: 'household_dictionary.csv',
  }).variables
}

function stepIds(steps: Array<{ id: string }>): string[] {
  return steps.map((step) => step.id)
}

describe('rule engine', () => {
  it('generates candidate Cleaning Plan steps from imported variables', () => {
    const steps = createCandidateCleaningStepsFromVariables(
      importedHouseholdVariables(),
      {
        imputationAllowed: true,
        availableAuxiliaryVariables: ['age', 'sex', 'education_level'],
      },
    )

    expect(stepIds(steps)).toEqual(
      expect.arrayContaining([
        'step_age_range_check_from_metadata',
        'step_sex_domain_check_from_labels',
        'step_household_id_duplicate_identifier_check',
        'step_income_outlier_tukey_flag',
        'step_income_outlier_mad_flag',
        'step_income_impute_continuous_mice_pmm',
        'step_plan_audit_log_basic',
        'step_plan_summary_report_basic',
      ]),
    )
  })

  it('creates a default Cleaning Plan from the household dictionary fixture', () => {
    const plan = createDefaultCleaningPlanFromVariables(
      importedHouseholdVariables(),
      {
        surveyName: 'Imported household survey',
        generatedAt: '2026-05-30T12:00:00.000Z',
        imputationAllowed: true,
        availableAuxiliaryVariables: ['age', 'sex', 'education_level'],
        targetLanguages: ['r'],
      },
    )
    const validation = validateCleaningPlan(plan)

    expect(plan.metadata.title).toBe('Imported household survey cleaning plan')
    expect(plan.steps.length).toBeGreaterThan(20)
    expect(plan.citations.map((citation) => citation.key)).toEqual(
      expect.arrayContaining(['IHSN_DDI', 'DE_WAAL_2011', 'RUBIN_1987']),
    )
    expect(validation.valid).toBe(true)
  })

  it('renders the generated Cleaning Plan with the R renderer', () => {
    const plan = createDefaultCleaningPlanFromVariables(
      importedHouseholdVariables(),
      {
        surveyName: 'Imported household survey',
        generatedAt: '2026-05-30T12:00:00.000Z',
        imputationAllowed: true,
        availableAuxiliaryVariables: ['age', 'sex', 'education_level'],
      },
    )
    const rendered = renderRScript(plan, {
      generatedAt: '2026-05-30T12:00:00.000Z',
    })

    expect(rendered.language).toBe('r')
    expect(rendered.content).toContain('# Generated target: R')
    expect(rendered.content).toContain('var_label(data$age)')
    expect(rendered.content).toContain('val_labels(data$sex)')
    expect(rendered.content).toContain('flag_age_range')
    expect(rendered.content).toContain('flag_income_outlier_tukey')
    expect(rendered.content).toContain('mice_fit <- mice(')
    expect(rendered.unsupportedSteps).toHaveLength(0)
    expect(rendered.warnings.join('\n')).toContain(
      'R audit-log support is partial',
    )
  })

  it('surfaces risky and partially supported rule warnings', () => {
    const warnings = getRuleWarnings(importedHouseholdVariables()[5], {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age'],
      targetLanguages: ['python'],
    })

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('partially_supported'),
        expect.stringContaining('partial'),
      ]),
    )
  })
})
