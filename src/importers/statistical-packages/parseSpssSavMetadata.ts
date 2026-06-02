import type { ValueLabel, VariableValue } from '../../core'
import type { DictionaryImportResult, DictionaryImportWarning } from '../types'
import {
  alignOffset,
  buildPackageImportResult,
  createDeclaredMissingCode,
  createFallbackWarning,
  createPrivacyWarning,
  decodeAscii,
  emptyPackageResult,
  readNullTerminatedFixedString,
  toBytes,
} from './packageMetadataHelpers'
import type {
  PackageMetadataImportOptions,
  PackageVariableMetadata,
} from './packageMetadataTypes'

const SPSS_PACKAGE_NAME = 'SPSS SAV'
const SPSS_SOURCE_TYPE = 'spss_sav'

interface SpssVariableRecord {
  dictionaryIndex: number
  name: string
  label?: string
  variableType: number
  printFormat: number
  writeFormat: number
  missingValues: VariableValue[]
  valueLabels: ValueLabel[]
  variableOrder: number
}

interface PendingValueLabel {
  rawValue: Uint8Array
  label: string
}

export function parseSpssSavMetadata(
  input: ArrayBuffer | Uint8Array,
  options: PackageMetadataImportOptions = {},
): DictionaryImportResult {
  const warnings: DictionaryImportWarning[] = [createPrivacyWarning()]
  const bytes = toBytes(input)

  if (!isSpssSav(bytes)) {
    warnings.push({
      code: 'unsupported_statistical_package',
      severity: 'warning',
      message:
        'This file does not start with an SPSS SAV system-file signature.',
    })
    warnings.push(createFallbackWarning())

    return emptyPackageResult(
      SPSS_SOURCE_TYPE,
      SPSS_PACKAGE_NAME,
      options,
      warnings,
    )
  }

  try {
    const parsed = parseClassicSpssSav(bytes)
    warnings.push(...parsed.warnings)

    if (parsed.variables.length === 0) {
      warnings.push({
        code: 'empty_dictionary',
        severity: 'error',
        message: 'No SPSS variable dictionary records were found.',
      })
      warnings.push(createFallbackWarning())
    }

    return buildPackageImportResult(
      parsed.variables,
      {
        sourceName: options.sourceName,
        sourceType: SPSS_SOURCE_TYPE,
        packageName: SPSS_PACKAGE_NAME,
        fileLabel: parsed.fileLabel,
        release: parsed.product,
        caseCount: parsed.caseCount,
        recordsRead: false,
      },
      options,
      warnings,
    )
  } catch (error) {
    warnings.push({
      code: 'malformed_statistical_package',
      severity: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'The SPSS SAV dictionary could not be parsed.',
    })
    warnings.push(createFallbackWarning())

    return emptyPackageResult(
      SPSS_SOURCE_TYPE,
      SPSS_PACKAGE_NAME,
      options,
      warnings,
    )
  }
}

