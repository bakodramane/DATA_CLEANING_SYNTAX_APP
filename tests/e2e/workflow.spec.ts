import { expect, test } from '@playwright/test'
import { strToU8, zipSync } from 'fflate'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

async function openMetadataStep(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Cleaning Syntax Generator' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', { name: 'Metadata input' }),
  ).toBeVisible()
}

async function continueToExportFromVariables(
  page: import('@playwright/test').Page,
) {
  await expect(
    page.getByRole('heading', { name: 'Variable review' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', { name: 'Rule recommendation review' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', { name: 'Cleaning Plan preview' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', { name: 'Syntax preview' }),
  ).toBeVisible()
}

async function addManualVariable(
  page: import('@playwright/test').Page,
  variable: {
    name: string
    label: string
    type: string
    valueLabels?: string
    missingCodes?: string
    validMin?: string
    validMax?: string
  },
) {
  await page.getByLabel('Variable name').fill(variable.name)
  await page.getByLabel('Variable label').fill(variable.label)
  await page.getByLabel('Variable type').selectOption(variable.type)
  await page.getByLabel('Variable role').selectOption('analysis')
  await page.getByLabel('Value labels').fill(variable.valueLabels ?? '')
  await page.getByLabel('Missing-value codes').fill(variable.missingCodes ?? '')
  await page.getByLabel('Valid minimum').fill(variable.validMin ?? '')
  await page.getByLabel('Valid maximum').fill(variable.validMax ?? '')
  await page.getByRole('button', { name: 'Add manual variable' }).click()
  await expect(page.getByText(variable.name, { exact: true })).toBeVisible()
}

test('demo dictionary workflow reaches export', async ({ page }) => {
  await openMetadataStep(page)
  await page
    .getByRole('button', { name: 'Load demo household survey dictionary' })
    .click()

  await continueToExportFromVariables(page)

  for (const language of ['SPSS v18', 'Stata v14', 'R', 'Python']) {
    await page.getByRole('tab', { name: language }).click()
    await expect(page.locator('.code-preview pre')).toContainText(
      language === 'SPSS v18'
        ? 'SPSS'
        : language === 'Stata v14'
          ? 'Stata'
          : language,
    )
  }

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', { name: 'Export and download' }),
  ).toBeVisible()
})

test('manual-entry workflow generates syntax and export content', async ({
  page,
}) => {
  await openMetadataStep(page)

  await addManualVariable(page, {
    name: 'age',
    label: 'Age in completed years',
    type: 'continuous',
    validMin: '0',
    validMax: '120',
  })
  await addManualVariable(page, {
    name: 'sex',
    label: 'Respondent sex',
    type: 'nominal',
    valueLabels: '1=Male; 2=Female',
  })
  await addManualVariable(page, {
    name: 'income',
    label: 'Monthly income',
    type: 'continuous',
    missingCodes: "-8=Don't know; -9=Refused",
    validMin: '0',
  })

  await page.getByRole('button', { name: 'Edit' }).first().click()
  await page.getByLabel('Variable label').fill('Age of respondent')
  await page.getByRole('button', { name: 'Update manual variable' }).click()
  await expect(page.getByText('Age of respondent')).toBeVisible()

  await page.getByRole('button', { name: 'Remove' }).first().click()
  await expect(page.locator('.manual-variable-row')).toHaveCount(2)

  await page.getByRole('button', { name: 'Continue' }).click()
  await continueToExportFromVariables(page)

  for (const language of ['R', 'Stata v14']) {
    await page.getByRole('tab', { name: language }).click()
    await expect(page.locator('.code-preview pre')).toContainText(
      language === 'Stata v14' ? 'Stata' : 'R',
    )
  }

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('button', { name: 'Download Cleaning Plan JSON' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Download R script' }),
  ).toBeVisible()
})

test('manual-entry validation reports blank and duplicate names', async ({
  page,
}) => {
  await openMetadataStep(page)

  await page.getByRole('button', { name: 'Add manual variable' }).click()
  await expect(page.getByText('The variable name is required.')).toBeVisible()

  await addManualVariable(page, {
    name: 'age',
    label: 'Age',
    type: 'continuous',
  })

  await page.getByLabel('Variable name').fill('age')
  await page.getByLabel('Variable label').fill('Duplicate age')
  await page.getByLabel('Variable type').selectOption('continuous')
  await page.getByRole('button', { name: 'Add manual variable' }).click()
  await expect(
    page.getByText('This variable name is already used.'),
  ).toBeVisible()

  await page.getByLabel('Variable name').fill('age2')
  await page.getByRole('button', { name: 'Add manual variable' }).click()
  await expect(page.getByText('age2', { exact: true })).toBeVisible()
})

test('CSV paste and Excel upload workflows still import variables', async ({
  page,
}, testInfo) => {
  await openMetadataStep(page)
  await page
    .getByLabel('Paste CSV dictionary text')
    .fill(
      [
        'variable_name,variable_label,data_type,role',
        'age,Age in completed years,integer,analysis',
        'sex,Sex,integer,analysis',
      ].join('\n'),
    )
  await page.getByRole('button', { name: 'Import pasted CSV' }).click()
  await expect(
    page.getByRole('heading', { name: 'Variable review' }),
  ).toBeVisible()
  await expect(page.getByText('age', { exact: true })).toBeVisible()

  await openMetadataStep(page)
  const workbookPath = testInfo.outputPath('manual-smoke-dictionary.xlsx')
  writeFileSync(workbookPath, createMinimalXlsx())
  await page.locator('input[type="file"]').setInputFiles(workbookPath)
  await expect(
    page.getByRole('heading', { name: 'Variable review' }),
  ).toBeVisible()
  await expect(page.getByText('sex', { exact: true })).toBeVisible()
})

test('DDI XML upload workflow reaches syntax preview', async ({ page }) => {
  await openMetadataStep(page)
  const fixturePath = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'fixtures',
    'dictionaries',
    'ddi-household-codebook.xml',
  )

  await page.locator('input[type="file"]').setInputFiles(fixturePath)
  await expect(
    page.getByRole('heading', { name: 'Variable review' }),
  ).toBeVisible()
  await expect(page.getByText('age', { exact: true })).toBeVisible()
  await page.getByLabel('Type for sex').selectOption('nominal')
  await page.getByLabel('Role for household_id').selectOption('identifier')

  await continueToExportFromVariables(page)

  for (const language of ['SPSS v18', 'Stata v14', 'R', 'Python']) {
    await page.getByRole('tab', { name: language }).click()
    await expect(page.locator('.code-preview pre')).toContainText(
      language === 'SPSS v18'
        ? 'SPSS'
        : language === 'Stata v14'
          ? 'Stata'
          : language,
    )
  }

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('button', { name: 'Download Cleaning Plan JSON' }),
  ).toBeVisible()
})

test('statistical package uploads show privacy warning and safe fallback', async ({
  page,
}, testInfo) => {
  await openMetadataStep(page)
  await expect(
    page.getByText('SPSS and Stata files may contain confidential microdata.'),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Upload CSV, Excel, DDI XML, Stata DTA, or SPSS SAV metadata',
    ),
  ).toBeVisible()

  const dtaPath = testInfo.outputPath('unsupported.dta')
  writeFileSync(dtaPath, Buffer.from([1, 2, 3, 4]))
  await page.locator('input[type="file"]').setInputFiles(dtaPath)
  await expect(
    page.getByText(
      'Direct metadata extraction from this file was not possible.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Metadata input' }),
  ).toBeVisible()

  const savPath = testInfo.outputPath('unsupported.sav')
  writeFileSync(savPath, Buffer.from([5, 6, 7, 8]))
  await page.locator('input[type="file"]').setInputFiles(savPath)
  await expect(
    page.getByText(
      'Direct metadata extraction from this file was not possible.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Metadata input' }),
  ).toBeVisible()
})

function createMinimalXlsx(): Buffer {
  const rows = [
    ['variable_name', 'variable_label', 'data_type', 'role'],
    ['age', 'Age in completed years', 'integer', 'analysis'],
    ['sex', 'Sex of household member', 'integer', 'analysis'],
  ]
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
        '<sheets><sheet name="Dictionary" sheetId="1" r:id="rId1"/></sheets>',
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

  return Buffer.from(zipSync(files))
}

function renderWorksheet(rows: string[][]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>',
    rows
      .map(
        (row, rowIndex) =>
          `<row r="${rowIndex + 1}">${row
            .map(
              (cell, columnIndex) =>
                `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`,
            )
            .join('')}</row>`,
      )
      .join(''),
    '</sheetData></worksheet>',
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
