import type {
  CleaningStep,
  CleaningStepParameters,
  SurveyVariable,
  VariableValue,
} from '../core'
import type { CleaningRule, RuleEngineContext } from './types'

export function createCleaningStepsFromRules(
  variable: SurveyVariable,
  rules: CleaningRule[],
  context: RuleEngineContext = {},
): CleaningStep[] {
  return rules.map((rule) =>
    createCleaningStepFromRule(variable, rule, context),
  )
}

export function createCleaningStepFromRule(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext = {},
): CleaningStep {
  return {
    id: makeStepId(variable.name, rule.id),
    type: rule.generatedStepType,
    variables: [variable.name],
    parameters: buildStepParameters(variable, rule, context),
    rationale: buildRationale(rule),
    citationKeys: rule.citationKeys,
    severity: rule.severity,
    defaultAction: rule.defaultAction,
    isAutomatic: rule.isAutomatic,
    requiresReview: rule.requiresReview,
    rendererSupport: rule.rendererSupport ?? {},
  }
}

export function createPlanLevelCleaningStep(
  rule: CleaningRule,
  variables: SurveyVariable[],
): CleaningStep {
  const affectedVariables = variables
    .filter((variable) => variable.role !== 'metadata')
    .map((variable) => variable.name)

  return {
    id: `step_plan_${safeId(rule.id)}`,
    type: rule.generatedStepType,
    variables: affectedVariables,
    parameters: {
      ...(rule.parameters ?? {}),
      ruleId: rule.id,
      ruleFamily: rule.family,
      ruleWarnings: rule.warnings ?? [],
    },
    rationale: buildRationale(rule),
    citationKeys: rule.citationKeys,
    severity: rule.severity,
    defaultAction: rule.defaultAction,
    isAutomatic: rule.isAutomatic,
    requiresReview: rule.requiresReview,
    rendererSupport: rule.rendererSupport ?? {},
  }
}

function buildStepParameters(
  variable: SurveyVariable,
  rule: CleaningRule,
  context: RuleEngineContext,
): CleaningStepParameters {
  const parameters: CleaningStepParameters = {
    ...(rule.parameters ?? {}),
    ruleId: rule.id,
    ruleFamily: rule.family,
  }

  if (rule.warnings && rule.warnings.length > 0) {
    parameters.ruleWarnings = rule.warnings
  }

  if (rule.generatedStepType === 'range_check') {
    parameters.min ??= variable.validRange?.min
    parameters.max ??= variable.validRange?.max
  }

  if (rule.generatedStepType === 'domain_check') {
    parameters.allowedValues ??= getAllowedValues(variable)
  }

  if (rule.generatedStepType === 'missing_value_declaration') {
    parameters.missingCodes ??= variable.declaredMissingCodes?.map(
      (missingCode) => missingCode.value,
    )
  }

  if (rule.generatedStepType === 'structural_missing_check') {
    parameters.structuralRules ??= variable.structuralMissingRules ?? []
    parameters.protectFromImputation ??= true
  }

  if (rule.generatedStepType === 'skip_pattern_check') {
    parameters.skipPatternDependencies ??=
      variable.skipPatternDependencies ?? []
    parameters.protectFromImputation ??= true
  }

  if (rule.generatedStepType === 'missingness_diagnosis') {
    parameters.createIndicators ??= context.strictnessLevel === 'strict'
    parameters.distinguishStructuralMissing ??=
      (variable.structuralMissingRules?.length ?? 0) > 0 ||
      (variable.skipPatternDependencies?.length ?? 0) > 0
  }

  if (rule.generatedStepType === 'imputation') {
    parameters.includeStructuralMissing ??= false
    parameters.predictorVariables ??= context.availableAuxiliaryVariables ?? []
  }

  if (rule.generatedStepType === 'duplicate_id_check') {
    parameters.identifierRole ??= variable.role
  }

  return parameters
}

function buildRationale(rule: CleaningRule): string {
  const warnings = rule.warnings?.map((warning) => warning.message) ?? []

  if (warnings.length === 0) {
    return rule.rationale
  }

  return `${rule.rationale} Warning: ${warnings.join(' ')}`
}

function getAllowedValues(variable: SurveyVariable): VariableValue[] {
  return [
    ...(variable.valueLabels?.map((label) => label.value) ?? []),
    ...(variable.declaredMissingCodes?.map(
      (missingCode) => missingCode.value,
    ) ?? []),
  ]
}

function makeStepId(variableName: string, ruleId: string): string {
  return `step_${safeId(variableName)}_${safeId(ruleId)}`
}

function safeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