function parseClassicSpssSav(bytes: Uint8Array): {
  variables: PackageVariableMetadata[]
  warnings: DictionaryImportWarning[]
  product?: string
  fileLabel?: string
  caseCount?: number
} {
  if (bytes.length < 176) {
    throw new Error('The SPSS SAV header is shorter than 176 bytes.')
  }

  const littleEndian = detectSpssEndianness(bytes)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const product = decodeAscii(bytes.slice(4, 64))
  const nominalCaseSize = readInt32(view, 68, littleEndian)
  const caseCount = readInt32(view, 80, littleEndian)
  const fileLabel = decodeAscii(bytes.slice(109, 173))
  const warnings: DictionaryImportWarning[] = []
  const variables: SpssVariableRecord[] = []
  const variablesByDictionaryIndex = new Map<number, SpssVariableRecord>()
  let offset = 176
  let dictionaryIndex = 0
  let pendingValueLabels: PendingValueLabel[] = []

  while (offset + 4 <= bytes.length) {
    const recordType = readInt32(view, offset, littleEndian)

    if (recordType === 2) {
      const parsed = readVariableRecord(
        bytes,
        view,
        offset,
        littleEndian,
        dictionaryIndex + 1,
        variables.length + 1,
        warnings,
      )
      dictionaryIndex += 1
      offset = parsed.nextOffset

      if (parsed.variable) {
        variables.push(parsed.variable)
        variablesByDictionaryIndex.set(
          parsed.variable.dictionaryIndex,
          parsed.variable,
        )
      }

      continue
    }

    if (recordType === 3) {
      const parsed = readValueLabelRecord(bytes, view, offset, littleEndian)
      pendingValueLabels = parsed.valueLabels
      offset = parsed.nextOffset
      continue
    }

    if (recordType === 4) {
      const parsed = readValueLabelVariableRecord(view, offset, littleEndian)
      attachValueLabels(
        parsed.variableIndexes,
        pendingValueLabels,
        variablesByDictionaryIndex,
        littleEndian,
      )
      pendingValueLabels = []
      offset = parsed.nextOffset
      continue
    }

    if (recordType === 6) {
      const lineCount = readInt32(view, offset + 4, littleEndian)
      offset += 8 + Math.max(0, lineCount) * 80
      continue
    }

    if (recordType === 7) {
      const size = readInt32(view, offset + 8, littleEndian)
      const count = readInt32(view, offset + 12, littleEndian)
      offset += 16 + Math.max(0, size) * Math.max(0, count)
      continue
    }

    if (recordType === 999) {
      break
    }

    warnings.push({
      code: 'unsupported_package_metadata',
      severity: 'warning',
      message: `SPSS dictionary record type ${recordType} is not supported by the MVP importer; metadata parsing stopped before observation data.`,
    })
    break
  }

  if (nominalCaseSize > 0) {
    warnings.push({
      code: 'missing_metadata_review_required',
      severity: 'warning',
      message:
        'SPSS observation records were intentionally not read; review any data-dependent missing-value conventions manually.',
    })
  }

  return {
    variables: variables.map(toPackageVariableMetadata),
    warnings,
    product,
    fileLabel,
    caseCount: caseCount >= 0 ? caseCount : undefined,
  }
}

function readVariableRecord(
  bytes: Uint8Array,
  view: DataView,
  offset: number,
  littleEndian: boolean,
  dictionaryIndex: number,
  variableOrder: number,
  warnings: DictionaryImportWarning[],
): { variable?: SpssVariableRecord; nextOffset: number } {
  const variableType = readInt32(view, offset + 4, littleEndian)
  const hasVariableLabel = readInt32(view, offset + 8, littleEndian) === 1
  const missingValueCount = readInt32(view, offset + 12, littleEndian)
  const printFormat = readInt32(view, offset + 16, littleEndian)
  const writeFormat = readInt32(view, offset + 20, littleEndian)
  const name = readNullTerminatedFixedString(bytes, offset + 24, 8, decodeAscii)
  let cursor = offset + 32
  let label: string | undefined

  if (hasVariableLabel) {
    const labelLength = readInt32(view, cursor, littleEndian)
    cursor += 4
    label = decodeAscii(bytes.slice(cursor, cursor + labelLength))
    cursor = alignOffset(cursor + labelLength, 4)
  }

  const missingValues: VariableValue[] = []
  const discreteMissingCount =
    missingValueCount > 0 ? Math.min(missingValueCount, 3) : 0
  const missingSpecCount = Math.min(Math.abs(missingValueCount), 3)

  for (let index = 0; index < missingSpecCount; index += 1) {
    const rawMissing = bytes.slice(cursor, cursor + 8)

    if (index < discreteMissingCount) {
      missingValues.push(
        decodeSpssValue(rawMissing, variableType, littleEndian),
      )
    }

    cursor += 8
  }

  if (missingValueCount < 0) {
    warnings.push({
      code: 'unsupported_package_metadata',
      severity: 'warning',
      message: `SPSS variable "${name || `#${dictionaryIndex}`}" uses range-based user-missing metadata; review missing codes manually.`,
      rowNumber: variableOrder,
    })
  }

  if (variableType === -1 || !name) {
    return { nextOffset: cursor }
  }

  return {
    variable: {
      dictionaryIndex,
      name: normalizeSpssName(name),
      label,
      variableType,
      printFormat,
      writeFormat,
      missingValues,
      valueLabels: [],
      variableOrder,
    },
    nextOffset: cursor,
  }
}

