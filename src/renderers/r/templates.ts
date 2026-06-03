import type { CleaningPlan, CleaningStep } from '../../core'
import {
  rendererCitationKeys,
  rendererComment,
  rendererReviewRequirement,
  rendererStepRationale,
  rendererWarning,
  type LanguageCode,
} from '../../i18n'
import type { UnsupportedRenderedStep } from '../types'

export function renderTitleBlock(
  plan: CleaningPlan,
  generatedAt: string,
  language: LanguageCode = 'en',
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) => `# - ${assumption}`)
      : [`# - ${rendererComment(language, 'title.noAssumptions')}.`]

  return [
    '# =============================================================================',
    `# ${rendererComment(language, 'title.name')}`,
    `# ${rendererComment(language, 'title.target.r')}`,
    `# ${rendererComment(language, 'title.timestamp', { generatedAt })}`,
    `# ${rendererComment(language, 'title.plan', { title: plan.metadata.title })}`,
    `# ${rendererComment(language, 'title.planId', { id: plan.id })}`,
    `# ${rendererComment(language, 'title.planVersion', {
      version: plan.metadata.version,
    })}`,
    `# ${rendererComment(language, 'title.versionNote.r')}`,
    '#',
    `# ${rendererComment(language, 'title.assumptions')}`,
    ...assumptions,
    '#',
    `# ${rendererWarning(
      language,
      rendererComment(language, 'title.reviewWarning'),
    )}.`,
    `# ${rendererComment(language, 'title.rBlackBox')}`,
    '# =============================================================================',
  ].join('\n')
}

export function renderPackageSection(
  dataFrameName: string,
  language: LanguageCode = 'en',
): string {
  return [
    `# ${rendererComment(language, 'packages.required')}`,
    `# ${rendererComment(language, 'packages.rInstall')}`,
    'library(dplyr)',
    'library(labelled)',
    'library(mice)',
    '',
    `# ${rendererComment(language, 'packages.expectedInput.r', {
      dataFrameName,
    })}`,
    `# ${rendererComment(language, 'packages.rename.r')}`,
    `# ${rendererComment(language, 'packages.regenerate.r')}`,
  ].join('\n')
}

export function renderStepComment(
  step: CleaningStep,
  language: LanguageCode = 'en',
): string {
  return [
    '# -----------------------------------------------------------------------------',
    `# ${rendererComment(language, 'step.id', { id: step.id })}`,
    `# ${rendererComment(language, 'step.type', { type: step.type })}`,
    `# ${rendererComment(language, 'step.variables', {
      variables:
        step.variables.join(', ') || rendererComment(language, 'step.none'),
    })}`,
    `# ${rendererComment(language, 'step.rationale', {
      rationale: rendererStepRationale(language, step),
    })}`,
    `# ${rendererComment(language, 'step.citation', {
      citations: rendererCitationKeys(language, step.citationKeys),
    })}`,
    `# ${rendererComment(language, 'step.reviewRequirement', {
      requirement: rendererReviewRequirement(language, step.requiresReview),
    })}`,
    '# -----------------------------------------------------------------------------',
  ].join('\n')
}

export function renderWarningComment(
  message: string,
  language: LanguageCode = 'en',
): string {
  return `# ${rendererWarning(language, message)}`
}

export function renderUnsupportedStepComment(
  step: CleaningStep,
  unsupportedStep: UnsupportedRenderedStep,
  language: LanguageCode = 'en',
): string {
  return [
    renderStepComment(step, language),
    renderWarningComment(unsupportedStep.reason, language),
  ].join('\n')
}
