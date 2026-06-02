import type {
  DeclaredMissingCode,
  MissingValueCategory,
  ValueLabel,
  VariableValue,
} from '../core'
import type { DictionaryImportWarning } from './types'

export interface ParsedValueList<TValue> {
  values: TValue[]
  warnings: DictionaryImportWarning[]
}

export function parseValueLabels(
  text: string | undefined,
  context: { rowNumber?: number; columnName?: string } = {},
): ParsedValueList<ValueLabel> {
  if (!text?.trim()) {
    return { values: [], warnings: [] }
  }

  return parseLabelEntries(text, 'malformed_value_label', context).reduce<
    ParsedValueList<ValueLabel>
  >(
    (result, entry) => {
      if ('warning' in entry) {
        result.warnings.push(entry.warning)
        return result
      }

      result.values.push(entry.value)
      return result
    },
    { values: [], warnings: [] },
  )
}

export function parseMissingCodes(
  text: string | undefined,
  context: { rowNumber?: number; columnName?: string } = {},
): ParsedValueList<DeclaredMissingCode> {
  if (!text?.trim()) {
    return { values: [], warnings: [] }
  }

  return splitEntries(text).reduce<ParsedValueList<DeclaredMissingCode>>(
    (result, entry) => {
      const labelledEntry = parseLabelEntry(
        entry,
        'malformed_missing_code',
        context,
      )

      if ('value' in labelledEntry) {
        result.values.push({
          value: labelledEntry.value.value,
          label: labelledEntry.value.label,
          category: inferMissingCategory(labelledEntry.value.label),
        })
        return result
      }

      const bareValue = parseBareMissingCode(entry, context)

      if ('warning' in bareValue) {
        result.warnings.push(bareValue.warning)
        return result
      }

      result.values.push(bareValue.value)
      return result
    },
    { values: [], warnings: [] },
  )
}

export function parseAllowedValues(text: string | undefined): VariableValue[] {
  if (!text?.trim()) {
    return []
  }

  return splitEntries(text).map(parseValueToken).filter(isVariableValue)
}

export function parseVariableValue(value: string | number): VariableValue {
  if (typeof value === 'number') {
    return value
  }

  return parseValueToken(value)
}

function parseLabelEntries(
  text: string,
  warningCode: 'malformed_value_label' | 'malformed_missing_code',
  context: { rowNumber?: number; columnName?: string },
): Array<{ value: ValueLabel } | { warning: DictionaryImportWarning }> {
  return splitEntries(text).map((entry) =>
    parseLabelEntry(entry, warningCode, context),
  )
}

function parseLabelEntry(
  entry: string,
  warningCode: 'malformed_value_label' | 'malformed_missing_code',
  context: { rowNumber?: number; columnName?: string },
): { value: ValueLabel } | { warning: DictionaryImportWarning } {
  const match = entry.match(/^\s*([^:=\s]+)\s*(?:=|:|\s+)\s*(.+?)\s*$/)

  if (!match) {
    return {
      warning: {
        code: warningCode,
        severity: 'warning',
        message: `Could not parse label entry "${entry}". Original text was preserved in source metadata.`,
        rowNumber: context.rowNumber,
        columnName: context.columnName,
      },
    }
  }

  return {
    value: {
      value: parseValueToken(match[1]),
      label: match[2].trim(),
    },
  }
}

function parseBareMissingCode(
  entry: string,
  context: { rowNumber?: number; columnName?: string },
): { value: DeclaredMissingCode } | { warning: DictionaryImportWarning } {
  const value = parseValueToken(entry)

  if (value === '') {
    return {
      warning: {
        code: 'malformed_missing_code',
        severity: 'warning',
        message: `Could not parse missing-code entry "${entry}". Original text was preserved in source metadata.`,
        rowNumber: context.rowNumber,
        columnName: context.columnName,
      },
    }
  }

  const label = String(value)
  return {
    value: {
      value,
      label,
      category: inferMissingCategory(label),
    },
  }
}

function splitEntries(text: string): string[] {
  const separator = text.includes(';') ? /;/ : text.includes('|') ? /\|/ : /,/

  return text
    .split(separator)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseValueToken(token: string): VariableValue {
  const trimmedToken = token.trim()

  if (/^-?\d+(\.\d+)?$/.test(trimmedToken)) {
    return Number(trimmedToken)
  }

  if (/^(true|false)$/i.test(trimmedToken)) {
    return /^true$/i.test(trimmedToken)
  }

  return trimmedToken
}

function isVariableValue(value: VariableValue): value is VariableValue {
  return value !== ''
}

function inferMissingCategory(label: string): MissingValueCategory {
  const normalizedLabel = label.toLowerCase()

  if (/(don'?t know|dk)/.test(normalizedLabel)) {
    return 'dont_know'
  }

  if (/(refus|declined)/.test(normalizedLabel)) {
    return 'refusal'
  }

  if (/(not applicable|n\/a|na\b)/.test(normalizedLabel)) {
    return 'not_applicable'
  }

  if (/(structural|skip)/.test(normalizedLabel)) {
    return 'structural'
  }

  if (/(blank|empty)/.test(normalizedLabel)) {
    return 'blank'
  }

  if (/(invalid|error)/.test(normalizedLabel)) {
    return 'invalid'
  }

  return 'other'
}
