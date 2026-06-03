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

export function makeStataFilename(plan: CleaningPlan): string {
  return makeScriptFilename(plan, 'stata14-cleaning-script', 'do')
}

export function quoteStataString(value: string): string {
  return `"${value.replace(/"/g, "'")}"`
}

export function formatStataValue(value: VariableValue): string {
  if (typeof value === 'string') {
    if (/^\.[a-z]$/i.test(value.trim())) {
      return value.trim().toLowerCase()
    }

    return quoteStataString(value)
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0'
  }

  return value === null ? '.' : String(value)
}

export function formatStataList(values: VariableValue[]): string {
  return values.map(formatStataValue).join(' ')
}

export function formatStataCommaList(values: VariableValue[]): string {
  return values.map(formatStataValue).join(', ')
}

export function stataComment(message: string): string {
  return `* ${message}`
}

export function renderStataTitleBlock(
  plan: CleaningPlan,
  generatedAt?: Date | string,
  language: LanguageCode = 'en',
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          stataComment(`- ${assumption}`),
        )
      : [stataComment(`- ${rendererComment(language, 'title.noAssumptions')}`)]

  return [
    stataComment(rendererComment(language, 'title.banner')),
    stataComment(rendererComment(language, 'title.name')),
    stataComment(rendererComment(language, 'title.target.stata')),
    stataComment(
      rendererComment(language, 'title.timestamp', {
        generatedAt: formatGeneratedAt(generatedAt),
      }),
    ),
    stataComment(
      rendererComment(language, 'title.plan', { title: plan.metadata.title }),
    ),
    stataComment(rendererComment(language, 'title.planId', { id: plan.id })),
    stataComment(
      rendererComment(language, 'title.planVersion', {
        version: plan.metadata.version,
      }),
    ),
    stataComment(rendererComment(language, 'title.versionAssumption.stata')),
    stataComment(rendererComment(language, 'title.assumptions')),
    ...assumptions,
    stataComment(
      rendererWarning(
        language,
        rendererComment(language, 'title.reviewWarning'),
      ),
    ),
    stataComment(rendererComment(language, 'title.noOverwrite.flags')),
    stataComment(rendererComment(language, 'title.banner')),
  ].join('\n')
}

export function renderStataStepComment(
  step: CleaningStep,
  language: LanguageCode = 'en',
): string {
  return [
    stataComment(rendererComment(language, 'step.separator')),
    stataComment(rendererComment(language, 'step.id', { id: step.id })),
    stataComment(rendererComment(language, 'step.type', { type: step.type })),
    stataComment(
      rendererComment(language, 'step.variables', {
        variables:
          step.variables.join(', ') || rendererComment(language, 'step.none'),
      }),
    ),
    stataComment(
      rendererComment(language, 'step.rationale', {
        rationale: rendererStepRationale(language, step),
      }),
    ),
    stataComment(
      rendererComment(language, 'step.citation', {
        citations: rendererCitationKeys(language, step.citationKeys),
      }),
    ),
    stataComment(
      rendererComment(language, 'step.reviewRequirement', {
        requirement: rendererReviewRequirement(language, step.requiresReview),
      }),
    ),
    stataComment(rendererComment(language, 'step.separator')),
  ].join('\n')
}

export function stataLabelName(variable: SurveyVariable): string {
  return `${variable.name}_lbl`.replace(/[^A-Za-z0-9_]+/g, '_').slice(0, 32)
}
