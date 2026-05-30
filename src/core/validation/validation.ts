import type { CleaningPlan, CleaningStep } from '../cleaning-plan'
import { isCleaningStepType } from '../cleaning-plan'
import type { SurveyVariable, VariableType } from '../models'
import { isVariableType } from '../models'

export const VALIDATION_ISSUE_CODES = [
  'invalid_variable_name',
  'duplicate_variable_name',
  'unsupported_variable_type',
  'invalid_cleaning_step',
  'missing_step_variable',
  'identifier_imputation',
  'invalid_outlier_method_for_type',
  'structural_missing_imputation',
] as const

export type ValidationIssueCode = (typeof VALIDATION_ISSUE_CODES)[number]

export type ValidationIssueSeverity = 'error' | 'warning'

export interface ValidationIssue {
  code: ValidationIssueCode
  severity: ValidationIssueSeverity
  message: string
  path?: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
const OUTLIER_STEP_TYPES = new Set(['outlier_flag', 'outlier_treatment'])
const CONTINUOUS_OUTLIER_METHODS = new Set([
  'tukey',
  'tukey_fences',
  'mad',
  'mad_robust',
  'adjusted_boxplot',
  'hidiroglou_berthelot',
])
const CONTINUOUS_OUTLIER_VARIABLE_TYPES = new Set<VariableType>([
  'continuous',
  'count',
  'weight',
])

export function isValidVariableName(name: string): boolean {
  return VARIABLE_NAME_PATTERN.test(name)
}

export function validateVariableNames(
  variables: SurveyVariable[],
): ValidationIssue[] {
  return variables.flatMap((variable, index) => {
    if (isValidVariableName(variable.name)) {
      return []
    }

    return [
      {
        code: 'invalid_variable_name',
        severity: 'error',
        message: `Variable name "${variable.name}" must start with a letter or underscore and contain only letters, numbers, and underscores.`,
        path: `variables[${index}].name`,
      } satisfies ValidationIssue,
    ]
  })
}

export function validateDuplicateVariableNames(
  variables: SurveyVariable[],
): ValidationIssue[] {
  const seen = new Map<string, number>()
  const issues: ValidationIssue[] = []

  variables.forEach((variable, index) => {
    const normalizedName = normalizeVariableName(variable.name)
    const firstIndex = seen.get(normalizedName)

    if (firstIndex !== undefined) {
      issues.push({
        code: 'duplicate_variable_name',
        severity: 'error',
        message: `Variable name "${variable.name}" duplicates variables[${firstIndex}].name.`,
        path: `variables[${index}].name`,
      })
      return
    }

    seen.set(normalizedName, index)
  })

  return issues
}

export function validateCleaningPlan(plan: CleaningPlan): ValidationResult {
  const issues: ValidationIssue[] = [
    ...validateVariableNames(plan.variables),
    ...validateDuplicateVariableNames(plan.variables),
    ...validateSupportedVariableTypes(plan.variables),
    ...validateCleaningSteps(plan),
  ]

  return toValidationResult(issues)
}

function validateSupportedVariableTypes(
  variables: SurveyVariable[],
): ValidationIssue[] {
  return variables.flatMap((variable, index) => {
    if (isVariableType(variable.type)) {
      return []
    }

    return [
      {
        code: 'unsupported_variable_type',
        severity: 'error',
        message: `Variable "${variable.name}" has unsupported type "${String(variable.type)}".`,
        path: `variables[${index}].type`,
      } satisfies ValidationIssue,
    ]
  })
}

function validateCleaningSteps(plan: CleaningPlan): ValidationIssue[] {
  const variablesByName = indexVariables(plan.variables)
  const issues: ValidationIssue[] = []

  plan.steps.forEach((step, index) => {
    const path = `steps[${index}]`
    const stepType = step.type
    const stepVariables = getStepVariables(step)

    if (!step.id || typeof step.id !== 'string') {
      issues.push({
        code: 'invalid_cleaning_step',
        severity: 'error',
        message: `Cleaning step at ${path} must have a non-empty unique ID.`,
        path: `${path}.id`,
      })
    }

    if (!isCleaningStepType(stepType)) {
      issues.push({
        code: 'invalid_cleaning_step',
        severity: 'error',
        message: `Cleaning step "${step.id}" has unsupported type "${String(stepType)}".`,
        path: `${path}.type`,
      })
      return
    }

    if (!Array.isArray(step.variables)) {
      issues.push({
        code: 'invalid_cleaning_step',
        severity: 'error',
        message: `Cleaning step "${step.id}" must list affected variables.`,
        path: `${path}.variables`,
      })
      return
    }

    stepVariables.forEach((variableName) => {
      const variable = variablesByName.get(normalizeVariableName(variableName))

      if (!variable) {
        issues.push({
          code: 'missing_step_variable',
          severity: 'error',
          message: `Cleaning step "${step.id}" references variable "${variableName}", but it is not present in the plan.`,
          path: `${path}.variables`,
        })
      }
    })

    issues.push(
      ...validateIdentifierImputation(
        step,
        stepVariables,
        variablesByName,
        path,
      ),
    )
    issues.push(
      ...validateOutlierMethod(step, stepVariables, variablesByName, path),
    )
    issues.push(...validateStructuralMissingImputation(step, path))
  })

  return issues
}

function validateIdentifierImputation(
  step: CleaningStep,
  stepVariables: string[],
  variablesByName: Map<string, SurveyVariable>,
  path: string,
): ValidationIssue[] {
  if (step.type !== 'imputation') {
    return []
  }

  return stepVariables.flatMap((variableName) => {
    const variable = variablesByName.get(normalizeVariableName(variableName))

    if (
      !variable ||
      (variable.type !== 'identifier' && variable.role !== 'identifier')
    ) {
      return []
    }

    return [
      {
        code: 'identifier_imputation',
        severity: 'error',
        message: `Cleaning step "${step.id}" requests imputation for identifier variable "${variable.name}". Identifiers must not be imputed.`,
        path: `${path}.variables`,
      } satisfies ValidationIssue,
    ]
  })
}

function validateOutlierMethod(
  step: CleaningStep,
  stepVariables: string[],
  variablesByName: Map<string, SurveyVariable>,
  path: string,
): ValidationIssue[] {
  if (!OUTLIER_STEP_TYPES.has(step.type)) {
    return []
  }

  const method = normalizeMethodName(
    step.parameters.method ?? step.parameters.outlierMethod,
  )

  if (!method || !CONTINUOUS_OUTLIER_METHODS.has(method)) {
    return []
  }

  return stepVariables.flatMap((variableName) => {
    const variable = variablesByName.get(normalizeVariableName(variableName))

    if (!variable || CONTINUOUS_OUTLIER_VARIABLE_TYPES.has(variable.type)) {
      return []
    }

    return [
      {
        code: 'invalid_outlier_method_for_type',
        severity: 'error',
        message: `Cleaning step "${step.id}" applies ${method} outlier detection to "${variable.name}", but continuous outlier methods are only valid for continuous, count, or weight variables.`,
        path: `${path}.parameters.method`,
      } satisfies ValidationIssue,
    ]
  })
}

function validateStructuralMissingImputation(
  step: CleaningStep,
  path: string,
): ValidationIssue[] {
  if (
    step.type !== 'imputation' ||
    !selectsStructuralMissing(step.parameters)
  ) {
    return []
  }

  return [
    {
      code: 'structural_missing_imputation',
      severity: 'error',
      message: `Cleaning step "${step.id}" selects structural missing values for imputation. Structural missing values must be protected.`,
      path: `${path}.parameters`,
    },
  ]
}

function getStepVariables(step: CleaningStep): string[] {
  return Array.isArray(step.variables)
    ? step.variables.filter(
        (variable): variable is string => typeof variable === 'string',
      )
    : []
}

function indexVariables(
  variables: SurveyVariable[],
): Map<string, SurveyVariable> {
  return new Map(
    variables.map((variable) => [
      normalizeVariableName(variable.name),
      variable,
    ]),
  )
}

function normalizeVariableName(name: string): string {
  return name.trim().toLowerCase()
}

function normalizeMethodName(value: unknown): string | undefined {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_')
    : undefined
}

function selectsStructuralMissing(
  parameters: Record<string, unknown>,
): boolean {
  if (
    parameters.includeStructuralMissing === true ||
    parameters.imputeStructuralMissing === true ||
    parameters.imputesStructuralMissing === true
  ) {
    return true
  }

  const selectedMissingness = [
    parameters.targetMissingness,
    parameters.missingnessTypes,
    parameters.missingValueTypes,
    parameters.selectedMissingness,
  ].flatMap(toStringArray)

  return selectedMissingness.some((value) =>
    ['structural', 'structural_missing', 'all'].includes(
      value.trim().toLowerCase(),
    ),
  )
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  return []
}

function toValidationResult(issues: ValidationIssue[]): ValidationResult {
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')

  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
  }
}
