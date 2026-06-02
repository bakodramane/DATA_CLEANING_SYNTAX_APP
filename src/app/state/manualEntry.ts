import type { SurveyVariable } from '../../core'
import { isVariableRole, isVariableType } from '../../core'
import {
  createVariableFromManualEntry,
  type ManualVariableEntry,
} from '../../importers'

export interface ManualVariableFormValues {
  name: string
  label: string
  type: string
  role: string
  storageType: string
  valueLabels: string
  missingCodes: string
  validMin: string
  validMax: string
  allowedValues: string
  skipPattern: string
  notes: string
}

export interface ManualVariableSaveResult {
  variables: SurveyVariable[]
  messages: string[]
  savedVariable?: SurveyVariable
}

export const emptyManualVariableForm: ManualVariableFormValues = {
  name: '',
  label: '',
  type: '',
  role: 'analysis',
  storageType: '',
  valueLabels: '',
  missingCodes: '',
  validMin: '',
  validMax: '',
  allowedValues: '',
  skipPattern: '',
  notes: '',
}

export function createManualVariableFormValues(
  variable?: SurveyVariable,
): ManualVariableFormValues {
  if (!variable) {
    return { ...emptyManualVariableForm }
  }

  return {
    name: variable.name,
    label: variable.label,
    type: variable.type,
    role: variable.role,
    storageType: variable.storageType ?? '',
    valueLabels:
      variable.valueLabels
        ?.map((label) => `${String(label.value)}=${label.label}`)
        .join('; ') ?? '',
    missingCodes:
      variable.declaredMissingCodes
        ?.map((code) => `${String(code.value)}=${code.label}`)
        .join('; ') ?? '',
    validMin: String(variable.validRange?.min ?? ''),
    validMax: String(variable.validRange?.max ?? ''),
    allowedValues: '',
    skipPattern:
      variable.skipPatternDependencies
        ?.map((dependency) => dependency.description ?? dependency.condition)
        .join('; ') ?? '',
    notes: variable.userNotes ?? '',
  }
}

export function saveManualVariable(
  variables: SurveyVariable[],
  formValues: ManualVariableFormValues,
  editingName?: string,
): ManualVariableSaveResult {
  const messages = validateManualVariableForm(
    formValues,
    variables,
    editingName,
  )

  if (messages.length > 0) {
    return { variables, messages }
  }

  const result = createVariableFromManualEntry(toManualEntry(formValues))
  const warningMessages = result.warnings.map((warning) => warning.message)

  if (warningMessages.length > 0) {
    return { variables, messages: warningMessages }
  }

  const nextVariables = editingName
    ? variables.map((variable) =>
        variable.name === editingName ? result.variable : variable,
      )
    : [...variables, result.variable]

  return {
    variables: nextVariables,
    messages: [],
    savedVariable: result.variable,
  }
}

export function removeManualVariable(
  variables: SurveyVariable[],
  variableName: string,
): SurveyVariable[] {
  return variables.filter((variable) => variable.name !== variableName)
}

export function isManualVariable(variable: SurveyVariable): boolean {
  return variable.sourceMetadata?.sourceType === 'manual'
}

export function validateManualVariableForm(
  formValues: ManualVariableFormValues,
  existingVariables: SurveyVariable[],
  editingName?: string,
): string[] {
  const messages: string[] = []
  const name = formValues.name.trim()

  if (!name) {
    messages.push('The variable name is required.')
  } else if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    messages.push(
      'Variable names should contain only letters, numbers and underscores, and should not start with a number.',
    )
  }

  if (
    name &&
    existingVariables.some(
      (variable) => variable.name === name && variable.name !== editingName,
    )
  ) {
    messages.push('This variable name is already used.')
  }

  if (!formValues.type) {
    messages.push('The variable type is required.')
  } else if (!isVariableType(formValues.type)) {
    messages.push('The selected variable type is not supported.')
  }

  if (formValues.role && !isVariableRole(formValues.role)) {
    messages.push('The selected variable role is not supported.')
  }

  const min = parseRangeValue(formValues.validMin)
  const max = parseRangeValue(formValues.validMax)

  if (
    typeof min === 'number' &&
    typeof max === 'number' &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    min > max
  ) {
    messages.push('The minimum value cannot be greater than the maximum value.')
  }

  return messages
}

function toManualEntry(
  formValues: ManualVariableFormValues,
): ManualVariableEntry {
  return {
    name: formValues.name.trim(),
    label: formValues.label.trim() || undefined,
    type: formValues.type,
    role: formValues.role || 'analysis',
    storageType: formValues.storageType.trim() || undefined,
    valueLabels: formValues.valueLabels.trim() || undefined,
    missingCodes: formValues.missingCodes.trim() || undefined,
    validMin: parseRangeValue(formValues.validMin),
    validMax: parseRangeValue(formValues.validMax),
    allowedValues: formValues.allowedValues.trim() || undefined,
    skipPattern: formValues.skipPattern.trim() || undefined,
    notes: formValues.notes.trim() || undefined,
  }
}

function parseRangeValue(value: string): string | number | undefined {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return undefined
  }

  return /^-?\d+(\.\d+)?$/.test(trimmedValue)
    ? Number(trimmedValue)
    : trimmedValue
}
