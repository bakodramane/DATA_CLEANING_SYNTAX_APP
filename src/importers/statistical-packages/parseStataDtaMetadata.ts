import type { ValueLabel, VariableValue } from '../../core'
import type { DictionaryImportResult, DictionaryImportWarning } from '../types'
import {
  buildPackageImportResult,
  createFallbackWarning,
  createPrivacyWarning,
  decodeUtf8,
  emptyPackageResult,
  readNullTerminatedFixedString,
  toBytes,
} from './packageMetadataHelpers'
import type {
  PackageMetadataImportOptions,
  PackageVariableMetadata,
} from './packageMetadataTypes'

const STATA_PACKAGE_NAME = 'Stata DTA'
const STATA_SOURCE_TYPE = 'stata_dta'
const TAGGED_STATA_PREFIX = '<stata_dta>'
const NUMERIC_STATA_STORAGE_TYPES = new Set([
  'byte',
  'int',
  'long',
  'float',
  'double',
])

export function parseStataDtaMetadata(
  input: ArrayBuffer | Uint8Array,
  options: PackageMetadataImportOptions = {},
): DictionaryImportResult {
  const warnings: DictionaryImportWarning[] = [createPrivacyWarning()]
  const bytes = toBytes(input)

  if (!startsWithAscii(bytes, TAGGED_STATA_PREFIX)) {
    warnings.push({
      code: 'unsupported_statistical_package',
      severity: 'warning',
      message:
        'This Stata file is not in the tagged v117-v119 DTA structure supported by the browser metadata importer.',
    })
    warnings.push(createFallbackWarning())

    return emptyPackageResult(
      STATA_SOURCE_TYPE,
      STATA_PACKAGE_NAME,
      options,
      warnings,
    )
  }

  try {
    const parsed = parseTaggedStataDta(bytes)
    warnings.push(...parsed.warnings)

    if (parsed.variables.length === 0) {
      warnings.push({
        code: 'empty_dictionary',
        severity: 'error',
        message: 'No Stata variables were found in the metadata sections.',
      })
      warnings.push(createFallbackWarning())
    }

    return buildPackageImportResult(
      parsed.variables,
      {
        sourceName: options.sourceName,
        sourceType: STATA_SOURCE_TYPE,
        packageName: STATA_PACKAGE_NAME,
        fileLabel: parsed.fileLabel,
        release: parsed.release,
        byteOrder: parsed.byteOrder,
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
          : 'The Stata metadata header could not be parsed.',
    })
    warnings.push(createFallbackWarning())

    return emptyPackageResult(
      STATA_SOURCE_TYPE,
      STATA_PACKAGE_NAME,
      options,
      warnings,
    )
  }
}

