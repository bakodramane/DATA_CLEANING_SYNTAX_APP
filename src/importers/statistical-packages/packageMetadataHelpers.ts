import type {
  DeclaredMissingCode,
  MissingValueCategory,
  SourceMetadata,
  SurveyVariable,
  VariableValue,
} from '../../core'
import { detectVariableRole, detectVariableType } from '../typeDetection'
import type {
  DictionaryColumnMapping,
  DictionaryImportResult,
  DictionaryImportWarning,
  DictionaryRow,
} from '../types'
import type {
  PackageMetadataImportOptions,
  PackageSourceMetadata,
  PackageVariableMetadata,
  StatisticalPackageSourceType,
} from './packageMetadataTypes'

export const STATISTICAL_PACKAGE_PRIVACY_WARNING =
  "SPSS and Stata files may contain confidential microdata. This app processes files locally in your browser and attempts to extract metadata only. Review your organisation's confidentiality rules before opening data files."

export const STATISTICAL_PACKAGE_FALLBACK_MESSAGE =
  'Direct metadata extraction from this file was not possible. Please export the variable dictionary from SPSS/Stata to CSV or Excel and import that dictionary instead.'

export function createPrivacyWarning(): DictionaryImportWarning {
  return {
    code: 'privacy_notice',
    severity: 'warning',
    message: STATISTICAL_PACKAGE_PRIVACY_WARNING,
  }
}

export function createFallbackWarning(): DictionaryImportWarning {
  return {
    code: 'metadata_only_fallback',
    severity: 'warning',
    message: STATISTICAL_PACKAGE_FALLBACK_MESSAGE,
  }
}

export function toBytes(input: ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input)
}

export function decodeAscii(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => (byte === 0 ? '' : String.fromCharCode(byte)))
    .join('')
    .trim()
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false })
    .decode(bytes)
    .replace(/\0/g, '')
    .trim()
}

export function emptyPackageResult(
  sourceType: StatisticalPackageSourceType,
  packageName: string,
  options: PackageMetadataImportOptions,
  warnings: DictionaryImportWarning[],
): DictionaryImportResult {
  return {
    variables: [],
    columnMapping: createPackageColumnMapping(packageName),
    warnings,
    unmappedColumns: [],
    originalRowCount: 0,
    importedVariableCount: 0,
    rows: [],
    sourceType,
    sourceMetadata: {
      sourceName: options.sourceName,
      packageName,
      recordsRead: false,
    },
    privacyWarning: {
      shown: options.privacyWarningShown !== false,
      message: STATISTICAL_PACKAGE_PRIVACY_WARNING,
    },
  }
}

export function buildPackageImportResult(
  variablesMetadata: PackageVariableMetadata[],
  sourceMetadata: PackageSourceMetadata,
  options: PackageMetadataImportOptions,
  warnings: DictionaryImportWarning[],
): DictionaryImportResult {
  const rows = variablesMetadata.map(createPackageRow)
  const variables = variablesMetadata.map((metadata) =>
    createSurveyVariable(metadata, sourceMetadata),
  )

  return {
    variables,
    columnMapping: createPackageColumnMapping(sourceMetadata.packageName),
    warnings,
    unmappedColumns: [],
    originalRowCount: 0,
    importedVariableCount: variables.length,
    rows,
    sourceType: sourceMetadata.sourceType,
    sourceMetadata: {
      sourceName: options.sourceName,
      packageName: sourceMetadata.packageName,
      fileLabel: sourceMetadata.fileLabel,
      release: sourceMetadata.release,
      byteOrder: sourceMetadata.byteOrder,
      caseCount: sourceMetadata.caseCount,
      recordsRead: false,
    },
    privacyWarning: {
      shown: options.privacyWarningShown !== false,
      message: STATISTICAL_PACKAGE_PRIVACY_WARNING,
    },
  }
}

