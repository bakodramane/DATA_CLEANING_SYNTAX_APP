import type { Citation } from '../core'
import defaultCitationsConfig from './config/default-citations.json'
import defaultRulesConfig from './config/default-rules.json'
import type {
  CleaningRule,
  RuleLibrary,
  RuleValidationIssue,
  RuleValidationResult,
} from './types'

export const defaultRules = defaultRulesConfig as CleaningRule[]
export const defaultCitations = defaultCitationsConfig as Citation[]

export function loadDefaultRules(): CleaningRule[] {
  return clone(defaultRules)
}

export function loadDefaultCitations(): Citation[] {
  return clone(defaultCitations)
}

export function loadDefaultRuleLibrary(): RuleLibrary {
  return {
    rules: loadDefaultRules(),
    citations: loadDefaultCitations(),
  }
}

export function validateRuleLibrary(
  rules: CleaningRule[] = defaultRules,
): RuleValidationResult {
  const issues: RuleValidationIssue[] = []
  const seenRuleIds = new Set<string>()

  rules.forEach((rule) => {
    if (!rule.id) {
      issues.push({ message: 'Rule is missing an ID.' })
      return
    }

    if (seenRuleIds.has(rule.id)) {
      issues.push({
        ruleId: rule.id,
        message: `Rule ID "${rule.id}" is duplicated.`,
      })
    }

    seenRuleIds.add(rule.id)

    if (!rule.label) {
      issues.push({ ruleId: rule.id, message: 'Rule is missing a label.' })
    }

    if (!rule.rationale) {
      issues.push({
        ruleId: rule.id,
        message: 'Rule is missing a plain-language rationale.',
      })
    }

    if (!rule.citationKeys || rule.citationKeys.length === 0) {
      issues.push({
        ruleId: rule.id,
        message: 'Rule must include at least one citation key.',
      })
    }
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}

function clone<TValue>(value: TValue): TValue {
  return JSON.parse(JSON.stringify(value)) as TValue
}
