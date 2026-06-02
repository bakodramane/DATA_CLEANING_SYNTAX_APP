import type {
  DeclaredMissingCode,
  SurveyVariable,
  ValidRange,
  ValueLabel,
  VariableRole,
  VariableType,
  VariableValue,
} from '../core'

export const DICTIONARY_COLUMN_CONCEPTS = [
  'name',
  'label',
  'type',
  'storageType',
  'role',
  'valueLabels',
  'missingCodes',
  'validMin',
  'validMax',
  'allowedValues',
  'skipPattern',
  'notes',
] as const

export type DictionaryColumnConcept =
  (typeof DICTIONARY_COLUMN_CONCEPTS)[number]

export type DetectionConfidence = 'high' | 'medium' | 'low'

export interface DetectionResult<TValue> {
  value: TValue
  confidence: DetectionConfidence
  reason: string
}

export interface ColumnMappingSuggestion {
  concept: DictionaryColumnConcept
  columnName: string
  confidence: DetectionConfidence
  reason: string
}

export interface AmbiguousColumnMapping {
  concept: DictionaryColumnConcept
  candidateColumns: string[]
  reason: string
}

export interface DictionaryColumnMapping {
  columns: string[]
  mappedColumns: Partial<Record<DictionaryColumnConcept, string>>
  detectedSuggestions: ColumnMappingSuggestion[]
  ambiguousMappings: AmbiguousColumnMapping[]
  unmappedColumns: string[]
}

export interface DictionaryImportWarning {
  code:
    | 'ambiguous_column_mapping'
    | 'unmapped_column'
    | 'missing_variable_name'
    | 'duplicate_variable_name'
    | 'unsupported_variable_type'
    | 'unsupported_variable_role'
    | 'malformed_value_label'
    | 'malformed_missing_code'
    | 'empty_dictionary'
    | 'missing_required_column'
    | 'excel_sheet_not_found'
    | 'invalid_xml'
    | 'non_ddi_xml'
    | 'inferred_missing_code'
    | 'unsupported_ddi_metadata'
  severity: 'warning' | 'error'
  message: string
  rowNumber?: number
  columnName?: string
}

export interface DictionaryRow {
  rowNumber: number
  raw: Record<string, string>
  canonical: Partial<Record<DictionaryColumnConcept, string>>
  unmapped: Record<string, string>
}

export interface DictionaryImportResult {
  variables: SurveyVariable[]
  columnMapping: DictionaryColumnMapping
  warnings: DictionaryImportWarning[]
  unmappedColumns: string[]
  originalRowCount: number
  importedVariableCount: number
  rows: DictionaryRow[]
}

export interface DictionaryImportOptions {
  sourceName?: string
  columnMapping?: Partial<Record<DictionaryColumnConcept, string>>
}

export interface ManualVariableEntry {
  name: string
  label?: string
  type?: VariableType | string
  role?: VariableRole | string
  storageType?: string
  valueLabels?: string | ValueLabel[]
  missingCodes?: string | DeclaredMissingCode[]
  validRange?: ValidRange
  validMin?: string | number
  validMax?: string | number
  allowedValues?: string | VariableValue[]
  skipPattern?: string
  notes?: string
}
