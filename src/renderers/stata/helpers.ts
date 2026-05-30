import type {
  CleaningPlan,
  CleaningStep,
  SurveyVariable,
  VariableValue,
} from '../../core'
import {
  formatCitationKeys,
  formatGeneratedAt,
  makeScriptFilename,
} from '../helpers'

export function makeStataFilename(plan: CleaningPlan): string {
  return makeScriptFilename(plan, 'stata14-cleaning-script', 'do')
}

export function quoteStataString(value: string): string {
  return `"${value.replace(/"/g, "'")}"`
}

export function formatStataValue(value: VariableValue): string {
  if (typeof value === 'string') {
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
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          stataComment(`- ${assumption}`),
        )
      : [stataComment('- No assumptions were recorded in the Cleaning Plan')]

  return [
    stataComment(
      '=============================================================================',
    ),
    stataComment('Survey Microdata Cleaning Syntax'),
    stataComment('Generated target: Stata v14 do-file syntax'),
    stataComment(`Generation timestamp: ${formatGeneratedAt(generatedAt)}`),
    stataComment(`Cleaning Plan: ${plan.metadata.title}`),
    stataComment(`Cleaning Plan ID: ${plan.id}`),
    stataComment(`Cleaning Plan version: ${plan.metadata.version}`),
    stataComment('Version assumption: Stata v14'),
    stataComment('Assumptions:'),
    ...assumptions,
    stataComment('WARNING: Review this generated syntax before production use'),
    stataComment(
      'No records are deleted and validation checks write flag variables',
    ),
    stataComment(
      '=============================================================================',
    ),
  ].join('\n')
}

export function renderStataStepComment(step: CleaningStep): string {
  return [
    stataComment(
      '-----------------------------------------------------------------------------',
    ),
    stataComment(`Step ID: ${step.id}`),
    stataComment(`Step type: ${step.type}`),
    stataComment(`Variables: ${step.variables.join(', ') || 'None'}`),
    stataComment(`Rationale: ${step.rationale}`),
    stataComment(`Citation: ${formatCitationKeys(step.citationKeys)}`),
    stataComment(
      `Review requirement: ${step.requiresReview ? 'Requires user review' : 'Automatic step'}`,
    ),
    stataComment(
      '-----------------------------------------------------------------------------',
    ),
  ].join('\n')
}

export function stataLabelName(variable: SurveyVariable): string {
  return `${variable.name}_lbl`.replace(/[^A-Za-z0-9_]+/g, '_').slice(0, 32)
}
