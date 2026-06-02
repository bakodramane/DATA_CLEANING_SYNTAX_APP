import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildRuleEngineContext,
  createCleaningPlanFromSelectedRules,
  createDefaultSelectedRuleIds,
  createInitialProjectMetadata,
  renderScriptsForPlan,
} from '../../src/app/state/appState'
import { validateCleaningPlan, type SurveyVariable } from '../../src/core'
import { parseDdiXmlDictionary } from '../../src/importers'

function readFixture(name: string): string {
  const testDirectory = dirname(fileURLToPath(import.meta.url))

  return readFileSync(
    join(testDirectory, '..', 'fixtures', 'dictionaries', name),
    'utf8',
  )
}

function findVariable(
  variables: SurveyVariable[],
  name: string,
): SurveyVariable {
  const variable = variables.find((candidate) => candidate.name === name)

  if (!variable) {
    throw new Error(`Expected imported DDI variable "${name}".`)
  }

  return variable
}

describe('parseDdiXmlDictionary', () => {
  it('imports a minimal DDI Codebook and falls back to IDs for unnamed variables', () => {
    const result = parseDdiXmlDictionary(
      readFixture('ddi-minimal-codebook.xml'),
      {
        sourceName: 'ddi-minimal-codebook.xml',
      },
    )

    expect(result.importedVariableCount).toBe(2)
    expect(result.originalRowCount).toBe(2)
    expect(result.warnings).toEqual([])

    const age = findVariable(result.variables, 'age')
    const fallback = findVariable(result.variables, 'V2')

    expect(age.label).toBe('Age of respondent')
    expect(age.validRange).toMatchObject({ min: 0, max: 120 })
    expect(age.sourceMetadata?.notes?.join(' ')).toContain(
      'Minimal household survey',
    )
    expect(fallback.sourceMetadata?.notes?.join(' ')).toContain(
      'DDI variable ID: V2',
    )
  })

  it('imports household DDI variables, labels, groups, categories, and missing codes', () => {
    const result = parseDdiXmlDictionary(
      readFixture('ddi-household-codebook.xml'),
      {
        preferredLanguage: 'en',
        sourceName: 'ddi-household-codebook.xml',
      },
    )
    const sex = findVariable(result.variables, 'sex')
    const income = findVariable(result.variables, 'income')
    const age = findVariable(result.variables, 'age')

    expect(result.importedVariableCount).toBe(4)
    expect(sex.valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 9, label: 'No response' },
    ])
    expect(sex.declaredMissingCodes).toEqual([
      { value: 9, label: 'No response', category: 'item_nonresponse' },
    ])
    expect(income.declaredMissingCodes).toEqual([
      { value: -8, label: "Don't know", category: 'dont_know' },
      { value: -9, label: 'Refused', category: 'refusal' },
    ])
    expect(age.sourceMetadata?.notes?.join(' ')).toContain(
      'DDI variable groups: Demographics',
    )
    expect(age.sourceMetadata?.notes?.join(' ')).toContain(
      'How old is this household member?',
    )
    expect(result.warnings.map((warning) => warning.code)).toContain(
      'inferred_missing_code',
    )
  })

  it('returns a clear error for invalid XML', () => {
    const result = parseDdiXmlDictionary('<codeBook><dataDscr></codeBook>')

    expect(result.variables).toEqual([])
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'invalid_xml',
        severity: 'error',
      }),
    ])
  })

  it('warns clearly for non-DDI XML', () => {
    const result = parseDdiXmlDictionary(
      '<metadata><var name="age" /></metadata>',
    )

    expect(result.variables).toEqual([])
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'non_ddi_xml',
        severity: 'warning',
      }),
    ])
  })

  it('warns for incomplete DDI categories and skips unnamed variables', () => {
    const result = parseDdiXmlDictionary(
      readFixture('ddi-edge-cases-codebook.xml'),
      {
        sourceName: 'ddi-edge-cases-codebook.xml',
      },
    )
    const age = findVariable(result.variables, 'age')

    expect(result.importedVariableCount).toBe(1)
    expect(result.sourceType).toBe('ddi')
    expect(result.sourceMetadata).toMatchObject({
      sourceName: 'ddi-edge-cases-codebook.xml',
      studyTitle: 'Edge Case Metadata Fixture',
      recordsRead: false,
    })
    expect(age.valueLabels).toEqual([])
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'unsupported_ddi_metadata',
        'missing_variable_name',
      ]),
    )
  })

  it('feeds DDI variables into Cleaning Plan generation and syntax rendering', () => {
    const importResult = parseDdiXmlDictionary(
      readFixture('ddi-household-codebook.xml'),
    )
    const project = createInitialProjectMetadata()
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
    const validation = validateCleaningPlan(plan)
    const scripts = renderScriptsForPlan(plan, ['r', 'stata14'])

    expect(validation.valid).toBe(true)
    expect(plan.steps.length).toBeGreaterThan(0)
    expect(scripts.r?.content).toContain('Generated target: R')
    expect(scripts.stata14?.content).toContain('Stata')
  })
})
