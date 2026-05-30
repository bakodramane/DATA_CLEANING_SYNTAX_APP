import type { SurveyVariable, VariableRole, VariableType } from '../core'
import { loadDefaultRules } from './defaultRules'
import type {
  BlockedRule,
  BlockedRuleCode,
  CleaningRule,
  RuleEngineContext,
  RuleMetadataRequirement,
} from './types'

const DESIGN_ROLES = new Set<VariableRole>(['weight', 'stratum', 'psu'])
const NUMERIC_OUTLIER_TYPES = new Set<VariableType>(['continuous', 'count'])

export function getApplicableRules(
  variable: SurveyVariable,
  context: RuleEngineContext = {},
): CleaningRule[] {
  return getRuleSet(context).filter(
    (rule) =>
      (rule.scope ?? 'variable') === 'variable' &&
      !getRuleBlock(variable, rule, context) &&
      matchesConfiguredApplicability(variable, rule) &&
      hasRequiredMetadata(variable, rule, context),
  )
}

export function getRecommendedRules(
  variable: SurveyVariable,
  context: RuleEngineContext = {},
): CleaningRule[] {
  return getApplicableRules(variable, context).filter((rule) =>
    isRecommendedByContext(rule, context),
  )
}

export function getBlockedRules(
  variable: SurveyVariable,
  context: RuleEngineContext = {},
): BlockedRule[] {
  return getRuleSet(context).flatMap((rule) => {
    if ((rule.scope ?? 'variable') !== 'variable') {
      return []
    }

    const block = getRuleBlock(variable, rule, context)
    return block ? [block] : []
  })
}

export function isRecommendedByContext(
  rule: CleaningRule,
  context: RuleEngineContext = {},
): boolean {
  const recommendation = rule.recommendation ?? 'recommended'

  if (recommendation === 'recommended') {
    return true
  }

  if (recommendation === 'optional') {
    return (
      context.userOverrides?.includeOptionalRules === true ||
      context.strictnessLevel === 'strict'
    )
  }

  if (recommendation === 'discouraged') {
    return context.userOverrides?.includeDiscouragedRules === true
  }

  return (
    context.userOverrides?.includePlannedRules === true ||
    context.advancedMethodsEnabled === true ||
    context.specialistMethodsEnabled === true
  )
}

export function getRuleBlock(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext = {},
): BlockedRule | undefined {
  const excludedRuleIds = context.userOverrides?.excludedRuleIds ?? []
  const selectedRuleIds = context.userOverrides?.ruleIds

  if (excludedRuleIds.includes(rule.id)) {
    return block(
      variable,
      rule,
      'rule_excluded_by_user',
      `Rule "${rule.label}" was excluded by user configuration.`,
    )
  }

  if (selectedRuleIds && !selectedRuleIds.includes(rule.id)) {
    return block(
      variable,
      rule,
      'rule_excluded_by_user',
      `Rule "${rule.label}" is not in the selected rule list.`,
    )
  }

  if (rule.requiresAdvancedMode && context.advancedMethodsEnabled !== true) {
    return block(
      variable,
      rule,
      'advanced_mode_required',
      `Rule "${rule.label}" requires advanced mode before it can be proposed.`,
    )
  }

  if (
    rule.requiresSpecialistMode &&
    context.specialistMethodsEnabled !== true
  ) {
    return block(
      variable,
      rule,
      'specialist_mode_required',
      `Rule "${rule.label}" requires specialist review mode before it can be proposed.`,
    )
  }

  if (isImputationRule(rule)) {
    return getImputationBlock(variable, rule, context)
  }

  if (isOutlierRule(rule)) {
    return getOutlierBlock(variable, rule, context)
  }

  return undefined
}

export function matchesConfiguredApplicability(
  variable: SurveyVariable,
  rule: CleaningRule,
): boolean {
  return (
    matchesVariableType(variable, rule) && matchesVariableRole(variable, rule)
  )
}

export function hasRequiredMetadata(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext = {},
): boolean {
  return (rule.requiredMetadata ?? []).every((requirement) =>
    hasMetadataRequirement(variable, requirement, context),
  )
}

function getRuleSet(context: RuleEngineContext): CleaningRule[] {
  return context.rules ?? loadDefaultRules()
}

function getImputationBlock(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext,
): BlockedRule | undefined {
  if (
    isIdentifierVariable(variable) &&
    context.userOverrides?.allowIdentifierImputation !== true
  ) {
    return block(
      variable,
      rule,
      'identifier_imputation',
      'Identifiers should not be imputed because changing them can break record linkage and audit trails.',
    )
  }

  if (
    hasStructuralMissingness(variable) &&
    context.userOverrides?.allowStructuralImputation !== true
  ) {
    return block(
      variable,
      rule,
      'structural_missing_imputation',
      'Structural missing values come from valid skip patterns and should not be treated as item nonresponse.',
    )
  }

  if (
    isDesignVariable(variable) &&
    context.userOverrides?.allowDesignVariableImputation !== true
  ) {
    return block(
      variable,
      rule,
      'design_variable_imputation',
      'Survey weights, strata and primary sampling units are design variables and should not be imputed without specialist review.',
    )
  }

  if (rule.requiresImputationAllowed && context.imputationAllowed !== true) {
    return block(
      variable,
      rule,
      'imputation_disabled',
      'Imputation rules are disabled in the current rule-engine context.',
    )
  }

  return undefined
}

