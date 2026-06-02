import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
  SurveyVariable,
  VariableValue,
  VariableType,
} from '../core'
import type { TargetLanguage } from '../core/models'
import {
  DOCUMENTED_RENDERER_STEP_TYPES,
  getRendererCapability,
} from './capabilities'
import type { UnsupportedRenderedStep } from './types'

export const MVP_RENDERED_STEP_TYPES = new Set<CleaningStepType>(
  DOCUMENTED_RENDERER_STEP_TYPES.filter((stepType) =>
    ['spss18', 'stata14', 'r', 'python'].some(
      (language) =>
        getRendererCapability(stepType, language as TargetLanguage).status !==
        'unsupported',
    ),
  ),
)

export const IMPUTABLE_VARIABLE_TYPES = new Set<VariableType>([
  'continuous',
  'count',
  'binary',
  'nominal',
  'ordinal',
  'weight',
])

export function indexVariables(
  variables: SurveyVariable[],
): Map<string, SurveyVariable> {
  return new Map(variables.map((variable) => [variable.name, variable]))
}

export function findStepVariables(
  step: CleaningStep,
  variablesByName: Map<string, SurveyVariable>,
): SurveyVariable[] {
  return step.variables.flatMap((variableName) => {
    const variable = variablesByName.get(variableName)
    return variable ? [variable] : []
  })
}

export function formatGeneratedAt(generatedAt?: Date | string): string {
  if (generatedAt instanceof Date) {
    return generatedAt.toISOString()
  }

  return generatedAt ?? new Date().toISOString()
}

