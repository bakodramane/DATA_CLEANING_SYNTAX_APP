import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  parseCsvDictionary,
  type DictionaryImportWarning,
} from '../../src/importers'
import {
  validateCleaningPlan,
  type CleaningPlan,
  type CleaningStep,
  type SurveyVariable,
} from '../../src/core'
import { renderRScript } from '../../src/renderers/r'

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

function findVariable(
  variables: SurveyVariable[],
  name: string,
): SurveyVariable {
  const variable = variables.find((candidate) => candidate.name === name)

  if (!variable) {
    throw new Error(`Expected imported variable "${name}".`)
  }

  return variable
}

function warningCodes(warnings: DictionaryImportWarning[]): string[] {
  return warnings.map((warning) => warning.code)
}

function supportedStep(
  overrides: Pick<CleaningStep, 'id' | 'type' | 'variables' | 'rationale'> &
    Partial<CleaningStep>,
): CleaningStep {
  return {
    parameters: {},
    citationKeys: ['IHSN_DDI'],
    severity: 'info',
    defaultAction: 'no_action',
    isAutomatic: true,
    requiresReview: false,
    rendererSupport: {
      r: { status: 'supported' },
      spss18: { status: 'supported' },
      stata14: { status: 'supported' },
      python: { status: 'supported' },
    },
    ...overrides,
  }
}

function createImportedPlan(variables: SurveyVariable[]): CleaningPlan {
  return {
    id: 'imported-household-plan',
    metadata: {
      title: 'Imported household survey cleaning plan',
      createdAt: '2026-05-30T00:00:00.000Z',
      version: '0.1.0',
      assumptions: ['Imported from a CSV data dictionary fixture.'],
    },
    variables,
    steps: [
      supportedStep({
        id: 'step_variable_labels',
        type: 'variable_label',
        variables: ['age'],
        rationale: 'Preserve imported survey codebook labels.',
      }),
      supportedStep({
        id: 'step_value_labels',
        type: 'value_label',
        variables: ['sex'],
        rationale: 'Preserve imported categorical codes.',
      }),
      supportedStep({
        id: 'step_age_range',
        type: 'range_check',
        variables: ['age'],
        parameters: { min: 0, max: 120 },
        rationale: 'Flag ages outside the expected questionnaire range.',
        defaultAction: 'flag',
      }),
    ],
    citations: [
      {
        key: 'IHSN_DDI',
        title: 'DDI metadata guidance',
        authorOrOrganisation: 'IHSN',
        year: 'NEEDS_VERIFICATION',
        sourceType: 'official_guidance',
      },
    ],
    capabilityMatrix: {},
  }
}

describe('parseCsvDictionary', () => {
  it('imports a household survey dictionary into core variables', () => {
    const result = parseCsvDictionary(readHouseholdCsvFixture(), {
      sourceName: 'household_dictionary.csv',
    })
    const age = findVariable(result.variables, 'age')
    const sex = findVariable(result.variables, 'sex')
    const income = findVariable(result.variables, 'income')

    expect(result.originalRowCount).toBe(9)
    expect(result.importedVariableCount).toBe(9)
    expect(result.columnMapping.mappedColumns.name).toBe('variable_name')
    expect(result.unmappedColumns).toEqual(['extra_source'])
    expect(warningCodes(result.warnings)).toContain('unmapped_column')

    expect(age.type).toBe('count')
    expect(age.validRange).toMatchObject({ min: 0, max: 120 })
    expect(sex.valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
    ])
    expect(income.declaredMissingCodes).toEqual([
      { value: -98, label: "Don't know", category: 'dont_know' },
      { value: -99, label: 'Refused', category: 'refusal' },
    ])
    expect(income.sourceMetadata?.unmappedColumns).toEqual({
      extra_source: 'Labour module',
    })
  })

  it('reports duplicate variable names', () => {
    const result = parseCsvDictionary(
      [
        'variable_name,variable_label,data_type',
        'age,Age,integer',
        'Age,Duplicate age,integer',
      ].join('\n'),
    )

    expect(warningCodes(result.warnings)).toContain('duplicate_variable_name')
  })

  it('warns and skips rows with missing variable names', () => {
    const result = parseCsvDictionary(
      [
        'variable_name,variable_label,data_type',
        ',Missing name,integer',
        'sex,Sex,integer',
      ].join('\n'),
    )

    expect(warningCodes(result.warnings)).toContain('missing_variable_name')
    expect(result.variables.map((variable) => variable.name)).toEqual(['sex'])
  })

  it('reports a missing required name column before row-level skips', () => {
    const result = parseCsvDictionary(
      [
        'variable_label,data_type,value_labels,missing_codes',
        'Age,integer,malformed,-9=Refused',
      ].join('\n'),
    )

    expect(warningCodes(result.warnings)).toEqual(
      expect.arrayContaining([
        'missing_required_column',
        'missing_variable_name',
      ]),
    )
    expect(result.importedVariableCount).toBe(0)
  })

  it('preserves valid labels while warning about malformed label entries', () => {
    const result = parseCsvDictionary(
      [
        'variable_name,variable_label,value_labels',
        'sex,Sex,1=Male; malformed',
      ].join('\n'),
    )
    const sex = findVariable(result.variables, 'sex')

    expect(sex.valueLabels).toEqual([{ value: 1, label: 'Male' }])
    expect(warningCodes(result.warnings)).toContain('malformed_value_label')
  })

  it('produces variables that can validate and render through an existing renderer', () => {
    const importResult = parseCsvDictionary(readHouseholdCsvFixture())
    const plan = createImportedPlan(importResult.variables)
    const validation = validateCleaningPlan(plan)
    const rendered = renderRScript(plan, {
      generatedAt: '2026-05-30T12:00:00.000Z',
    })

    expect(validation.valid).toBe(true)
    expect(rendered.content).toContain('var_label(data$age)')
    expect(rendered.content).toContain('val_labels(data$sex)')
    expect(rendered.content).toContain('flag_age_range')
  })
})
