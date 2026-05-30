export const VARIABLE_TYPES = [
  'continuous',
  'count',
  'binary',
  'nominal',
  'ordinal',
  'string',
  'identifier',
  'date',
  'time',
  'weight',
  'geographic_code',
] as const

export type VariableType = (typeof VARIABLE_TYPES)[number]

export const VARIABLE_ROLES = [
  'identifier',
  'weight',
  'stratum',
  'psu',
  'analysis',
  'auxiliary',
  'derived',
  'metadata',
] as const

export type VariableRole = (typeof VARIABLE_ROLES)[number]

export type VariableValue = string | number | boolean | null

export interface ValueLabel {
  value: VariableValue
  label: string
}

export interface ValidRange {
  min?: number | string
  max?: number | string
  inclusiveMin?: boolean
  inclusiveMax?: boolean
  unit?: string
}

export type MissingValueCategory =
  | 'item_nonresponse'
  | 'dont_know'
  | 'refusal'
  | 'not_applicable'
  | 'structural'
  | 'invalid'
  | 'blank'
  | 'other'

export interface DeclaredMissingCode {
  value: VariableValue
  label: string
  category: MissingValueCategory
}

export interface StructuralMissingRule {
  id: string
  description: string
  condition: string
  dependsOn: string[]
}

export interface SkipPatternDependency {
  sourceVariable: string
  condition: string
  expectedValues?: VariableValue[]
  description?: string
}

export interface SourceMetadata {
  sourceName?: string
  sourceType?: 'manual' | 'csv' | 'excel' | 'ddi' | 'stata' | 'spss' | 'other'
  columnName?: string
  originalType?: string
  rowNumber?: number
  notes?: string[]
}

export interface SurveyVariable {
  name: string
  label: string
  type: VariableType
  role: VariableRole
  storageType?: string
  valueLabels?: ValueLabel[]
  validRange?: ValidRange
  declaredMissingCodes?: DeclaredMissingCode[]
  structuralMissingRules?: StructuralMissingRule[]
  skipPatternDependencies?: SkipPatternDependency[]
  sourceMetadata?: SourceMetadata
  userNotes?: string
}

export function isVariableType(value: unknown): value is VariableType {
  return VARIABLE_TYPES.includes(value as VariableType)
}

export function isVariableRole(value: unknown): value is VariableRole {
  return VARIABLE_ROLES.includes(value as VariableRole)
}