export function makeScriptFilename(
  plan: CleaningPlan,
  suffix: string,
  extension: string,
): string {
  const slug = plan.metadata.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || plan.id}-${suffix}.${extension}`
}

export function formatCitationKeys(citationKeys: string[]): string {
  return citationKeys.length > 0 ? citationKeys.join(', ') : 'None provided'
}

export function flagName(
  variable: SurveyVariable,
  suffix: string,
  method?: string,
): string {
  return ['flag', variable.name, suffix, method]
    .filter((part): part is string => Boolean(part))
    .join('_')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
}

export function missingIndicatorName(variable: SurveyVariable): string {
  return `missing_${variable.name}`.replace(/[^a-zA-Z0-9_]+/g, '_')
}

export function normalizeMethodName(value: unknown): string | undefined {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_')
    : undefined
}

export function numberParameter(
  step: CleaningStep,
  name: string,
): number | undefined {
  const value = step.parameters[name]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function numberOrStringParameter(
  step: CleaningStep,
  name: string,
): number | string | undefined {
  const value = step.parameters[name]
  return typeof value === 'number' || typeof value === 'string'
    ? value
    : undefined
}

export function stringParameter(
  step: CleaningStep,
  names: string | string[],
): string | undefined {
  const parameterNames = Array.isArray(names) ? names : [names]

  for (const name of parameterNames) {
    const value = step.parameters[name]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

export function stringArrayParameter(
  step: CleaningStep,
  name: string,
): string[] {
  const value = step.parameters[name]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export function variableValueArrayParameter(
  step: CleaningStep,
  name: string,
): VariableValue[] {
  const value = step.parameters[name]
  return Array.isArray(value)
    ? value.filter(
        (item): item is VariableValue =>
          item === null ||
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean',
      )
    : []
}

export function allowedDomainValues(
  step: CleaningStep,
  variable: SurveyVariable,
): VariableValue[] {
  const explicitValues = variableValueArrayParameter(step, 'allowedValues')

  if (explicitValues.length > 0) {
    return explicitValues
  }

  return [
    ...(variable.valueLabels?.map((label) => label.value) ?? []),
    ...(variable.declaredMissingCodes?.map(
      (missingCode) => missingCode.value,
    ) ?? []),
  ]
}

export function isContinuousOutlierVariable(variable: SurveyVariable): boolean {
  return variable.type === 'continuous' || variable.type === 'count'
}

export function isIdentifierVariable(variable: SurveyVariable): boolean {
  return variable.type === 'identifier' || variable.role === 'identifier'
}

export function canImputeVariable(variable: SurveyVariable): boolean {
  return (
    !isIdentifierVariable(variable) &&
    IMPUTABLE_VARIABLE_TYPES.has(variable.type)
  )
}

export function selectsStructuralMissing(
  parameters: Record<string, unknown>,
): boolean {
  if (
    parameters.includeStructuralMissing === true ||
    parameters.imputeStructuralMissing === true ||
    parameters.imputesStructuralMissing === true
  ) {
    return true
  }

  return [
    parameters.targetMissingness,
    parameters.missingnessTypes,
    parameters.missingValueTypes,
    parameters.selectedMissingness,
  ]
    .flatMap((value) => {
      if (typeof value === 'string') {
        return [value]
      }

      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string')
      }

      return []
    })
    .some((value) =>
      ['structural', 'structural_missing', 'all'].includes(
        value.trim().toLowerCase(),
      ),
    )
}

export function conditionParameter(step: CleaningStep): string | undefined {
  return stringParameter(step, [
    'condition',
    'expression',
    'invalidCondition',
    'checkExpression',
    'logicalCondition',
  ])
}

export function structuralMissingCondition(
  step: CleaningStep,
  variable: SurveyVariable,
): string | undefined {
  return (
    conditionParameter(step) ??
    variable.structuralMissingRules?.find((rule) => rule.condition)?.condition
  )
}

export function skipPatternCondition(
  step: CleaningStep,
  variable: SurveyVariable,
): string | undefined {
  return (
    conditionParameter(step) ??
    variable.skipPatternDependencies?.find((dependency) => dependency.condition)
      ?.condition
  )
}

export function stepFlagName(step: CleaningStep, suffix: string): string {
  return `flag_${step.id}_${suffix}`
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export function duplicateFlagName(step: CleaningStep): string {
  return stepFlagName(step, 'duplicate_id').slice(0, 48)
}

export function translateConditionExpression(
  condition: string,
  variables: SurveyVariable[],
  language: TargetLanguage,
  dataFrameName?: string,
): string {
  let translated = condition.trim()

  if (language === 'spss18') {
    return translated
      .replace(/!=/g, '<>')
      .replace(/==/g, '=')
      .replace(/&&/g, ' AND ')
      .replace(/\|\|/g, ' OR ')
  }

  if (language === 'r' || language === 'python') {
    translated = translated.replace(/&&/g, ' & ').replace(/\|\|/g, ' | ')

    variables
      .map((variable) => variable.name)
      .sort((left, right) => right.length - left.length)
      .forEach((variableName) => {
        const escapedName = escapeRegExp(variableName)
        const reference =
          language === 'r'
            ? `${dataFrameName ?? 'data'}$${variableName}`
            : `${dataFrameName ?? 'data'}[${JSON.stringify(variableName)}]`

        translated = translated.replace(
          new RegExp(`\\b${escapedName}\\b`, 'g'),
          reference,
        )
      })
  }

  return translated
}

export function isStataExtendedMissingValue(value: VariableValue): boolean {
  return typeof value === 'string' && /^\.[a-z]$/i.test(value.trim())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export function defaultImputationPredictors(
  variablesByName: Map<string, SurveyVariable>,
  step: CleaningStep,
): string[] {
  const explicitPredictors = stringArrayParameter(step, 'predictorVariables')

  if (explicitPredictors.length > 0) {
    return explicitPredictors
  }

  return [...variablesByName.values()]
    .filter(
      (variable) =>
        !['identifier', 'psu', 'stratum', 'metadata'].includes(variable.role) &&
        canImputeVariable(variable),
    )
    .map((variable) => variable.name)
}

export function createUnsupportedStep(
  step: CleaningStep,
  rendererName: string,
): UnsupportedRenderedStep {
  return {
    id: step.id,
    type: step.type,
    reason: `Step type "${step.type}" is not yet supported by the current ${rendererName} renderer.`,
  }
}