function parseTaggedStataDta(bytes: Uint8Array): {
  variables: PackageVariableMetadata[]
  warnings: DictionaryImportWarning[]
  release?: string
  byteOrder?: string
  fileLabel?: string
  caseCount?: number
} {
  const warnings: DictionaryImportWarning[] = []
  const release = readTextTag(bytes, 'release')
  const byteOrder = readTextTag(bytes, 'byteorder') || 'LSF'
  const littleEndian = byteOrder.toUpperCase() !== 'MSF'
  const variableCount = readIntegerTag(bytes, 'K', littleEndian)
  const caseCount = readIntegerTag(bytes, 'N', littleEndian)
  const fileLabel = readTextTag(bytes, 'label')

  if (!release || !['117', '118', '119'].includes(release)) {
    warnings.push({
      code: 'unsupported_statistical_package',
      severity: 'warning',
      message: `Stata release "${release || 'unknown'}" is outside the MVP tagged-DTA support range; metadata was parsed conservatively.`,
    })
  }

  if (!Number.isInteger(variableCount) || variableCount < 0) {
    throw new Error(
      'The Stata metadata header did not contain a valid variable count.',
    )
  }

  const typeCodes = readStataTypeCodes(
    readTagContent(bytes, 'variable_types'),
    variableCount,
    littleEndian,
  )
  const names = readFixedStrings(
    readTagContent(bytes, 'varnames'),
    variableCount,
    release === '119' ? [129, 33] : [33, 129],
  )
  const formats = readFixedStrings(
    readTagContent(bytes, 'formats'),
    variableCount,
    [49, 57, 12],
  )
  const valueLabelNames = readFixedStrings(
    readTagContent(bytes, 'value_label_names'),
    variableCount,
    release === '119' ? [129, 33] : [33, 129],
  )
  const variableLabels = readFixedStrings(
    readTagContent(bytes, 'variable_labels'),
    variableCount,
    release === '119' ? [321, 81] : [81, 321],
  )
  const decodedValueLabels = parseMvpTextValueLabels(
    readTagContent(bytes, 'value_labels'),
  )

  const variables = names
    .map((name, index): PackageVariableMetadata | undefined => {
      const normalizedName = normalizeStataName(name)

      if (!normalizedName) {
        warnings.push({
          code: 'missing_variable_name',
          severity: 'error',
          message: `Stata variable ${index + 1} was missing a name and was skipped.`,
          rowNumber: index + 1,
        })
        return undefined
      }

      const storageType = decodeStataStorageType(typeCodes[index])
      const valueLabelSetName = valueLabelNames[index] || undefined
      const valueLabels = valueLabelSetName
        ? (decodedValueLabels.get(valueLabelSetName) ?? [])
        : []
      const notes = [
        valueLabelSetName && valueLabels.length === 0
          ? 'Stata value-label set name was extracted, but this MVP could not decode a binary value-label table; export a dictionary if labels are required.'
          : '',
        NUMERIC_STATA_STORAGE_TYPES.has(storageType)
          ? 'Stata extended missing values (.a-.z) cannot be detected without reading records; review missing-code metadata manually.'
          : '',
      ].filter(Boolean)

      return {
        name: normalizedName,
        label: variableLabels[index] || normalizedName,
        storageType,
        originalType: storageType,
        displayFormat: formats[index] || undefined,
        valueLabelSetName,
        valueLabels,
        declaredMissingCodes: [],
        variableOrder: index + 1,
        notes,
        originalColumns: {
          name: normalizedName,
          label: variableLabels[index] ?? '',
          storageType,
          displayFormat: formats[index] ?? '',
          valueLabelSetName: valueLabelSetName ?? '',
        },
      }
    })
    .filter((variable): variable is PackageVariableMetadata =>
      Boolean(variable),
    )

  if (valueLabelNames.some(Boolean) && decodedValueLabels.size === 0) {
    warnings.push({
      code: 'unsupported_package_metadata',
      severity: 'warning',
      message:
        'Stata value-label set names were found, but binary value-label definitions were not decoded in this MVP. Review value labels manually or import an exported CSV/Excel dictionary.',
    })
  }

  if (
    variables.some((variable) =>
      NUMERIC_STATA_STORAGE_TYPES.has(variable.storageType ?? ''),
    )
  ) {
    warnings.push({
      code: 'missing_metadata_review_required',
      severity: 'warning',
      message:
        'Stata extended missing values cannot be confirmed without reading observation values; review missing codes manually.',
    })
  }

  return {
    variables,
    warnings,
    release,
    byteOrder,
    fileLabel,
    caseCount,
  }
}

function readStataTypeCodes(
  content: Uint8Array,
  count: number,
  littleEndian: boolean,
): number[] {
  const view = new DataView(
    content.buffer,
    content.byteOffset,
    content.byteLength,
  )

  if (content.length >= count * 2) {
    return Array.from({ length: count }, (_, index) =>
      view.getUint16(index * 2, littleEndian),
    )
  }

  if (content.length >= count) {
    return Array.from({ length: count }, (_, index) => content[index])
  }

  throw new Error('The Stata variable type section is shorter than expected.')
}

function decodeStataStorageType(code: number | undefined): string {
  if (code === undefined) {
    return 'unknown'
  }

  if (code > 0 && code <= 2045) {
    return `str${code}`
  }

  const modernNumericTypes: Record<number, string> = {
    65530: 'byte',
    65529: 'int',
    65528: 'long',
    65527: 'float',
    65526: 'double',
  }
  const legacyNumericTypes: Record<number, string> = {
    251: 'byte',
    252: 'int',
    253: 'long',
    254: 'float',
    255: 'double',
  }

  return (
    modernNumericTypes[code] ?? legacyNumericTypes[code] ?? `stata_type_${code}`
  )
}

