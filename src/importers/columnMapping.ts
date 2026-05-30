import type {
  AmbiguousColumnMapping,
  ColumnMappingSuggestion,
  DictionaryColumnConcept,
  DictionaryColumnMapping,
} from './types'

const COLUMN_SYNONYMS: Record<DictionaryColumnConcept, string[]> = {
  name: ['name', 'var_name', 'variable', 'variable_name', 'varname', 'field'],
  label: [
    'label',
    'variable_label',
    'description',
    'variable_description',
    'question',
  ],
  type: ['type', 'variable_type', 'data_type', 'declared_type'],
  storageType: ['storage_type', 'storage', 'format', 'field_type'],
  role: ['role', 'variable_role'],
  valueLabels: ['values', 'value_labels', 'categories', 'codes', 'labels'],
  missingCodes: [
    'missing',
    'missing_values',
    'missing_codes',
    'declared_missing',
  ],
  validMin: ['min', 'minimum', 'valid_min'],
  validMax: ['max', 'maximum', 'valid_max'],
  allowedValues: ['allowed_values', 'domain', 'valid_values'],
  skipPattern: ['skip_pattern', 'skip', 'skip_notes', 'universe'],
  notes: ['notes', 'comments', 'comment'],
}

export function detectColumnMapping(
  columns: string[],
  explicitMapping: Partial<Record<DictionaryColumnConcept, string>> = {},
): DictionaryColumnMapping {
  const mappedColumns: Partial<Record<DictionaryColumnConcept, string>> = {}
  const detectedSuggestions: ColumnMappingSuggestion[] = []
  const ambiguousMappings: AmbiguousColumnMapping[] = []
  const usedColumns = new Set<string>()

  for (const [concept, columnName] of Object.entries(explicitMapping) as Array<
    [DictionaryColumnConcept, string]
  >) {
    const matchedColumn = findColumn(columns, columnName)

    if (matchedColumn) {
      mappedColumns[concept] = matchedColumn
      usedColumns.add(matchedColumn)
    }
  }

  for (const concept of Object.keys(
    COLUMN_SYNONYMS,
  ) as DictionaryColumnConcept[]) {
    if (mappedColumns[concept]) {
      continue
    }

    const candidates = columns.filter((column) =>
      COLUMN_SYNONYMS[concept].includes(normalizeColumnName(column)),
    )

    if (candidates.length === 1) {
      mappedColumns[concept] = candidates[0]
      usedColumns.add(candidates[0])
      detectedSuggestions.push({
        concept,
        columnName: candidates[0],
        confidence: 'high',
        reason: `Column "${candidates[0]}" matched a known ${concept} synonym.`,
      })
    }

    if (candidates.length > 1) {
      mappedColumns[concept] = candidates[0]
      usedColumns.add(candidates[0])
      ambiguousMappings.push({
        concept,
        candidateColumns: candidates,
        reason: `Multiple columns look like ${concept}; "${candidates[0]}" was selected as a suggestion.`,
      })
    }
  }

  return {
    columns,
    mappedColumns,
    detectedSuggestions,
    ambiguousMappings,
    unmappedColumns: columns.filter((column) => !usedColumns.has(column)),
  }
}

export function normalizeColumnName(column: string): string {
  return column
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function findColumn(
  columns: string[],
  requestedColumn: string,
): string | undefined {
  const normalizedRequestedColumn = normalizeColumnName(requestedColumn)
  return columns.find(
    (column) => normalizeColumnName(column) === normalizedRequestedColumn,
  )
}
