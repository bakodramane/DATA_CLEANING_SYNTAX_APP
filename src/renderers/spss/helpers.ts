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
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) =>
          spssComment(`- ${assumption}`),
        )
      : [spssComment('- No assumptions were recorded in the Cleaning Plan')]

  return [
    spssComment(
      '=============================================================================',
    ),
    spssComment('Survey Microdata Cleaning Syntax'),
    spssComment('Generated target: SPSS v18 command syntax'),
    spssComment(`Generation timestamp: ${formatGeneratedAt(generatedAt)}`),
    spssComment(`Cleaning Plan: ${plan.metadata.title}`),
    spssComment(`Cleaning Plan ID: ${plan.id}`),
    spssComment(`Cleaning Plan version: ${plan.metadata.version}`),
    spssComment('Version assumption: IBM SPSS Statistics v18 command syntax'),
    spssComment('Assumptions:'),
    ...assumptions,
    spssComment('WARNING: Review this generated syntax before production use'),
    spssComment(
      'No records are deleted and source variables are not overwritten by validation checks',
    ),
    spssComment(
      '=============================================================================',
    ),
  ].join('\n')
}

export function renderSpssStepComment(step: CleaningStep): string {
  return [
    spssComment(
      '-----------------------------------------------------------------------------',
    ),
    spssComment(`Step ID: ${step.id}`),
    spssComment(`Step type: ${step.type}`),
    spssComment(`Variables: ${step.variables.join(', ') || 'None'}`),
    spssComment(`Rationale: ${step.rationale}`),
    spssComment(`Citation: ${formatCitationKeys(step.citationKeys)}`),
    spssComment(
      `Review requirement: ${step.requiresReview ? 'Requires user review' : 'Automatic step'}`,
    ),
    spssComment(
      '-----------------------------------------------------------------------------',
    ),
  ].join('\n')
}

export function spssVariableLabel(variable: SurveyVariable): string {
  return `VARIABLE LABELS ${variable.name} ${quoteSpssString(variable.label)}.`
}

export function spssFlagLabel(variableName: string, label: string): string {
  return `VARIABLE LABELS ${variableName} ${quoteSpssString(label)}.`
}
