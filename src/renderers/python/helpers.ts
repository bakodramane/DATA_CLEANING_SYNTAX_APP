import type { CleaningPlan, CleaningStep, VariableValue } from '../../core'
import {
  formatCitationKeys,
  formatGeneratedAt,
  makeScriptFilename,
} from '../helpers'

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
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          pythonComment(`- ${assumption}`),
        )
      : [pythonComment('- No assumptions were recorded in the Cleaning Plan')]

  return [
    pythonComment(
      '=============================================================================',
    ),
    pythonComment('Survey Microdata Cleaning Syntax'),
    pythonComment('Generated target: Python script'),
    pythonComment(`Generation timestamp: ${formatGeneratedAt(generatedAt)}`),
    pythonComment(`Cleaning Plan: ${plan.metadata.title}`),
    pythonComment(`Cleaning Plan ID: ${plan.id}`),
    pythonComment(`Cleaning Plan version: ${plan.metadata.version}`),
    pythonComment(
      'Version assumption: pandas/numpy plus scikit-learn for practical imputation',
    ),
    pythonComment('Assumptions:'),
    ...assumptions,
    pythonComment(
      'WARNING: Review this generated syntax before production use',
    ),
    pythonComment(
      'No records are deleted and validation checks write flag variables',
    ),
    pythonComment(
      '=============================================================================',
    ),
  ].join('\n')
}

export function renderPythonPackageSection(dataFrameName: string): string {
  return [
    pythonComment('Required packages:'),
    pythonComment('pip install pandas numpy scikit-learn statsmodels'),
    'import numpy as np',
    'import pandas as pd',
    'from sklearn.experimental import enable_iterative_imputer  # noqa: F401',
    'from sklearn.impute import IterativeImputer',
    '',
    pythonComment(`Expected input: a pandas DataFrame named ${dataFrameName}.`),
  ].join('\n')
}

export function renderPythonStepComment(step: CleaningStep): string {
  return [
    pythonComment(
      '-----------------------------------------------------------------------------',
    ),
    pythonComment(`Step ID: ${step.id}`),
    pythonComment(`Step type: ${step.type}`),
    pythonComment(`Variables: ${step.variables.join(', ') || 'None'}`),
    pythonComment(`Rationale: ${step.rationale}`),
    pythonComment(`Citation: ${formatCitationKeys(step.citationKeys)}`),
    pythonComment(
      `Review requirement: ${step.requiresReview ? 'Requires user review' : 'Automatic step'}`,
    ),
    pythonComment(
      '-----------------------------------------------------------------------------',
    ),
  ].join('\n')
}
