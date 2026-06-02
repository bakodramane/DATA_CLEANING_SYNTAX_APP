import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
  SurveyVariable,
  VariableType,
  VariableValue,
} from '../core'
import type { UnsupportedRenderedStep } from './types'

export const MVP_RENDERED_STEP_TYPES = new Set<CleaningStepType>([
  'variable_label',
  'value_label',
  'missing_value_declaration',
  'range_check',
  'domain_check',
  'outlier_flag',
  'missingness_diagnosis',
  'imputation',
])

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
