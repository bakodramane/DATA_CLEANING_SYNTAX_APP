import type {
  SurveyVariable,
  ValueLabel,
  VariableRole,
  VariableType,
} from '../../core'
import { isVariableRole, isVariableType } from '../../core'
import { detectVariableRole, detectVariableType } from '../typeDetection'
import type { DictionaryImportWarning, ManualVariableEntry } from '../types'
import {
  parseAllowedValues,
  parseMissingCodes,
  parseValueLabels,
  parseVariableValue,
} from '../valueParsing'

export interface ManualVariableResult {
  variable: SurveyVariable
  warnings: DictionaryImportWarning[]
}

export function createVariableFromManualEntry(
  entry: ManualVariableEntry,
): ManualVariableResult {
  const warnings: DictionaryImportWarning[] = []
  const valueLabelResult = normalizeValueLabels(entry.valueLabels)
  const missingCodeResult = Array.isArray(entry.missingCodes)
    ? { values: entry.missingCodes, warnings: [] }
    : parseMissingCodes(entry.missingCodes)
  warnings.push(...valueLabelResult.warnings, ...missingCodeResult.warnings)
  const allowedValues = Array.isArray(entry.allowedValues)
    ? entry.allowedValues.map((value) =>
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
          ? value
          : parseVariableValue(value),
      )
    : parseAllowedValues(entry.allowedValues)
  const finalValueLabels =
    valueLabelResult.values.length > 0
      ? valueLabelResult.values
      : allowedValues.map(
          (value): ValueLabel => ({ value, label: String(value) }),
        )
  const typeDetection = detectVariableType({
    name: entry.name,
    declaredType: entry.type,
    storageType: entry.storageType,
    valueLabels: finalValueLabels,
    validMin: entry.validRange?.min ?? entry.validMin,
    validMax: entry.validRange?.max ?? entry.validMax,
  })
  const roleDetection = detectVariableRole(entry.name, entry.role)

  const variable: SurveyVariable = {
    name: entry.name,
    label: entry.label || entry.name,
    type: coerceType(entry.type, typeDetection.value),
    role: coerceRole(entry.role, roleDetection.value),
    storageType: entry.storageType,
    valueLabels: finalValueLabels,
    validRange:
      entry.validRange ??
      (entry.validMin !== undefined || entry.validMax !== undefined
        ? {
            min: entry.validMin,
            max: entry.validMax,
            inclusiveMin: true,
            inclusiveMax: true,
          }
        : undefined),
    declaredMissingCodes: missingCodeResult.values,
    skipPatternDependencies: entry.skipPattern
      ? [
          {
            sourceVariable: '',
            condition: entry.skipPattern,
            description: entry.skipPattern,
          },
        ]
      : undefined,
    sourceMetadata: {
      sourceType: 'manual',
      originalType: typeof entry.type === 'string' ? entry.type : undefined,
      notes: [
        `Detected type: ${typeDetection.value} (${typeDetection.confidence}) - ${typeDetection.reason}`,
        `Detected role: ${roleDetection.value} (${roleDetection.confidence}) - ${roleDetection.reason}`,
        ...manualSourceNotes(entry),
      ],
    },
    userNotes: entry.notes,
  }

  return { variable, warnings }
}

function normalizeValueLabels(valueLabels: ManualVariableEntry['valueLabels']) {
  if (Array.isArray(valueLabels)) {
    return { values: valueLabels, warnings: [] }
  }

  return parseValueLabels(valueLabels)
}

function coerceType(
  declaredType: ManualVariableEntry['type'],
  fallbackType: VariableType,
): VariableType {
  return typeof declaredType === 'string' && isVariableType(declaredType)
    ? declaredType
    : fallbackType
}

function coerceRole(
  declaredRole: ManualVariableEntry['role'],
  fallbackRole: VariableRole,
): VariableRole {
  return typeof declaredRole === 'string' && isVariableRole(declaredRole)
    ? declaredRole
    : fallbackRole
}

function manualSourceNotes(entry: ManualVariableEntry): string[] {
  return [
    entry.valueLabels ? `Manual value labels: ${entry.valueLabels}` : '',
    entry.missingCodes ? `Manual missing codes: ${entry.missingCodes}` : '',
    entry.allowedValues ? `Manual allowed values: ${entry.allowedValues}` : '',
    entry.skipPattern ? `Manual skip-pattern note: ${entry.skipPattern}` : '',
  ].filter(Boolean)
}
