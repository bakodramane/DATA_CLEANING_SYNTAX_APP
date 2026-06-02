import { strFromU8, unzipSync } from 'fflate'
import { detectColumnMapping } from '../columnMapping'
import { rowsToDictionaryImportResult } from '../convertRows'
import type { DictionaryImportOptions, DictionaryImportResult } from '../types'

export interface ExcelDictionaryImportOptions extends DictionaryImportOptions {
  sheetName?: string
}

export function parseExcelDictionary(
  workbookBytes: ArrayBuffer | Uint8Array,
  options: ExcelDictionaryImportOptions = {},
): DictionaryImportResult {
  let files: Record<string, Uint8Array>

  try {
    files = unzipSync(toUint8Array(workbookBytes))
  } catch {
    const columnMapping = detectColumnMapping([], options.columnMapping)

    return {
      variables: [],
      columnMapping,
      warnings: [
        {
          code: 'malformed_excel_workbook',
          severity: 'error',
          message:
            'The Excel workbook could not be read. Export a metadata-only CSV or a valid .xlsx dictionary and import that file instead.',
        },
      ],
      unmappedColumns: [],
      originalRowCount: 0,
      importedVariableCount: 0,
      rows: [],
      sourceType: 'excel',
      sourceMetadata: {
        sourceName: options.sourceName,
        recordsRead: false,
      },
    }
  }

  const workbookXml = readZipText(files, 'xl/workbook.xml')
  const relationshipsXml = readZipText(files, 'xl/_rels/workbook.xml.rels')
  const sharedStrings = parseSharedStrings(
    readZipText(files, 'xl/sharedStrings.xml'),
  )
  const worksheetPath = findWorksheetPath(
    workbookXml,
    relationshipsXml,
    options.sheetName,
  )

  if (!worksheetPath) {
    const columnMapping = detectColumnMapping([], options.columnMapping)
    return {
      variables: [],
      columnMapping,
      warnings: [
        {
          code: 'excel_sheet_not_found',
          severity: 'error',
          message: options.sheetName
            ? `Worksheet "${options.sheetName}" was not found.`
            : 'No worksheet was found in the Excel workbook.',
        },
      ],
      unmappedColumns: [],
      originalRowCount: 0,
      importedVariableCount: 0,
      rows: [],
      sourceType: 'excel',
      sourceMetadata: {
        sourceName: options.sourceName,
        recordsRead: false,
      },
    }
  }

  const worksheetXml = readZipText(files, worksheetPath)
  const table = parseWorksheetTable(worksheetXml, sharedStrings)
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
          message: 'Excel dictionary worksheet has no header row.',
        },
      ],
      unmappedColumns: [],
      originalRowCount: 0,
      importedVariableCount: 0,
      rows: [],
      sourceType: 'excel',
      sourceMetadata: {
        sourceName: options.sourceName,
        recordsRead: false,
      },
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
    sourceType: 'excel',
  })
}

function toUint8Array(bytes: ArrayBuffer | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
}

function readZipText(files: Record<string, Uint8Array>, path: string): string {
  const file = files[path]
  return file ? strFromU8(file) : ''
}

function findWorksheetPath(
  workbookXml: string,
  relationshipsXml: string,
  requestedSheetName?: string,
): string | undefined {
  const sheets = [...workbookXml.matchAll(/<sheet\b([^>]*)\/?>/g)].map(
    (match) => ({
      name: getXmlAttribute(match[1], 'name'),
      relationshipId: getXmlAttribute(match[1], 'r:id'),
    }),
  )
  const sheet =
    requestedSheetName !== undefined
      ? sheets.find((candidate) => candidate.name === requestedSheetName)
      : sheets[0]

  if (!sheet?.relationshipId) {
    return undefined
  }

  const relationship = [
    ...relationshipsXml.matchAll(/<Relationship\b([^>]*)\/?>/g),
  ].find((match) => getXmlAttribute(match[1], 'Id') === sheet.relationshipId)
  const target = relationship
    ? getXmlAttribute(relationship[1], 'Target')
    : undefined

  if (!target) {
    return undefined
  }

  if (target.startsWith('/xl/')) {
    return target.replace(/^\//, '')
  }

  return target.startsWith('xl/') ? target : `xl/${target.replace(/^\//, '')}`
}

function parseSharedStrings(sharedStringsXml: string): string[] {
  return [...sharedStringsXml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(
    (match) =>
      [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
        .map((textMatch) => decodeXml(textMatch[1]))
        .join(''),
  )
}

function parseWorksheetTable(
  worksheetXml: string,
  sharedStrings: string[],
): string[][] {
  const rows: string[][] = []

  for (const rowMatch of worksheetXml.matchAll(
    /<row\b[^>]*>([\s\S]*?)<\/row>/g,
  )) {
    const row: string[] = []

    for (const cellMatch of rowMatch[1].matchAll(
      /<c\b([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const cellRef = getXmlAttribute(cellMatch[1], 'r')
      const columnIndex = cellRef ? columnIndexFromCellRef(cellRef) : row.length
      row[columnIndex] = parseCellValue(
        cellMatch[1],
        cellMatch[2],
        sharedStrings,
      )
    }

    rows.push(row.map((value) => value ?? ''))
  }

  return rows
}

function parseCellValue(
  attributes: string,
  cellXml: string,
  sharedStrings: string[],
): string {
  const type = getXmlAttribute(attributes, 't')

  if (type === 'inlineStr') {
    const textMatch = cellXml.match(/<t\b[^>]*>([\s\S]*?)<\/t>/)
    return textMatch ? decodeXml(textMatch[1]) : ''
  }

  const valueMatch = cellXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)
  const rawValue = valueMatch ? decodeXml(valueMatch[1]) : ''

  if (type === 's') {
    return sharedStrings[Number(rawValue)] ?? ''
  }

  return rawValue
}

function getXmlAttribute(attributes: string, name: string): string | undefined {
  const escapedName = name.replace(':', '\\:')
  const match = attributes.match(new RegExp(`${escapedName}="([^"]*)"`))
  return match ? decodeXml(match[1]) : undefined
}

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function columnIndexFromCellRef(cellRef: string): number {
  const letters = cellRef.match(/[A-Z]+/i)?.[0].toUpperCase() ?? 'A'

  return (
    [...letters].reduce(
      (total, letter) => total * 26 + letter.charCodeAt(0) - 64,
      0,
    ) - 1
  )
}