function readValueLabelRecord(
  bytes: Uint8Array,
  view: DataView,
  offset: number,
  littleEndian: boolean,
): { valueLabels: PendingValueLabel[]; nextOffset: number } {
  const labelCount = readInt32(view, offset + 4, littleEndian)
  const valueLabels: PendingValueLabel[] = []
  let cursor = offset + 8

  for (let index = 0; index < labelCount; index += 1) {
    const rawValue = bytes.slice(cursor, cursor + 8)
    const labelLength = bytes[cursor + 8] ?? 0
    const labelStart = cursor + 9
    const label = decodeAscii(bytes.slice(labelStart, labelStart + labelLength))
    cursor = alignOffset(labelStart + labelLength, 8)
    valueLabels.push({ rawValue, label })
  }

  return { valueLabels, nextOffset: cursor }
}

function readValueLabelVariableRecord(
  view: DataView,
  offset: number,
  littleEndian: boolean,
): { variableIndexes: number[]; nextOffset: number } {
  const variableCount = readInt32(view, offset + 4, littleEndian)
  const variableIndexes = Array.from({ length: variableCount }, (_, index) =>
    readInt32(view, offset + 8 + index * 4, littleEndian),
  )

  return {
    variableIndexes,
    nextOffset: offset + 8 + variableCount * 4,
  }
}

function attachValueLabels(
  variableIndexes: number[],
  pendingValueLabels: PendingValueLabel[],
  variablesByDictionaryIndex: Map<number, SpssVariableRecord>,
  littleEndian: boolean,
) {
  variableIndexes.forEach((variableIndex) => {
    const variable = variablesByDictionaryIndex.get(variableIndex)

    if (!variable) {
      return
    }

    variable.valueLabels.push(
      ...pendingValueLabels.map((pendingLabel) => ({
        value: decodeSpssValue(
          pendingLabel.rawValue,
          variable.variableType,
          littleEndian,
        ),
        label: pendingLabel.label,
      })),
    )
  })
}

function toPackageVariableMetadata(
  variable: SpssVariableRecord,
): PackageVariableMetadata {
  const storageType =
    variable.variableType === 0 ? 'numeric' : `string(${variable.variableType})`
  const displayFormat = decodeSpssFormat(variable.printFormat)
  const declaredMissingCodes = variable.missingValues.map((value) => {
    const label =
      variable.valueLabels.find((valueLabel) => valueLabel.value === value)
        ?.label ?? `SPSS user-missing value ${String(value)}`

    return createDeclaredMissingCode(value, label)
  })

  return {
    name: variable.name,
    label: variable.label || variable.name,
    storageType,
    originalType: storageType,
    displayFormat,
    valueLabels: variable.valueLabels,
    declaredMissingCodes,
    variableOrder: variable.variableOrder,
    originalColumns: {
      name: variable.name,
      label: variable.label ?? '',
      storageType,
      displayFormat: displayFormat ?? '',
      missingValues: declaredMissingCodes
        .map((missingCode) => String(missingCode.value))
        .join('; '),
    },
  }
}

function decodeSpssValue(
  rawValue: Uint8Array,
  variableType: number,
  littleEndian: boolean,
): VariableValue {
  if (variableType > 0) {
    return decodeAscii(rawValue)
  }

  const view = new DataView(
    rawValue.buffer,
    rawValue.byteOffset,
    rawValue.byteLength,
  )

  return view.getFloat64(0, littleEndian)
}

function decodeSpssFormat(format: number): string | undefined {
  if (!format) {
    return undefined
  }

  const type = (format >> 16) & 0xff
  const width = (format >> 8) & 0xff
  const decimals = format & 0xff
  const names: Record<number, string> = {
    1: 'A',
    5: 'F',
    20: 'DATE',
    22: 'DATETIME',
  }
  const name = names[type] ?? `FMT${type}`

  return decimals > 0 ? `${name}${width}.${decimals}` : `${name}${width}`
}

function detectSpssEndianness(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const littleLayout = view.getInt32(64, true)
  const bigLayout = view.getInt32(64, false)

  if (littleLayout === 2 || littleLayout === 3) {
    return true
  }

  if (bigLayout === 2 || bigLayout === 3) {
    return false
  }

  return true
}

function isSpssSav(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 36 &&
    bytes[1] === 70 &&
    bytes[2] === 76 &&
    (bytes[3] === 50 || bytes[3] === 51)
  )
}

function readInt32(
  view: DataView,
  offset: number,
  littleEndian: boolean,
): number {
  return view.getInt32(offset, littleEndian)
}

function normalizeSpssName(name: string): string {
  return name.trim().replace(/[^A-Za-z0-9_]/g, '_')
}
