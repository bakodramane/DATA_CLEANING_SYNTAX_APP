import type { CleaningRule, MethodologyPresetId, RuleFamily } from './types'

export const METHODOLOGY_PRESETS = [
  'documentation_only',
  'basic_validation',
  'validation_outlier_review',
  'analysis_ready_imputation',
] as const

interface MethodologyPresetDefinition {
  id: MethodologyPresetId
  defaultFamilies: RuleFamily[]
  includedFamilies: RuleFamily[]
  excludedFamilies: RuleFamily[]
}

const VALIDATION_FAMILIES: RuleFamily[] = [
  'variable_labelling',
  'value_labelling',
  'missing_value_declaration',
  'range_and_domain_checks',
  'structural_missingness_protection',
  'skip_pattern_checks',
  'duplicate_identifier_checks',
  'audit_logging',
  'summary_reporting',
]

const OUTLIER_FAMILIES: RuleFamily[] = [
  'missingness_diagnosis',
  'outlier_detection',
]

export const methodologyPresetDefinitions: MethodologyPresetDefinition[] = [
  {
    id: 'documentation_only',
    defaultFamilies: [
      'metadata_preservation',
      'variable_labelling',
      'value_labelling',
      'audit_logging',
      'summary_reporting',
    ],
    includedFamilies: [
      'metadata_preservation',
      'variable_labelling',
      'value_labelling',
      'audit_logging',
      'summary_reporting',
    ],
    excludedFamilies: [
      'missing_value_declaration',
      'range_and_domain_checks',
      'structural_missingness_protection',
      'skip_pattern_checks',
      'duplicate_identifier_checks',
      'consistency_checks',
      'outlier_detection',
      'outlier_treatment',
      'missingness_diagnosis',
      'imputation',
    ],
  },
  {
    id: 'basic_validation',
    defaultFamilies: VALIDATION_FAMILIES,
    includedFamilies: VALIDATION_FAMILIES,
    excludedFamilies: [
      'outlier_detection',
      'outlier_treatment',
      'missingness_diagnosis',
      'imputation',
    ],
  },
  {
    id: 'validation_outlier_review',
    defaultFamilies: [...VALIDATION_FAMILIES, ...OUTLIER_FAMILIES],
    includedFamilies: [...VALIDATION_FAMILIES, ...OUTLIER_FAMILIES],
    excludedFamilies: ['outlier_treatment', 'imputation'],
  },
  {
    id: 'analysis_ready_imputation',
    defaultFamilies: [
      ...VALIDATION_FAMILIES,
      ...OUTLIER_FAMILIES,
      'imputation',
    ],
    includedFamilies: [
      ...VALIDATION_FAMILIES,
      ...OUTLIER_FAMILIES,
      'imputation',
    ],
    excludedFamilies: ['outlier_treatment'],
  },
]

export const defaultMethodologyPreset: MethodologyPresetId = 'basic_validation'

export function isMethodologyPresetId(
  value: string,
): value is MethodologyPresetId {
  return (METHODOLOGY_PRESETS as readonly string[]).includes(value)
}

export function getMethodologyPresetDefinition(
  preset: MethodologyPresetId,
): MethodologyPresetDefinition {
  return (
    methodologyPresetDefinitions.find(
      (definition) => definition.id === preset,
    ) ??
    methodologyPresetDefinitions.find(
      (definition) => definition.id === defaultMethodologyPreset,
    )!
  )
}

export function isRuleSelectedByPreset(
  rule: CleaningRule,
  preset: MethodologyPresetId,
): boolean {
  const definition = getMethodologyPresetDefinition(preset)

  if (!definition.defaultFamilies.includes(rule.family)) {
    return false
  }

  if (
    rule.recommendation === 'planned' ||
    rule.recommendation === 'discouraged'
  ) {
    return false
  }

  if (
    preset !== 'documentation_only' &&
    rule.family === 'metadata_preservation'
  ) {
    return false
  }

  if (preset !== 'analysis_ready_imputation' && rule.family === 'imputation') {
    return false
  }

  if (rule.family === 'outlier_treatment') {
    return false
  }

  return true
}
