import type {
  Citation,
  CleaningStepType,
  DefaultAction,
  RendererSupportByLanguage,
  TargetLanguage,
  VariableRole,
  VariableType,
} from '../core'
import type { CleaningStepSeverity } from '../core/cleaning-plan/cleaning-step'

export const RULE_FAMILIES = [
  'metadata_preservation',
  'variable_labelling',
  'value_labelling',
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
  'audit_logging',
  'summary_reporting',
] as const

export type RuleFamily = (typeof RULE_FAMILIES)[number]

export const RULE_RECOMMENDATION_LEVELS = [
  'recommended',
  'optional',
  'discouraged',
  'planned',
] as const

export type RuleRecommendationLevel =
  (typeof RULE_RECOMMENDATION_LEVELS)[number]

export const RULE_METADATA_REQUIREMENTS = [
  'label',
  'valueLabels',
  'declaredMissingCodes',
  'validRange',
  'allowedValues',
  'structuralMissingRules',
  'skipPatternDependencies',
  'nonNegativeCandidate',
  'auxiliaryVariables',
  'relatedDateVariables',
  'lengthConstraint',
] as const

export type RuleMetadataRequirement =
  (typeof RULE_METADATA_REQUIREMENTS)[number]

export interface RuleWarning {
  code: string
  severity: 'warning' | 'error'
  message: string
}

export interface CleaningRule {
  id: string
  family: RuleFamily
  scope?: 'variable' | 'plan'
  label: string
  description: string
  applicableVariableTypes?: VariableType[]
  excludedVariableTypes?: VariableType[]
  applicableRoles?: VariableRole[]
  excludedRoles?: VariableRole[]
  requiredMetadata?: RuleMetadataRequirement[]
  defaultAction: DefaultAction
  requiresReview: boolean
  isAutomatic: boolean
  generatedStepType: CleaningStepType
  parameters?: Record<string, unknown>
  rationale: string
  citationKeys: string[]
  severity: CleaningStepSeverity
  warnings?: RuleWarning[]
  rendererSupport?: RendererSupportByLanguage
  recommendation?: RuleRecommendationLevel
  requiresImputationAllowed?: boolean
  requiresAdvancedMode?: boolean
  requiresSpecialistMode?: boolean
}

export interface RuleLibrary {
  rules: CleaningRule[]
  citations: Citation[]
}

export type RuleStrictnessLevel = 'minimal' | 'standard' | 'strict'

export interface RuleEngineContext {
  surveyName?: string
  analysisPurpose?: 'analysis_ready' | 'production' | 'documentation' | 'other'
  targetLanguages?: TargetLanguage[]
  strictnessLevel?: RuleStrictnessLevel
  imputationAllowed?: boolean
  advancedMethodsEnabled?: boolean
  specialistMethodsEnabled?: boolean
  availableAuxiliaryVariables?: string[]
  relatedDateVariables?: string[]
  userOverrides?: {
    includeOptionalRules?: boolean
    includeDiscouragedRules?: boolean
    includePlannedRules?: boolean
    allowIdentifierImputation?: boolean
    allowStructuralImputation?: boolean
    allowDesignVariableImputation?: boolean
    allowWeightOutlierDetection?: boolean
    ruleIds?: string[]
    excludedRuleIds?: string[]
  }
  rules?: CleaningRule[]
  citations?: Citation[]
  generatedAt?: string
}

export type BlockedRuleCode =
  | 'rule_excluded_by_user'
  | 'missing_required_metadata'
  | 'variable_type_not_applicable'
  | 'variable_role_not_applicable'
  | 'identifier_imputation'
  | 'structural_missing_imputation'
  | 'design_variable_imputation'
  | 'imputation_disabled'
  | 'invalid_outlier_variable_type'
  | 'weight_outlier_requires_specialist_review'
  | 'specialist_mode_required'
  | 'advanced_mode_required'

export interface BlockedRule {
  rule: CleaningRule
  variableName: string
  code: BlockedRuleCode
  reason: string
}

export interface RuleValidationIssue {
  ruleId?: string
  message: string
}

export interface RuleValidationResult {
  valid: boolean
  issues: RuleValidationIssue[]
}