function getOutlierBlock(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext,
): BlockedRule | undefined {
  if (
    (variable.role === 'weight' || variable.type === 'weight') &&
    context.userOverrides?.allowWeightOutlierDetection !== true
  ) {
    return block(
      variable,
      rule,
      'weight_outlier_requires_specialist_review',
      'Survey weights are design variables and should not receive arbitrary outlier treatment without specialist review.',
    )
  }

  if (!NUMERIC_OUTLIER_TYPES.has(variable.type)) {
    return block(
      variable,
      rule,
      'invalid_outlier_variable_type',
      'Tukey and MAD outlier detection are intended for numeric continuous or count variables and are not meaningful for nominal, ordinal, binary, string, date or identifier variables.',
    )
  }

  return undefined
}

function matchesVariableType(
  variable: SurveyVariable,
  rule: CleaningRule,
): boolean {
  if (rule.excludedVariableTypes?.includes(variable.type)) {
    return false
  }

  return (
    !rule.applicableVariableTypes ||
    rule.applicableVariableTypes.includes(variable.type)
  )
}

function matchesVariableRole(
  variable: SurveyVariable,
  rule: CleaningRule,
): boolean {
  if (rule.excludedRoles?.includes(variable.role)) {
    return false
  }

  return !rule.applicableRoles || rule.applicableRoles.includes(variable.role)
}

function hasMetadataRequirement(
  variable: SurveyVariable,
  requirement: RuleMetadataRequirement,
  context: RuleEngineContext,
): boolean {
  switch (requirement) {
    case 'label':
      return Boolean(variable.label.trim() && variable.label !== variable.name)
    case 'valueLabels':
      return (variable.valueLabels?.length ?? 0) > 0
    case 'declaredMissingCodes':
      return (variable.declaredMissingCodes?.length ?? 0) > 0
    case 'validRange':
      return (
        variable.validRange?.min !== undefined ||
        variable.validRange?.max !== undefined
      )
    case 'allowedValues':
      return (variable.valueLabels?.length ?? 0) > 0
    case 'structuralMissingRules':
      return (variable.structuralMissingRules?.length ?? 0) > 0
    case 'skipPatternDependencies':
      return (variable.skipPatternDependencies?.length ?? 0) > 0
    case 'nonNegativeCandidate':
      return isNonNegativeCandidate(variable)
    case 'auxiliaryVariables':
      return (context.availableAuxiliaryVariables?.length ?? 0) > 0
    case 'relatedDateVariables':
      return (context.relatedDateVariables?.length ?? 0) > 0
    case 'lengthConstraint':
      return hasLengthConstraint(variable)
    default:
      return false
  }
}

function isIdentifierVariable(variable: SurveyVariable): boolean {
  return variable.type === 'identifier' || variable.role === 'identifier'
}

function isDesignVariable(variable: SurveyVariable): boolean {
  return (
    DESIGN_ROLES.has(variable.role) ||
    variable.type === 'weight' ||
    variable.type === 'geographic_code'
  )
}

function hasStructuralMissingness(variable: SurveyVariable): boolean {
  return (
    (variable.structuralMissingRules?.length ?? 0) > 0 ||
    (variable.skipPatternDependencies?.length ?? 0) > 0
  )
}

function isImputationRule(rule: CleaningRule): boolean {
  return rule.family === 'imputation' || rule.generatedStepType === 'imputation'
}

function isOutlierRule(rule: CleaningRule): boolean {
  return (
    rule.family === 'outlier_detection' ||
    rule.family === 'outlier_treatment' ||
    rule.generatedStepType === 'outlier_flag' ||
    rule.generatedStepType === 'outlier_treatment'
  )
}

function isNonNegativeCandidate(variable: SurveyVariable): boolean {
  if (variable.validRange?.min === 0) {
    return true
  }

  if (variable.type === 'count') {
    return true
  }

  return /(^|_)(count|number|total|income|expenditure|expense|area|livestock|production|yield|amount|quantity|qty)($|_)/i.test(
    variable.name,
  )
}

function hasLengthConstraint(variable: SurveyVariable): boolean {
  const storageType = variable.storageType?.toLowerCase() ?? ''
  const originalColumns = variable.sourceMetadata?.originalColumns ?? {}

  return (
    /\b(string|str|char|varchar)\s*\(?\d+\)?/.test(storageType) ||
    ['max_length', 'length', 'valid_length'].some((columnName) =>
      Boolean(originalColumns[columnName]?.trim()),
    )
  )
}

function block(
  variable: SurveyVariable,
  rule: CleaningRule,
  code: BlockedRuleCode,
  reason: string,
): BlockedRule {
  return {
    rule,
    variableName: variable.name,
    code,
    reason,
  }
}