export function inferMissingCategory(label: string): MissingValueCategory {
  const normalizedLabel = label.toLowerCase()

  if (/(don'?t know|\bdk\b)/.test(normalizedLabel)) {
    return 'dont_know'
  }

  if (/(refus|declined)/.test(normalizedLabel)) {
    return 'refusal'
  }

  if (/(not applicable|n\/a|^na$)/.test(normalizedLabel)) {
    return 'not_applicable'
  }

  if (/(no response|not stated|missing)/.test(normalizedLabel)) {
    return 'item_nonresponse'
  }

  if (/(blank|empty)/.test(normalizedLabel)) {
    return 'blank'
  }

  return 'other'
}

export function createDeclaredMissingCode(
  value: VariableValue,
  label: string,
): DeclaredMissingCode {
  return {
    value,
    label,
    category: inferMissingCategory(label),
  }
}

export function readNullTerminatedFixedString(
  bytes: Uint8Array,
  start: number,
  length: number,
  decoder: (value: Uint8Array) => string = decodeUtf8,
): string {
  const slice = bytes.slice(start, start + length)
  const end = slice.indexOf(0)

  return decoder(end >= 0 ? slice.slice(0, end) : slice)
}

export function alignOffset(offset: number, boundary: number): number {
  const remainder = offset % boundary

  return remainder === 0 ? offset : offset + boundary - remainder
}

function createPackageColumnMapping(
  packageName: string,
): DictionaryColumnMapping {
  return {
    columns: [
      `${packageName} variable name`,
      `${packageName} variable label`,
      `${packageName} storage type`,
      `${packageName} display format`,
      `${packageName} value labels`,
      `${packageName} missing values`,
    ],
    mappedColumns: {
      name: `${packageName} variable name`,
      label: `${packageName} variable label`,
      type: `${packageName} storage type`,
      storageType: `${packageName} storage type`,
      valueLabels: `${packageName} value labels`,
      missingCodes: `${packageName} missing values`,
    },
    detectedSuggestions: [
      {
        concept: 'name',
        columnName: `${packageName} variable name`,
        confidence: 'high',
        reason: `${packageName} dictionary metadata supplied variable names.`,
      },
      {
        concept: 'label',
        columnName: `${packageName} variable label`,
        confidence: 'high',
        reason: `${packageName} dictionary metadata supplied variable labels.`,
      },
    ],
    ambiguousMappings: [],
    unmappedColumns: [],
  }
}

function createPackageRow(metadata: PackageVariableMetadata): DictionaryRow {
  const raw = {
    'Package variable name': metadata.name,
    'Package variable label': metadata.label ?? '',
    'Package storage type': metadata.storageType ?? '',
    'Package display format': metadata.displayFormat ?? '',
    'Package value labels': formatValueLabels(metadata),
    'Package missing values': formatMissingCodes(metadata),
  }

  return {
    rowNumber: metadata.variableOrder,
    raw,
    canonical: {
      name: metadata.name,
      label: metadata.label,
      type: metadata.storageType,
      storageType: metadata.storageType,
      valueLabels: raw['Package value labels'],
      missingCodes: raw['Package missing values'],
      notes: metadata.notes?.join('; '),
    },
    unmapped: {},
  }
}

function createSurveyVariable(
  metadata: PackageVariableMetadata,
  sourceMetadata: PackageSourceMetadata,
): SurveyVariable {
  const valueLabels = metadata.valueLabels ?? []
  const typeDetection = detectVariableType({
    name: metadata.name,
    declaredType: metadata.originalType ?? metadata.storageType,
    storageType: metadata.storageType,
    valueLabels,
    validMin: metadata.validRange?.min,
    validMax: metadata.validRange?.max,
  })
  const roleDetection = detectVariableRole(metadata.name)
  const notes = [
    sourceMetadata.fileLabel
      ? `${sourceMetadata.packageName} file label: ${sourceMetadata.fileLabel}`
      : '',
    sourceMetadata.release
      ? `${sourceMetadata.packageName} release: ${sourceMetadata.release}`
      : '',
    metadata.displayFormat
      ? `${sourceMetadata.packageName} display format: ${metadata.displayFormat}`
      : '',
    metadata.valueLabelSetName
      ? `${sourceMetadata.packageName} value label set: ${metadata.valueLabelSetName}`
      : '',
    'Observation-level records were not imported or stored.',
    `Detected type: ${typeDetection.value} (${typeDetection.confidence}) - ${typeDetection.reason}`,
    `Detected role: ${roleDetection.value} (${roleDetection.confidence}) - ${roleDetection.reason}`,
    ...(metadata.notes ?? []),
  ].filter(Boolean)
  const variableSourceMetadata: SourceMetadata = {
    sourceName: sourceMetadata.sourceName,
    sourceType: sourceMetadata.sourceType,
    columnName: metadata.name,
    originalType: metadata.originalType ?? metadata.storageType,
    rowNumber: metadata.variableOrder,
    originalColumns: metadata.originalColumns,
    notes,
  }

  return {
    name: metadata.name,
    label: metadata.label || metadata.name,
    type: typeDetection.value,
    role: roleDetection.value,
    storageType: metadata.storageType,
    valueLabels,
    validRange: metadata.validRange,
    declaredMissingCodes: metadata.declaredMissingCodes ?? [],
    sourceMetadata: variableSourceMetadata,
    userNotes: metadata.notes?.join('; '),
  }
}

function formatValueLabels(metadata: PackageVariableMetadata): string {
  return (
    metadata.valueLabels
      ?.map((label) => `${String(label.value)}=${label.label}`)
      .join('; ') ?? ''
  )
}

function formatMissingCodes(metadata: PackageVariableMetadata): string {
  return (
    metadata.declaredMissingCodes
      ?.map(
        (missingCode) => `${String(missingCode.value)}=${missingCode.label}`,
      )
      .join('; ') ?? ''
  )
}
