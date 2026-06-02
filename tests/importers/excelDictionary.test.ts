import { describe, expect, it } from 'vitest'
import { strToU8, zipSync } from 'fflate'
import { parseExcelDictionary } from '../../src/importers'

const dictionaryRows = [
  [
    'variable_name',
    'variable_label',
    'data_type',
    'role',
    'value_labels',
    'missing_codes',
    'valid_min',
    'valid_max',
    'extra_source',
  ],
  [
    'age',
    'Age in completed years',
    'integer',
    'analysis',
    '',
    "98=Don't know; 99=Refused",
    '0',
    '120',
    'Person roster',
  ],
  [
    'sex',
    'Sex of household member',
    'integer',
    'analysis',
    '1=Male; 2=Female',
    '9=Not stated',
    '',
    '',
    'Person roster',
  ],
]

function createMinimalXlsx(
  rows: string[][],
  sheetName = 'Dictionary',
): Uint8Array {
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '</Types>',
      ].join(''),
    ),
    '_rels/.rels': strToU8(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
        '</Relationships>',
      ].join(''),
    ),
    'xl/workbook.xml': strToU8(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        '<sheets>',
        `<sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>`,
        '</sheets>',
        '</workbook>',
      ].join(''),
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="/xl/worksheets/sheet1.xml"/>',
        '</Relationships>',
      ].join(''),
    ),
    'xl/worksheets/sheet1.xml': strToU8(renderWorksheet(rows)),
  }

  return zipSync(files)
}

function renderWorksheet(rows: string[][]): string {
  const rowXml = rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map(
            (cell, columnIndex) =>
              `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`,
          )
          .join('')}</row>`,
    )
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    `<sheetData>${rowXml}</sheetData>`,
    '</worksheet>',
  ].join('')
}

function columnName(index: number): string {
  let remaining = index + 1
  let name = ''

  while (remaining > 0) {
    const remainder = (remaining - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    remaining = Math.floor((remaining - 1) / 26)
  }

  return name
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

describe('parseExcelDictionary', () => {
  it('returns a structured warning for malformed workbook bytes', () => {
    const result = parseExcelDictionary(new Uint8Array([1, 2, 3, 4]), {
      sourceName: 'malformed.xlsx',
    })

    expect(result.variables).toEqual([])
    expect(result.sourceType).toBe('excel')
    expect(result.sourceMetadata).toMatchObject({
      sourceName: 'malformed.xlsx',
      recordsRead: false,
    })
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'malformed_excel_workbook',
        severity: 'error',
      }),
    ])
  })

  it('imports the first worksheet by default', () => {
    const result = parseExcelDictionary(createMinimalXlsx(dictionaryRows), {
      sourceName: 'household_dictionary.xlsx',
    })

    expect(result.originalRowCount).toBe(2)
    expect(result.importedVariableCount).toBe(2)
    expect(result.variables[0]).toMatchObject({
      name: 'age',
      label: 'Age in completed years',
      type: 'count',
      role: 'analysis',
      validRange: { min: 0, max: 120 },
    })
    expect(result.variables[1].valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
    ])
    expect(result.variables[0].sourceMetadata?.unmappedColumns).toEqual({
      extra_source: 'Person roster',
    })
  })

  it('allows selecting a worksheet by name', () => {
    const result = parseExcelDictionary(
      createMinimalXlsx(dictionaryRows, 'Codebook'),
      {
        sheetName: 'Codebook',
      },
    )

    expect(result.importedVariableCount).toBe(2)
  })

  it('reports a clear warning when the selected worksheet is missing', () => {
    const result = parseExcelDictionary(createMinimalXlsx(dictionaryRows), {
      sheetName: 'Not here',
    })

    expect(result.variables).toHaveLength(0)
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'excel_sheet_not_found',
        severity: 'error',
      }),
    ])
  })

  it('reports an empty dictionary when the worksheet has no header row', () => {
    const result = parseExcelDictionary(createMinimalXlsx([]))

    expect(result.variables).toEqual([])
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'empty_dictionary',
        severity: 'error',
      }),
    ])
  })
})
