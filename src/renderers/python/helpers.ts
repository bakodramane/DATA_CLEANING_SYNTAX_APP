import type { CleaningPlan, CleaningStep, VariableValue } from '../../core'
import {
  rendererCitationKeys,
  rendererComment,
  rendererReviewRequirement,
  rendererStepRationale,
  rendererWarning,
  type LanguageCode,
} from '../../i18n'
import { formatGeneratedAt, makeScriptFilename } from '../helpers'

export function makePythonFilename(plan: CleaningPlan): string {
  return makeScriptFilename(plan, 'python-cleaning-script', 'py')
}

export function quotePythonString(value: string): string {
  return JSON.stringify(value)
}

export function formatPythonValue(value: VariableValue): string {
  if (typeof value === 'string') {
    return quotePythonString(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False'
  }

  return value === null ? 'None' : String(value)
}

export function formatPythonList(values: VariableValue[]): string {
  return `[${values.map(formatPythonValue).join(', ')}]`
}

export function pythonComment(message: string): string {
  return `# ${message}`
}

export function renderPythonTitleBlock(
  plan: CleaningPlan,
  generatedAt?: Date | string,
  language: LanguageCode = 'en',
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          pythonComment(`- ${assumption}`),
        )
      : [pythonComment(`- ${rendererComment(language, 'title.noAssumptions')}`)]

  return [
    pythonComment(rendererComment(language, 'title.banner')),
    pythonComment(rendererComment(language, 'title.name')),
    pythonComment(rendererComment(language, 'title.target.python')),
    pythonComment(
      rendererComment(language, 'title.timestamp', {
        generatedAt: formatGeneratedAt(generatedAt),
      }),
    ),
    pythonComment(
      rendererComment(language, 'title.plan', { title: plan.metadata.title }),
    ),
    pythonComment(rendererComment(language, 'title.planId', { id: plan.id })),
    pythonComment(
      rendererComment(language, 'title.planVersion', {
        version: plan.metadata.version,
      }),
    ),
    pythonComment(rendererComment(language, 'title.versionAssumption.python')),
    pythonComment(rendererComment(language, 'title.assumptions')),
    ...assumptions,
    pythonComment(
      rendererWarning(
        language,
        rendererComment(language, 'title.reviewWarning'),
      ),
    ),
    pythonComment(rendererComment(language, 'title.noOverwrite.flags')),
    pythonComment(rendererComment(language, 'title.banner')),
  ].join('\n')
}

export function renderPythonPackageSection(
  dataFrameName: string,
  language: LanguageCode = 'en',
): string {
  return [
    pythonComment(rendererComment(language, 'packages.required')),
    pythonComment(rendererComment(language, 'packages.pythonInstall')),
    'import numpy as np',
    'import pandas as pd',
    'from sklearn.experimental import enable_iterative_imputer  # noqa: F401',
    'from sklearn.impute import IterativeImputer',
    '',
    pythonComment(
      rendererComment(language, 'packages.expectedInput.python', {
        dataFrameName,
      }),
    ),
  ].join('\n')
}

export function renderPythonStepComment(
  step: CleaningStep,
  language: LanguageCode = 'en',
): string {
  return [
    pythonComment(rendererComment(language, 'step.separator')),
    pythonComment(rendererComment(language, 'step.id', { id: step.id })),
    pythonComment(rendererComment(language, 'step.type', { type: step.type })),
    pythonComment(
      rendererComment(language, 'step.variables', {
        variables:
          step.variables.join(', ') || rendererComment(language, 'step.none'),
      }),
    ),
    pythonComment(
      rendererComment(language, 'step.rationale', {
        rationale: rendererStepRationale(language, step),
      }),
    ),
    pythonComment(
      rendererComment(language, 'step.citation', {
        citations: rendererCitationKeys(language, step.citationKeys),
      }),
    ),
    pythonComment(
      rendererComment(language, 'step.reviewRequirement', {
        requirement: rendererReviewRequirement(language, step.requiresReview),
      }),
    ),
    pythonComment(rendererComment(language, 'step.separator')),
  ].join('\n')
}
