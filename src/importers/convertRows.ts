import type {
  DictionaryColumnConcept,
  DictionaryColumnMapping,
  DictionaryImportSourceType,
  DictionaryImportOptions,
  DictionaryImportResult,
  DictionaryImportWarning,
  DictionaryRow,
} from './types'
import {
  detectTypeFromDictionaryRow,
  detectVariableRole,
} from './typeDetection'
import {
  parseAllowedValues,
  parseMissingCodes,
  parseValueLabels,
} from './valueParsing'
import type {
  SurveyVariable,
  ValueLabel,
  VariableRole,
  VariableType,
} from '../core'
import { isVariableRole, isVariableType } from '../core'

export function rowsToDictionaryImportResult(
  rows: Array<Record<string, string>>,
  columnMapping: DictionaryColumnMapping,
  options: DictionaryImportOptions & {
    sourceType: DictionaryImportSourceType
  },
): DictionaryImportResult {
  const warnings: DictionaryImportWarning[] = [
    ...columnMapping.ambiguousMappings.map(
      (mapping): DictionaryImportWarning => ({
        code: 'ambiguous_column_mapping',
        severity: 'warning',
        message: mapping.reason,
      }),
    ),
    ...columnMapping.unmappedColumns.map(
      (columnName): DictionaryImportWarning => ({
        code: 'unmapped_column',
        severity: 'warning',
        message: `Column "${columnName}" was not mapped to a canonical dictionary concept and was preserved in source metadata.`,
        columnName,
      }),
    ),
  ]

  if (!columnMapping.mappedColumns.name) {
    warnings.push({
      code: 'missing_required_column',
      severity: 'error',
      message:
        'No variable-name column was detected. Add a column such as "variable_name", "name", or "varname" before importing this dictionary.',
    })
  }

  const dictionaryRows = rows.map((raw, index) =>
    mapRawRow(raw, columnMapping, index + 2),
  )
  const variables: SurveyVariable[] = []
  const seenNames = new Map<string, number>()

  dictionaryRows.forEach((row) => {
    const variableName = row.canonical.name?.trim()

    if (!variableName) {
      warnings.push({
        code: 'missing_variable_name',
        severity: 'error',
        message: 'Dictionary row is missing a variable name and was skipped.',
        rowNumber: row.rowNumber,
      })
      return
    }

    const normalizedName = variableName.toLowerCase()
    const firstRow = seenNames.get(normalizedName)

    if (firstRow !== undefined) {
      warnings.push({
        code: 'duplicate_variable_name',
        severity: 'error',
        message: `Variable "${variableName}" duplicates a variable first seen on row ${firstRow}.`,
        rowNumber: row.rowNumber,
      })
    } else {
      seenNames.set(normalizedName, row.rowNumber)
    }

    const valueLabelResult = parseValueLabels(row.canonical.valueLabels, {
      rowNumber: row.rowNumber,
      columnName: columnMapping.mappedColumns.valueLabels,
    })
    const missingCodeResult = parseMissingCodes(row.canonical.missingCodes, {
      rowNumber: row.rowNumber,
      columnName: columnMapping.mappedColumns.missingCodes,
    })
    warnings.push(...valueLabelResult.warnings, ...missingCodeResult.warnings)

    const allowedValues = parseAllowedValues(row.canonical.allowedValues)
    const valueLabels =
      valueLabelResult.values.length > 0
        ? valueLabelResult.values
        : allowedValues.map(
            (value): ValueLabel => ({ value, label: String(value) }),
          )
    const typeDetection = detectTypeFromDictionaryRow(row, valueLabels)
    const roleDetection = detectVariableRole(variableName, row.canonical.role)
    const variableType = coerceVariableType(
      row.canonical.type,
      typeDetection.value,
      warnings,
      row.rowNumber,
    )
    const variableRole = coerceVariableRole(
      row.canonical.role,
      roleDetection.value,
      warnings,
      row.rowNumber,
    )

    variables.push({
      name: variableName,
      label: row.canonical.label?.trim() || variableName,
      type: variableType,
      role: variableRole,
      storageType:
        row.canonical.storageType?.trim() || row.canonical.type?.trim(),
      valueLabels,
      validRange: buildValidRange(row),
      declaredMissingCodes: missingCodeResult.values,
      skipPatternDependencies: row.canonical.skipPattern
        ? [
            {
              sourceVariable: '',
              condition: row.canonical.skipPattern,
              description: row.canonical.skipPattern,
            },
          ]
        : undefined,
      sourceMetadata: {
        sourceName: options.sourceName,
        sourceType: options.sourceType,
        columnName: variableName,
        originalType: row.canonical.type,
        rowNumber: row.rowNumber,
        originalColumns: row.raw,
        unmappedColumns: row.unmapped,
        notes: [
          `Detected type: ${typeDetection.value} (${typeDetection.confidence}) - ${typeDetection.reason}`,
          `Detected role: ${roleDetection.value} (${roleDetection.confidence}) - ${roleDetection.reason}`,
        ],
      },
      userNotes: row.canonical.notes,
    })
  })

  return {
    variables,
    columnMapping,
    warnings,
    unmappedColumns: columnMapping.unmappedColumns,
    originalRowCount: rows.length,
    importedVariableCount: variables.length,
    rows: dictionaryRows,
    sourceType: options.sourceType,
    sourceMetadata: {
      sourceName: options.sourceName,
      recordsRead: false,
    },
  }
}

