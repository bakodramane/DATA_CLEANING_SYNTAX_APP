import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
  RendererCapabilityMatrix,
  RendererSupportByLanguage,
  SurveyVariable,
} from '../core'
import { loadDefaultCitations, loadDefaultRules } from './defaultRules'
import {
  getApplicableRules,
  getBlockedRules,
  getRecommendedRules,
  isRecommendedByContext,
} from './ruleFilters'
import {
  createCleaningStepsFromRules,
  createPlanLevelCleaningStep,
} from './ruleToCleaningStep'
import type { CleaningRule, RuleEngineContext } from './types'

export {
  getApplicableRules,
  getBlockedRules,
  getRecommendedRules,
} from './ruleFilters'

export function createDefaultCleaningPlanFromVariables(
  variables: SurveyVariable[],
  context: RuleEngineContext = {},
): CleaningPlan {
  const rules = context.rules ?? loadDefaultRules()
  const citations = context.citations ?? loadDefaultCitations()
  const steps = createCandidateCleaningStepsFromVariables(variables, {
    ...context,
    rules,
  })
  const usedRuleIds = new Set(
    steps
      .map((step) => step.parameters.ruleId)
      .filter((ruleId): ruleId is string => typeof ruleId === 'string'),
  )
  const usedRules = rules.filter((rule) => usedRuleIds.has(rule.id))
  const citationKeys = unique(steps.flatMap((step) => step.citationKeys))
  const blockedReasons = unique(
    variables.flatMap((variable) =>
      getBlockedRules(variable, { ...context, rules }).map(
        (blockedRule) => `${blockedRule.variableName}: ${blockedRule.reason}`,
      ),
    ),
  )

  return {
    id: makePlanId(context.surveyName),
    metadata: {
      title: context.surveyName
        ? `${context.surveyName} cleaning plan`
        : 'Draft cleaning plan',
      description:
        'Draft Cleaning Plan generated from metadata and deterministic rule-library recommendations.',
      createdAt: context.generatedAt ?? 'NEEDS_GENERATION_TIMESTAMP',
      version: '0.1.0',
      assumptions: buildPlanAssumptions(context),
    },
    variables,
    steps,
    citations: citations.filter((citation) =>
      citationKeys.includes(citation.key),
    ),
    capabilityMatrix: buildCapabilityMatrix(usedRules),
    notes: blockedReasons,
  }
}

export function createCandidateCleaningStepsFromVariables(
  variables: SurveyVariable[],
  context: RuleEngineContext = {},
): CleaningStep[] {
  const rules = context.rules ?? loadDefaultRules()
  const variableSteps = variables.flatMap((variable) =>
    createCleaningStepsFromRules(
      variable,
      getRecommendedRules(variable, { ...context, rules }),
      context,
    ),
  )
  const planSteps = getRecommendedPlanRules(rules, context).map((rule) =>
    createPlanLevelCleaningStep(rule, variables),
  )

  return dedupeSteps([...variableSteps, ...planSteps])
}

export function getRecommendedPlanRules(
  rules: CleaningRule[] = loadDefaultRules(),
  context: RuleEngineContext = {},
): CleaningRule[] {
  return rules.filter(
    (rule) => rule.scope === 'plan' && isRecommendedByContext(rule, context),
  )
}

export function getRuleWarnings(
  variable: SurveyVariable,
  context: RuleEngineContext = {},
): string[] {
  return getApplicableRules(variable, context).flatMap((rule) => [
    ...(rule.warnings?.map((warning) => warning.message) ?? []),
    ...getTargetLanguageWarnings(rule, context),
  ])
}

function buildCapabilityMatrix(
  rules: CleaningRule[],
): RendererCapabilityMatrix<CleaningStepType> {
  const matrix: RendererCapabilityMatrix<CleaningStepType> = {}

  rules.forEach((rule) => {
    if (!rule.rendererSupport) {
      return
    }

    matrix[rule.generatedStepType] = mergeRendererSupport(
      matrix[rule.generatedStepType],
      rule.rendererSupport,
    )
  })

  return matrix
}

function mergeRendererSupport(
  existing: RendererSupportByLanguage | undefined,
  next: RendererSupportByLanguage,
): RendererSupportByLanguage {
  return {
    ...(existing ?? {}),
    ...next,
  }
}

function getTargetLanguageWarnings(
  rule: CleaningRule,
  context: RuleEngineContext,
): string[] {
  const targetLanguages = context.targetLanguages ?? []

  return targetLanguages.flatMap((language) => {
    const support = rule.rendererSupport?.[language]

    if (!support || support.status === 'supported') {
      return []
    }

    return [
      `Rule "${rule.label}" is ${support.status} for ${language}${support.note ? `: ${support.note}` : '.'}`,
    ]
  })
}

function buildPlanAssumptions(context: RuleEngineContext): string[] {
  return [
    'The plan proposes metadata-driven checks only; no data cleaning is executed.',
    'Generated steps prefer flagging and review over deletion or silent overwriting.',
    'Structural missing values and survey-design variables are protected by default.',
    context.imputationAllowed
      ? 'Imputation suggestions are included only where rule-library protections allow them.'
      : 'Imputation suggestions are disabled unless the rule-engine context explicitly allows them.',
  ]
}

function makePlanId(surveyName: string | undefined): string {
  const slug = (surveyName ?? 'draft-cleaning-plan')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'draft-cleaning-plan'}-rule-plan`
}

function dedupeSteps(steps: CleaningStep[]): CleaningStep[] {
  const seenIds = new Set<string>()

  return steps.filter((step) => {
    if (seenIds.has(step.id)) {
      return false
    }

    seenIds.add(step.id)
    return true
  })
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
