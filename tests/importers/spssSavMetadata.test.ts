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
  parseSpssSavMetadata,
} from '../../src/importers'

describe('parseSpssSavMetadata', () => {
  it('returns a clear fallback warning for unsupported or malformed SAV files', () => {
    const result = parseSpssSavMetadata(new Uint8Array([1, 2, 3, 4]), {
      sourceName: 'malformed.sav',
    })

    expect(result.variables).toEqual([])
    expect(result.sourceType).toBe('spss_sav')
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

  it('imports synthetic SPSS SAV dictionary metadata without reading records', () => {
    const result = parseSpssSavMetadata(createSyntheticSpssSav(), {
      sourceName: 'synthetic-minimal.sav',
    })
    const householdId = result.variables.find(
      (variable) => variable.name === 'HHID',
    )
    const sex = result.variables.find((variable) => variable.name === 'SEX')

    expect(result.importedVariableCount).toBe(3)
    expect(result.originalRowCount).toBe(0)
    expect(result.sourceType).toBe('spss_sav')
    expect(result.sourceMetadata).toMatchObject({
      fileLabel: 'Synthetic SPSS metadata',
      recordsRead: false,
    })
    expect(householdId).toMatchObject({
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string(8)',
    })
    expect(sex?.valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 9, label: 'No response' },
    ])
    expect(sex?.declaredMissingCodes).toEqual([
      { value: 9, label: 'No response', category: 'item_nonresponse' },
    ])
    expect(sex).toMatchObject({
      type: 'nominal',
      storageType: 'numeric',
    })
    expect(result.warnings.map((warning) => warning.code)).toContain(
      'privacy_notice',
    )
  })

  it('feeds imported SPSS metadata into Cleaning Plan and script rendering', () => {
    const importResult = parseSpssSavMetadata(createSyntheticSpssSav())
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

function createSyntheticSpssSav(): Uint8Array {
  return concatBytes([
    createHeader(),
    variableRecord({
      name: 'HHID',
      type: 8,
      label: 'Household identifier',
      printFormat: spssFormat(1, 8, 0),
      writeFormat: spssFormat(1, 8, 0),
    }),
    variableRecord({
      name: 'AGE',
      type: 0,
      label: 'Age in completed years',
      printFormat: spssFormat(5, 8, 0),
      writeFormat: spssFormat(5, 8, 0),
    }),
    variableRecord({
      name: 'SEX',
      type: 0,
      label: 'Respondent sex',
      missingValues: [numericSpssValue(9)],
      printFormat: spssFormat(5, 8, 0),
      writeFormat: spssFormat(5, 8, 0),
    }),
    valueLabelRecord([
      { value: numericSpssValue(1), label: 'Male' },
      { value: numericSpssValue(2), label: 'Female' },
      { value: numericSpssValue(9), label: 'No response' },
    ]),
    valueLabelVariablesRecord([3]),
    terminatorRecord(),
  ])
}

function createHeader(): Uint8Array {
  const bytes = new Uint8Array(176)
  bytes.set(ascii('$FL2'), 0)
  bytes.set(
    fixedText('@(#) SPSS DATA FILE - synthetic metadata fixture', 60),
    4,
  )
  const view = new DataView(bytes.buffer)
  view.setInt32(64, 2, true)
  view.setInt32(68, 3, true)
  view.setInt32(72, 0, true)
  view.setInt32(76, 0, true)
  view.setInt32(80, 0, true)
  view.setFloat64(84, 100, true)
  bytes.set(fixedText('02 JUN 26', 9), 92)
  bytes.set(fixedText('12:00:00', 8), 101)
  bytes.set(fixedText('Synthetic SPSS metadata', 64), 109)

  return bytes
}

function variableRecord(options: {
  name: string
  type: number
  label?: string
  missingValues?: Uint8Array[]
  printFormat: number
  writeFormat: number
}): Uint8Array {
  const labelBytes = options.label ? ascii(options.label) : new Uint8Array()
  const labelSection = options.label
    ? concatBytes([
        int32(labelBytes.length),
        labelBytes,
        paddingFor(4 + labelBytes.length, 4),
      ])
    : new Uint8Array()
  const missingValues = options.missingValues ?? []

  return concatBytes([
    int32(2),
    int32(options.type),
    int32(options.label ? 1 : 0),
    int32(missingValues.length),
    int32(options.printFormat),
    int32(options.writeFormat),
    fixedText(options.name, 8),
    labelSection,
    ...missingValues,
  ])
}

function valueLabelRecord(
  labels: Array<{ value: Uint8Array; label: string }>,
): Uint8Array {
  return concatBytes([
    int32(3),
    int32(labels.length),
    ...labels.map((label) => {
      const labelBytes = ascii(label.label)
      const unpaddedLength = 8 + 1 + labelBytes.length

      return concatBytes([
        label.value,
        Uint8Array.of(labelBytes.length),
        labelBytes,
        paddingFor(unpaddedLength, 8),
      ])
    }),
  ])
}

function valueLabelVariablesRecord(variableIndexes: number[]): Uint8Array {
  return concatBytes([
    int32(4),
    int32(variableIndexes.length),
    ...variableIndexes.map(int32),
  ])
}

function terminatorRecord(): Uint8Array {
  return concatBytes([int32(999), int32(0)])
}

function spssFormat(type: number, width: number, decimals: number): number {
  return (type << 16) + (width << 8) + decimals
}

function numericSpssValue(value: number): Uint8Array {
  const bytes = new Uint8Array(8)
  new DataView(bytes.buffer).setFloat64(0, value, true)
  return bytes
}

function int32(value: number): Uint8Array {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setInt32(0, value, true)
  return bytes
}

function fixedText(value: string, width: number): Uint8Array {
  const bytes = new Uint8Array(width)
  ascii(value)
    .slice(0, width)
    .forEach((byte, index) => {
      bytes[index] = byte
    })
  return bytes
}

function paddingFor(currentLength: number, boundary: number): Uint8Array {
  const remainder = currentLength % boundary

  return new Uint8Array(remainder === 0 ? 0 : boundary - remainder)
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