export function mapRawRow(
  raw: Record<string, string>,
  columnMapping: DictionaryColumnMapping,
  rowNumber: number,
): DictionaryRow {
  const canonical: Partial<Record<DictionaryColumnConcept, string>> = {}
  const mappedSourceColumns = new Set(
    Object.values(columnMapping.mappedColumns),
  )

  for (const [concept, columnName] of Object.entries(
    columnMapping.mappedColumns,
  ) as Array<[DictionaryColumnConcept, string]>) {
    canonical[concept] = raw[columnName] ?? ''
  }

  return {
    rowNumber,
    raw,
    canonical,
    unmapped: Object.fromEntries(
      Object.entries(raw).filter(
        ([columnName]) => !mappedSourceColumns.has(columnName),
      ),
    ),
  }
}

function buildValidRange(row: DictionaryRow) {
  const min = parseRangeBoundary(row.canonical.validMin)
  const max = parseRangeBoundary(row.canonical.validMax)

  if (min === undefined && max === undefined) {
    return undefined
  }

  return {
    min,
    max,
    inclusiveMin: true,
    inclusiveMax: true,
  }
}

function parseRangeBoundary(
  value: string | undefined,
): string | number | undefined {
  if (!value?.trim()) {
    return undefined
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value.trim()
}

function coerceVariableType(
  declaredType: string | undefined,
  detectedType: VariableType,
  warnings: DictionaryImportWarning[],
  rowNumber: number,
): VariableType {
  const normalizedType = declaredType?.trim().toLowerCase()

  if (!normalizedType) {
    return detectedType
  }

  if (isVariableType(normalizedType)) {
    return normalizedType
  }

  if (!looksLikeStorageType(normalizedType)) {
    warnings.push({
      code: 'unsupported_variable_type',
      severity: 'warning',
      message: `Type "${declaredType}" is not a supported canonical type; detected type "${detectedType}" was used.`,
      rowNumber,
    })
  }

  return detectedType
}

function coerceVariableRole(
  declaredRole: string | undefined,
  detectedRole: VariableRole,
  warnings: DictionaryImportWarning[],
  rowNumber: number,
): VariableRole {
  const normalizedRole = declaredRole?.trim().toLowerCase()

  if (!normalizedRole) {
    return detectedRole
  }

  if (isVariableRole(normalizedRole)) {
    return normalizedRole
  }

  warnings.push({
    code: 'unsupported_variable_role',
    severity: 'warning',
    message: `Role "${declaredRole}" is not supported; detected role "${detectedRole}" was used.`,
    rowNumber,
  })

  return detectedRole
}

function looksLikeStorageType(value: string): boolean {
  return /\b(numeric|number|double|float|decimal|real|byte|int|integer|long|string|text|character|char|date|datetime|time)\b/.test(
    value,
  )
}
