import type {
  DeclaredMissingCode,
  ValidRange,
  ValueLabel,
  VariableValue,
} from '../../core'
import type { DictionaryImportOptions } from '../types'

export type StatisticalPackageSourceType = 'stata_dta' | 'spss_sav'

export interface PackageMetadataImportOptions extends DictionaryImportOptions {
  privacyWarningShown?: boolean
}

export interface PackageSourceMetadata {
  sourceName?: string
  sourceType: StatisticalPackageSourceType
  packageName: string
  fileLabel?: string
  release?: string
  byteOrder?: string
  caseCount?: number
  recordsRead: false
}

export interface PackageVariableMetadata {
  name: string
  label?: string
  storageType?: string
  originalType?: string
  displayFormat?: string
  valueLabelSetName?: string
  valueLabels?: ValueLabel[]
  declaredMissingCodes?: DeclaredMissingCode[]
  validRange?: ValidRange
  variableOrder: number
  notes?: string[]
  originalColumns?: Record<string, string>
}

export interface RawValueLabel {
  value: VariableValue
  label: string
}
