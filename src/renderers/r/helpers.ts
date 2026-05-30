import type {
  CleaningPlan,
  CleaningStep,
  SurveyVariable,
  VariableType,
  VariableValue,
} from '../../core'

const NUMERIC_VARIABLE_TYPES = new Set<VariableType>([
  'continuous',
  'count',
  'binary',
  'nominal',
  'ordinal',
  'weight',
])

const INTEGER_VARIABLE_TYPES = new Set<VariableType>([
  'count',
  'binary',
  'nominal',
  'ordinal',
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

export function makeFilename(plan: CleaningPlan): string {
  const slug = plan.metadata.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || plan.id}-r-cleaning-script.R`
}

export function quoteRString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function formatRValue(value: VariableValue): string {
  if (value === null) {
    return 'NA'
  }

  if (typeof value === 'string') {
    return quoteRString(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  return Number.isFinite(value) ? String(value) : 'NA_real_'
}

export function formatRVector(values: VariableValue[]): string {
  return `c(${values.map(formatRValue).join(', ')})`
}

export function formatRCharacterVector(values: string[]): string {
  return `c(${values.map(quoteRString).join(', ')})`
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

export function naLiteralForVariable(variable: SurveyVariable): string {
  const storageType = variable.storageType?.toLowerCase()

  if (variable.type === 'string' || storageType?.includes('string')) {
    return 'NA_character_'
  }

  if (variable.type === 'date') {
    return 'as.Date(NA)'
  }

  if (
    INTEGER_VARIABLE_TYPES.has(variable.type) ||
    storageType?.includes('int')
  ) {
    return 'NA_integer_'
  }

  if (
    NUMERIC_VARIABLE_TYPES.has(variable.type) ||
    storageType?.includes('num')
  ) {
    return 'NA_real_'
  }

  return 'NA'
}

export function rVariableReference(
  dataFrameName: string,
  variableName: string,
): string {
  return `${dataFrameName}$${variableName}`
}

export function isContinuousOutlierVariable(variable: SurveyVariable): boolean {
  return variable.type === 'continuous' || variable.type === 'count'
}

export function methodForMice(variable: SurveyVariable): string {
  switch (variable.type) {
    case 'continuous':
    case 'count':
    case 'weight':
      return 'pmm'
    case 'binary':
      return 'logreg'
    case 'nominal':
      return 'polyreg'
    case 'ordinal':
      return 'polr'
    default:
      return ''
  }
}

export function unique(values: string[]): string[] {
  return [...new Set(values)]
}
