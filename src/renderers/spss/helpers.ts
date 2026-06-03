import type {
  CleaningPlan,
  CleaningStep,
  SurveyVariable,
  VariableValue,
} from '../../core'
import {
  rendererCitationKeys,
  rendererComment,
  rendererReviewRequirement,
  rendererStepRationale,
  rendererWarning,
  type LanguageCode,
} from '../../i18n'
import { formatGeneratedAt, makeScriptFilename } from '../helpers'

export function makeSpssFilename(plan: CleaningPlan): string {
  return makeScriptFilename(plan, 'spss18-cleaning-script', 'sps')
}

export function quoteSpssString(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function formatSpssValue(value: VariableValue): string {
  if (typeof value === 'string') {
    return quoteSpssString(value)
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0'
  }

  return value === null ? 'SYSMIS' : String(value)
}

export function formatSpssList(values: VariableValue[]): string {
  return values.map(formatSpssValue).join(', ')
}

export function spssComment(message: string): string {
  const trimmedMessage = message.trim()
  const suffix = /[.!?]$/.test(trimmedMessage) ? '' : '.'

  return `* ${trimmedMessage}${suffix}`
}

export function renderSpssTitleBlock(
  plan: CleaningPlan,
  generatedAt?: Date | string,
  language: LanguageCode = 'en',
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          spssComment(`- ${assumption}`),
        )
      : [spssComment(`- ${rendererComment(language, 'title.noAssumptions')}`)]

  return [
    spssComment(rendererComment(language, 'title.banner')),
    spssComment(rendererComment(language, 'title.name')),
    spssComment(rendererComment(language, 'title.target.spss')),
    spssComment(
      rendererComment(language, 'title.timestamp', {
        generatedAt: formatGeneratedAt(generatedAt),
      }),
    ),
    spssComment(
      rendererComment(language, 'title.plan', { title: plan.metadata.title }),
    ),
    spssComment(rendererComment(language, 'title.planId', { id: plan.id })),
    spssComment(
      rendererComment(language, 'title.planVersion', {
        version: plan.metadata.version,
      }),
    ),
    spssComment(rendererComment(language, 'title.versionAssumption.spss')),
    spssComment(rendererComment(language, 'title.assumptions')),
    ...assumptions,
    spssComment(
      rendererWarning(
        language,
        rendererComment(language, 'title.reviewWarning'),
      ),
    ),
    spssComment(rendererComment(language, 'title.noOverwrite.spss')),
    spssComment(rendererComment(language, 'title.banner')),
  ].join('\n')
}

export function renderSpssStepComment(
  step: CleaningStep,
  language: LanguageCode = 'en',
): string {
  return [
    spssComment(rendererComment(language, 'step.separator')),
    spssComment(rendererComment(language, 'step.id', { id: step.id })),
    spssComment(rendererComment(language, 'step.type', { type: step.type })),
    spssComment(
      rendererComment(language, 'step.variables', {
        variables:
          step.variables.join(', ') || rendererComment(language, 'step.none'),
      }),
    ),
    spssComment(
      rendererComment(language, 'step.rationale', {
        rationale: rendererStepRationale(language, step),
      }),
    ),
    spssComment(
      rendererComment(language, 'step.citation', {
        citations: rendererCitationKeys(language, step.citationKeys),
      }),
    ),
    spssComment(
      rendererComment(language, 'step.reviewRequirement', {
        requirement: rendererReviewRequirement(language, step.requiresReview),
      }),
    ),
    spssComment(rendererComment(language, 'step.separator')),
  ].join('\n')
}

export function spssVariableLabel(variable: SurveyVariable): string {
  return `VARIABLE LABELS ${variable.name} ${quoteSpssString(variable.label)}.`
}

export function spssFlagLabel(variableName: string, label: string): string {
  return `VARIABLE LABELS ${variableName} ${quoteSpssString(label)}.`
}
