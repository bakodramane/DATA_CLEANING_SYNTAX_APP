import type { CleaningPlan, CleaningStep } from '../../core'
import type { UnsupportedRenderedStep } from '../types'
import { formatCitationKeys } from './helpers'

export function renderTitleBlock(
  plan: CleaningPlan,
  generatedAt: string,
): string {
  const assumptions =
    plan.metadata.assumptions.length > 0
      ? plan.metadata.assumptions.map((assumption) => `# - ${assumption}`)
      : ['# - No assumptions were recorded in the Cleaning Plan.']

  return [
    '# =============================================================================',
    '# Survey Microdata Cleaning Syntax',
    '# Generated target: R',
    `# Generation timestamp: ${generatedAt}`,
    `# Cleaning Plan: ${plan.metadata.title}`,
    `# Cleaning Plan ID: ${plan.id}`,
    `# Cleaning Plan version: ${plan.metadata.version}`,
    '# Version note: Phase 2 R renderer MVP; review package versions before use.',
    '#',
    '# Assumptions:',
    ...assumptions,
    '#',
    '# WARNING: Review this generated syntax before production use.',
    '# The script flags and documents issues; it must not be treated as a black box.',
    '# =============================================================================',
  ].join('\n')
}

export function renderPackageSection(dataFrameName: string): string {
  return [
    '# Required packages:',
    '# install.packages(c("dplyr", "labelled", "mice"))',
    'library(dplyr)',
    'library(labelled)',
    'library(mice)',
    '',
    `# Expected input: a data frame named \`${dataFrameName}\`.`,
    '# Rename your imported survey dataset to this object before running the script,',
    '# or regenerate the script with a different data frame name.',
  ].join('\n')
}

export function renderStepComment(step: CleaningStep): string {
  return [
    '# -----------------------------------------------------------------------------',
    `# Step ID: ${step.id}`,
    `# Step type: ${step.type}`,
    `# Variables: ${step.variables.join(', ') || 'None'}`,
    `# Rationale: ${step.rationale}`,
    `# Citation: ${formatCitationKeys(step.citationKeys)}`,
    `# Review requirement: ${
      step.requiresReview ? 'Requires user review' : 'Automatic step'
    }`,
    '# -----------------------------------------------------------------------------',
  ].join('\n')
}

export function renderWarningComment(message: string): string {
  return `# WARNING: ${message}`
}

export function renderUnsupportedStepComment(
  step: CleaningStep,
  unsupportedStep: UnsupportedRenderedStep,
): string {
  return [
    renderStepComment(step),
    renderWarningComment(unsupportedStep.reason),
  ].join('\n')
}
