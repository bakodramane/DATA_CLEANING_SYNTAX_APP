import { detectColumnMapping } from '../columnMapping'
import { rowsToDictionaryImportResult } from '../convertRows'
import type { DictionaryImportOptions, DictionaryImportResult } from '../types'

export function parseCsvDictionary(
  csvText: string,
  options: DictionaryImportOptions = {},
): DictionaryImportResult {
  const table = parseCsvTable(csvText)
  const headers = table[0]?.map((header) => header.trim()) ?? []
  const rows = table.slice(1).filter((row) => row.some((cell) => cell.trim()))

  if (headers.length === 0) {
    const columnMapping = detectColumnMapping([], options.columnMapping)
    return {
      variables: [],
      columnMapping,
      warnings: [
        {
          code: 'empty_dictionary',
          severity: 'error',
          message: 'CSV dictionary has no header row.',
        },
      ],
      unmappedColumns: [],
      originalRowCount: 0,
      importedVariableCount: 0,
      rows: [],
    }
  }

  const columnMapping = detectColumnMapping(headers, options.columnMapping)
  const rawRows = rows.map((row) =>
    Object.fromEntries(
      headers.map((header, index) => [header, row[index] ?? '']),
    ),
  )

  return rowsToDictionaryImportResult(rawRows, columnMapping, {
    ...options,
    sourceType: 'csv',
  })
}

export function parseCsvTable(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index]
    const nextCharacter = csvText[index + 1]

    if (character === '"' && inQuotes && nextCharacter === '"') {
      currentCell += '"'
      index += 1
      continue
    }

    if (character === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (character === ',' && !inQuotes) {
      currentRow.push(currentCell)
      currentCell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      currentRow.push(currentCell)
      rows.push(currentRow)
      currentRow = []
      currentCell = ''
      continue
    }

    currentCell += character
  }

  currentRow.push(currentCell)
  rows.push(currentRow)

  return rows.filter((row) => row.some((cell) => cell.length > 0))
}
