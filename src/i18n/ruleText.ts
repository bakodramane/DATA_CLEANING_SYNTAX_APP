import type { CleaningStep } from '../core'
import type { BlockedRule, CleaningRule, RuleWarning } from '../rules'
import { translate, translateWithFallback, type LanguageCode } from './index'

export function translateRuleLabel(
  language: LanguageCode,
  rule: CleaningRule,
): string {
  return translateWithFallback(language, ruleKey(rule, 'label'), rule.label)
}

export function translateRuleDescription(
  language: LanguageCode,
  rule: CleaningRule,
): string {
  return translateWithFallback(
    language,
    ruleKey(rule, 'description'),
    rule.description,
  )
}

export function translateRuleRationale(
  language: LanguageCode,
  rule: CleaningRule,
): string {
  return translateWithFallback(
    language,
    ruleKey(rule, 'rationale'),
    rule.rationale,
  )
}

export function translateRuleWarning(
  language: LanguageCode,
  rule: CleaningRule,
  warning: RuleWarning,
): string {
  return translateWithFallback(
    language,
    `${ruleKey(rule, 'warning')}.${warning.code}`,
    warning.message,
  )
}

export function translateBlockedRuleReason(
  language: LanguageCode,
  blockedRule: BlockedRule,
): string {
  return translateWithFallback(
    language,
    `blockedRule.${blockedRule.code}`,
    blockedRule.reason,
    {
      rule: translateRuleLabel(language, blockedRule.rule),
      variable: blockedRule.variableName,
    },
  )
}

export function translateStepRationale(
  language: LanguageCode,
  step: CleaningStep,
): string {
  const ruleId = step.parameters.ruleId
  const fallbackRationale = stripWarningSuffix(step.rationale)
  const rationale =
    typeof ruleId === 'string'
      ? translateWithFallback(
          language,
          `rule.${ruleId}.rationale`,
          fallbackRationale,
        )
      : fallbackRationale
  const warnings = ruleWarningsFromStep(step).map((warning) =>
    typeof ruleId === 'string'
      ? translateWithFallback(
          language,
          `rule.${ruleId}.warning.${warning.code}`,
          warning.message,
        )
      : warning.message,
  )

  if (warnings.length === 0) {
    return rationale
  }

  return `${rationale} ${translate(language, 'common.warning')}: ${warnings.join(
    ' ',
  )}`
}

export function ruleWarningsFromStep(
  step: CleaningStep,
): Array<{ code: string; message: string }> {
  const ruleWarnings = step.parameters.ruleWarnings

  return Array.isArray(ruleWarnings)
    ? ruleWarnings.filter(
        (warning): warning is { code: string; message: string } =>
          typeof warning === 'object' &&
          warning !== null &&
          'code' in warning &&
          typeof warning.code === 'string' &&
          'message' in warning &&
          typeof warning.message === 'string',
      )
    : []
}

function ruleKey(rule: CleaningRule, field: string): string {
  return `rule.${rule.id}.${field}`
}

function stripWarningSuffix(rationale: string): string {
  return rationale.split(' Warning: ')[0]
}
