import { describe, expect, it } from 'vitest'
import {
  buildRuleEngineContext,
  createCleaningPlanFromSelectedRules,
  createDefaultSelectedRuleIds,
  createInitialProjectMetadata,
  renderScriptsForPlan,
} from '../../src/app/state/appState'
import { validateCleaningPlan } from '../../src/core'
import {
  STATISTICAL_PACKAGE_PRIVACY_WARNING,
  parseStataDtaMetadata,
} from '../../src/importers'

describe('parseStataDtaMetadata', () => {
  it('returns a clear fallback warning for unsupported or malformed DTA files', () => {
    const result = parseStataDtaMetadata(new Uint8Array([1, 2, 3, 4]), {
      sourceName: 'malformed.dta',
    })

    expect(result.variables).toEqual([])
    expect(result.sourceType).toBe('stata_dta')
    expect(result.originalRowCount).toBe(0)
    expect(result.privacyWarning?.message).toBe(
      STATISTICAL_PACKAGE_PRIVACY_WARNING,
    )
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'privacy_notice' }),
        expect.objectContaining({ code: 'unsupported_statistical_package' }),
        expect.objectContaining({ code: 'metadata_only_fallback' }),
      ]),
    )
  })

  it('imports synthetic tagged Stata metadata without reading records', () => {
    const result = parseStataDtaMetadata(createSyntheticTaggedStataDta(), {
      sourceName: 'synthetic-minimal.dta',
    })
    const householdId = result.variables.find(
      (variable) => variable.name === 'household_id',
    )
    const age = result.variables.find((variable) => variable.name === 'age')
    const sex = result.variables.find((variable) => variable.name === 'sex')

    expect(result.importedVariableCount).toBe(3)
    expect(result.originalRowCount).toBe(0)
    expect(result.sourceType).toBe('stata_dta')
    expect(result.sourceMetadata).toMatchObject({
      fileLabel: 'Synthetic household metadata',
      recordsRead: false,
      release: '118',
    })
    expect(householdId).toMatchObject({
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'str12',
    })
    expect(age).toMatchObject({
      label: 'Age in completed years',
      storageType: 'int',
    })
    expect(sex?.sourceMetadata?.notes?.join(' ')).toContain('value label set')
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'privacy_notice',
        'unsupported_package_metadata',
        'missing_metadata_review_required',
      ]),
    )
  })

  it('imports MVP text value labels when present in a synthetic Stata label section', () => {
    const result = parseStataDtaMetadata(
      createSyntheticTaggedStataDta({
        valueLabelsText: 'sex_lbl: 1=Male; 2=Female; 9=No response',
      }),
    )
    const sex = result.variables.find((variable) => variable.name === 'sex')

    expect(sex?.valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 9, label: 'No response' },
    ])
    expect(result.warnings.map((warning) => warning.code)).not.toContain(
      'unsupported_package_metadata',
    )
  })

  it('returns fallback when tagged Stata metadata has only unnamed variables', () => {
    const result = parseStataDtaMetadata(
      createSyntheticTaggedStataDta({
        variableNames: ['', '', ''],
        valueLabelNames: ['', '', ''],
      }),
    )

    expect(result.variables).toEqual([])
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'missing_variable_name',
        'empty_dictionary',
        'metadata_only_fallback',
      ]),
    )
  })

  it('returns fallback when a required tagged Stata section is malformed', () => {
    const result = parseStataDtaMetadata(
      concatBytes([
        ascii('<stata_dta>'),
        tagText('release', '118'),
        tagText('byteorder', 'LSF'),
        tagBytes('K', uint16(1)),
        tagBytes('N', uint32(0)),
        ascii('<variable_types>'),
        ascii('</stata_dta>'),
      ]),
    )

    expect(result.variables).toEqual([])
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'malformed_statistical_package',
        'metadata_only_fallback',
      ]),
    )
  })

  it('feeds imported Stata metadata into Cleaning Plan and script rendering', () => {
    const importResult = parseStataDtaMetadata(createSyntheticTaggedStataDta())
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

function createSyntheticTaggedStataDta(
  options: {
    variableNames?: string[]
    valueLabelNames?: string[]
    valueLabelsText?: string
  } = {},
): Uint8Array {
  const variableNames = (
    options.variableNames ?? ['household_id', 'age', 'sex']
  ).map((name) => fixedText(name, 33))
  const variableLabels = [
    fixedText('Household identifier', 81),
    fixedText('Age in completed years', 81),
    fixedText('Respondent sex', 81),
  ]
  const formats = [
    fixedText('%12s', 49),
    fixedText('%8.0g', 49),
    fixedText('%8.0g', 49),
  ]
  const valueLabelNames = (options.valueLabelNames ?? ['', '', 'sex_lbl']).map(
    (name) => fixedText(name, 33),
  )

  return concatBytes([
    ascii('<stata_dta>'),
    tagText('release', '118'),
    tagText('byteorder', 'LSF'),
    tagBytes('K', uint16(3)),
    tagBytes('N', uint32(0)),
    tagText('label', 'Synthetic household metadata'),
    tagText('timestamp', '02 Jun 2026 12:00'),
    tagBytes('map', new Uint8Array()),
    tagBytes(
      'variable_types',
      concatBytes([uint16(12), uint16(65529), uint16(65530)]),
    ),
    tagBytes('varnames', concatBytes(variableNames)),
    tagBytes(
      'sortlist',
      concatBytes([uint16(0), uint16(0), uint16(0), uint16(0)]),
    ),
    tagBytes('formats', concatBytes(formats)),
    tagBytes('value_label_names', concatBytes(valueLabelNames)),
    tagBytes('variable_labels', concatBytes(variableLabels)),
    tagText('characteristics', ''),
    tagBytes('data', new Uint8Array()),
    tagBytes('strls', new Uint8Array()),
    tagBytes('value_labels', ascii(options.valueLabelsText ?? '')),
    ascii('</stata_dta>'),
  ])
}

function tagText(name: string, text: string): Uint8Array {
  return tagBytes(name, ascii(text))
}

function tagBytes(name: string, bytes: Uint8Array): Uint8Array {
  return concatBytes([ascii(`<${name}>`), bytes, ascii(`</${name}>`)])
}

function fixedText(value: string, width: number): Uint8Array {
  const bytes = new Uint8Array(width)
  ascii(value)
    .slice(0, width - 1)
    .forEach((byte, index) => {
      bytes[index] = byte
    })
  return bytes
}

function uint16(value: number): Uint8Array {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, true)
  return bytes
}

function uint32(value: number): Uint8Array {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value, true)
  return bytes
}

function ascii(value: string): Uint8Array {
  return Uint8Array.from(
    Array.from(value).map((character) => character.charCodeAt(0)),
  )
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const bytes = new Uint8Array(
    chunks.reduce((total, chunk) => total + chunk.length, 0),
  )
  let offset = 0

  chunks.forEach((chunk) => {
    bytes.set(chunk, offset)
    offset += chunk.length
  })

  return bytes
}