function readFixedStrings(
  content: Uint8Array,
  count: number,
  candidateWidths: number[],
): string[] {
  if (count === 0) {
    return []
  }

  const exactWidth = candidateWidths.find(
    (width) => content.length >= width * count,
  )
  const width = exactWidth ?? Math.floor(content.length / count)

  if (!width || content.length < width * count) {
    throw new Error('A Stata string metadata section is shorter than expected.')
  }

  return Array.from({ length: count }, (_, index) =>
    readNullTerminatedFixedString(content, index * width, width, decodeUtf8),
  )
}

function readTextTag(bytes: Uint8Array, tagName: string): string | undefined {
  const content = readTagContent(bytes, tagName)

  if (content.length === 0) {
    return undefined
  }

  return decodeUtf8(content)
}

function readIntegerTag(
  bytes: Uint8Array,
  tagName: string,
  littleEndian: boolean,
): number {
  const content = readTagContent(bytes, tagName)
  const asText = decodeUtf8(content)

  if (/^\d+$/.test(asText)) {
    return Number(asText)
  }

  const view = new DataView(
    content.buffer,
    content.byteOffset,
    content.byteLength,
  )

  if (content.length === 2) {
    return view.getUint16(0, littleEndian)
  }

  if (content.length === 4) {
    return view.getUint32(0, littleEndian)
  }

  if (content.length === 8) {
    return Number(view.getBigUint64(0, littleEndian))
  }

  throw new Error(`The Stata <${tagName}> header value could not be read.`)
}

function readTagContent(bytes: Uint8Array, tagName: string): Uint8Array {
  const openingTag = asciiBytes(`<${tagName}>`)
  const closingTag = asciiBytes(`</${tagName}>`)
  const start = indexOfSequence(bytes, openingTag)

  if (start < 0) {
    return new Uint8Array()
  }

  const contentStart = start + openingTag.length
  const end = indexOfSequence(bytes, closingTag, contentStart)

  if (end < 0) {
    throw new Error(`The Stata <${tagName}> section is not closed.`)
  }

  return bytes.slice(contentStart, end)
}

function parseMvpTextValueLabels(
  content: Uint8Array,
): Map<string, ValueLabel[]> {
  const text = decodeUtf8(content)
  const labelsByName = new Map<string, ValueLabel[]>()

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.+)$/)

      if (!match) {
        return
      }

      labelsByName.set(
        match[1],
        match[2]
          .split(';')
          .map((entry) => entry.trim())
          .filter(Boolean)
          .flatMap((entry): ValueLabel[] => {
            const entryMatch = entry.match(/^([^=]+)=(.+)$/)

            return entryMatch
              ? [
                  {
                    value: parseStataValueToken(entryMatch[1]),
                    label: entryMatch[2].trim(),
                  },
                ]
              : []
          }),
      )
    })

  return labelsByName
}

function parseStataValueToken(value: string): VariableValue {
  const trimmedValue = value.trim()

  return /^-?\d+(\.\d+)?$/.test(trimmedValue)
    ? Number(trimmedValue)
    : trimmedValue
}

function normalizeStataName(name: string): string {
  return name.trim().replace(/[^A-Za-z0-9_]/g, '_')
}

function startsWithAscii(bytes: Uint8Array, value: string): boolean {
  const prefix = asciiBytes(value)

  return prefix.every((byte, index) => bytes[index] === byte)
}

function asciiBytes(value: string): Uint8Array {
  return Uint8Array.from(
    Array.from(value).map((character) => character.charCodeAt(0)),
  )
}

function indexOfSequence(
  bytes: Uint8Array,
  sequence: Uint8Array,
  start = 0,
): number {
  for (let index = start; index <= bytes.length - sequence.length; index += 1) {
    let matches = true

    for (
      let sequenceIndex = 0;
      sequenceIndex < sequence.length;
      sequenceIndex += 1
    ) {
      if (bytes[index + sequenceIndex] !== sequence[sequenceIndex]) {
        matches = false
        break
      }
    }

    if (matches) {
      return index
    }
  }

  return -1
}
