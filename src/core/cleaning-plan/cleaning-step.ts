import type { RendererSupportByLanguage } from '../models'

export const CLEANING_STEP_TYPES = [
  'import_declaration',
  'variable_label',
  'value_label',
  'missing_value_declaration',
  'range_check',
  'domain_check',
  'structural_missing_check',
  'skip_pattern_check',
  'consistency_check',
  'duplicate_id_check',
  'recode',
  'derived_variable',
  'outlier_flag',
  'outlier_treatment',
  'missingness_diagnosis',
  'imputation',
  'audit_log',
  'summary_report',
] as const

export type CleaningStepType = (typeof CLEANING_STEP_TYPES)[number]

export const CLEANING_STEP_SEVERITIES = ['info', 'warning', 'error'] as const

export type CleaningStepSeverity = (typeof CLEANING_STEP_SEVERITIES)[number]

export const DEFAULT_ACTIONS = [
  'flag',
  'set_missing',
  'recode',
  'derive',
  'impute',
  'no_action',
] as const

export type DefaultAction = (typeof DEFAULT_ACTIONS)[number]

export type CleaningStepParameters = Record<string, unknown>

export interface CleaningStep {
  id: string
  type: CleaningStepType
  variables: string[]
  parameters: CleaningStepParameters
  rationale: string
  citationKeys: string[]
  severity: CleaningStepSeverity
  defaultAction: DefaultAction
  isAutomatic: boolean
  requiresReview: boolean
  rendererSupport: RendererSupportByLanguage
}

export function isCleaningStepType(value: unknown): value is CleaningStepType {
  return CLEANING_STEP_TYPES.includes(value as CleaningStepType)
}
