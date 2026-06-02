import type {
  DeclaredMissingCode,
  SurveyVariable,
  ValidRange,
  ValueLabel,
} from '../../core'
import { detectVariableRole, detectVariableType } from '../typeDetection'
import type {
  DictionaryColumnMapping,
  DictionaryImportResult,
  DictionaryImportWarning,
  DictionaryRow,
} from '../types'
import {
  attr,
  childrenByName,
  descendantsByName,
  firstChildText,
  firstDescendantText,
  inferMissingCategory,
  localName,
  looksLikeMissingLabel,
  normalizeWhitespace,
  parseVariableValue,
  parseXmlElementTree,
  textContent,
} from './ddiHelpers'
import type {
  DdiCategoryMetadata,
  DdiImportOptions,
  DdiVariableMetadata,
  XmlElementNode,
} from './ddiTypes'

const DDI_COLUMNS = [
  'DDI variable ID',
  'DDI variable name',
  'DDI label',
  'DDI text',
  'DDI representation',
] as const

export function parseDdiXmlDictionary(
  xmlText: string,
  options: DdiImportOptions = {},
): DictionaryImportResult {
  const warnings: DictionaryImportWarning[] = []
  const columnMapping = createDdiColumnMapping()
  let root: XmlElementNode

  try {
    root = parseXmlElementTree(xmlText)
  } catch (error) {
    return emptyDdiResult(columnMapping, [
      {
        code: 'invalid_xml',
        severity: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Invalid XML: the DDI file could not be parsed.',
      },
    ])
  }

  if (localName(root) !== 'codebook') {
    warnings.push({
      code: 'non_ddi_xml',
      severity: 'warning',
      message:
        'The XML document does not look like a DDI Codebook file; no variables were imported.',
    })

    return emptyDdiResult(columnMapping, warnings)
  }

  const studyTitle = extractStudyTitle(root, options.preferredLanguage)
  const variableGroups = extractVariableGroups(root, options.preferredLanguage)
  const variableElements = descendantsByName(root, 'var')
  const variables: SurveyVariable[] = []
  const rows: DictionaryRow[] = []
  const seenNames = new Map<string, number>()

  if (variableElements.length === 0) {
    warnings.push({
      code: 'empty_dictionary',
      severity: 'error',
      message: 'The DDI Codebook did not contain any <var> elements.',
    })
  }

  variableElements.forEach((variableElement, index) => {
    const rowNumber = index + 1
    const variableMetadata = extractVariableMetadata(
      variableElement,
      variableGroups,
      options,
    )

    rows.push(createDdiRow(variableElement, variableMetadata, rowNumber))

    if (!variableMetadata.name) {
      warnings.push({
        code: 'missing_variable_name',
        severity: 'error',
        message:
          'A DDI variable was missing both a name and ID and was skipped.',
        rowNumber,
      })
      return
    }

    const normalizedName = variableMetadata.name.toLowerCase()
    const firstRow = seenNames.get(normalizedName)

    if (firstRow !== undefined) {
      warnings.push({
        code: 'duplicate_variable_name',
        severity: 'error',
        message: `Variable "${variableMetadata.name}" duplicates a variable first seen on DDI row ${firstRow}.`,
        rowNumber,
      })
    } else {
      seenNames.set(normalizedName, rowNumber)
    }

    const categories = extractCategories(variableElement, options)
    const variableWarnings = collectCategoryWarnings(
      variableMetadata.name,
      categories,
      rowNumber,
      options,
    )
    warnings.push(...variableWarnings)

    const valueLabels = buildValueLabels(categories)
    const declaredMissingCodes = buildDeclaredMissingCodes(categories)
    const validRange = extractValidRange(variableElement)
    const representation = extractRepresentation(variableElement)
    const typeDetection = detectVariableType({
      name: variableMetadata.name,
      declaredType: representation.declaredType,
      storageType: representation.storageType,
      valueLabels,
      validMin: validRange?.min,
      validMax: validRange?.max,
    })
    const roleDetection = detectVariableRole(variableMetadata.name)

    variables.push({
      name: variableMetadata.name,
      label: variableMetadata.label || variableMetadata.name,
      type: typeDetection.value,
      role: roleDetection.value,
      storageType: representation.storageType || representation.declaredType,
      valueLabels,
      validRange,
      declaredMissingCodes,
      sourceMetadata: {
        sourceName: options.sourceName,
        sourceType: 'ddi',
        columnName: variableMetadata.name,
        originalType: representation.declaredType,
        rowNumber,
        originalColumns: rows[rows.length - 1]?.raw,
        notes: [
          studyTitle ? `DDI study title: ${studyTitle}` : '',
          variableMetadata.ddiId
            ? `DDI variable ID: ${variableMetadata.ddiId}`
            : '',
          variableMetadata.originalName
            ? `Original DDI variable name: ${variableMetadata.originalName}`
            : '',
          variableMetadata.label
            ? `Original DDI label: ${variableMetadata.label}`
            : '',
          variableMetadata.description
            ? `DDI description: ${variableMetadata.description}`
            : '',
          variableMetadata.questionText
            ? `DDI question text: ${variableMetadata.questionText}`
            : '',
          variableMetadata.universe
            ? `DDI universe: ${variableMetadata.universe}`
            : '',
          variableMetadata.groupLabels.length > 0
            ? `DDI variable groups: ${variableMetadata.groupLabels.join('; ')}`
            : '',
          `Detected type: ${typeDetection.value} (${typeDetection.confidence}) - ${typeDetection.reason}`,
          `Detected role: ${roleDetection.value} (${roleDetection.confidence}) - ${roleDetection.reason}`,
          ...variableMetadata.notes,
        ].filter(Boolean),
      },
      userNotes: variableMetadata.notes.join('; ') || undefined,
    })
  })

  return {
    variables,
    columnMapping,
    warnings,
    unmappedColumns: [],
    originalRowCount: variableElements.length,
    importedVariableCount: variables.length,
    rows,
  }
}

function extractStudyTitle(
  root: XmlElementNode,
  preferredLanguage?: string,
): string | undefined {
  const studyDescription = descendantsByName(root, 'stdydscr')[0]

  return studyDescription
    ? firstDescendantText(studyDescription, 'titl', preferredLanguage)
    : firstDescendantText(root, 'titl', preferredLanguage)
}

function extractVariableGroups(
  root: XmlElementNode,
  preferredLanguage?: string,
): Map<string, string[]> {
  const groupsByVariable = new Map<string, string[]>()

  descendantsByName(root, 'vargrp').forEach((group) => {
    const groupLabel =
      firstChildText(group, 'labl', preferredLanguage) ??
      attr(group, ['ID', 'id']) ??
      'Unnamed DDI variable group'
    const refs = [
      attr(group, 'var'),
      attr(group, 'vars'),
      attr(group, 'varRef'),
      attr(group, 'varrefs'),
    ]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.split(/\s+/))
      .map((value) => value.replace(/^#/, '').trim())
      .filter(Boolean)

    refs.forEach((ref) => {
      groupsByVariable.set(ref, [
        ...(groupsByVariable.get(ref) ?? []),
        groupLabel,
      ])
    })
  })

  return groupsByVariable
}

function extractVariableMetadata(
  variableElement: XmlElementNode,
  variableGroups: Map<string, string[]>,
  options: DdiImportOptions,
): DdiVariableMetadata {
  const ddiId = attr(variableElement, ['ID', 'id'])
  const originalName = attr(variableElement, 'name')
  const name = normalizeVariableName(originalName || ddiId || '')
  const label = firstChildText(
    variableElement,
    'labl',
    options.preferredLanguage,
  )
  const description =
    firstChildText(variableElement, 'txt', options.preferredLanguage) ??
    firstDescendantText(variableElement, 'txt', options.preferredLanguage)
  const questionText = firstDescendantText(
    variableElement,
    'qstnlit',
    options.preferredLanguage,
  )
  const universe = firstChildText(
    variableElement,
    'universe',
    options.preferredLanguage,
  )
  const notes = childrenByName(variableElement, 'notes')
    .map(textContent)
    .filter(Boolean)
    .map((note) => `DDI note: ${note}`)
  const groupLabels = [ddiId, originalName, name]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => variableGroups.get(value) ?? [])

  return {
    ddiId,
    originalName,
    name,
    label,
    description,
    questionText,
    universe,
    notes,
    groupLabels: [...new Set(groupLabels)],
  }
}

function extractCategories(
  variableElement: XmlElementNode,
  options: DdiImportOptions,
): DdiCategoryMetadata[] {
  return childrenByName(variableElement, 'catgry').map((categoryElement) => {
    const rawValue = firstChildText(categoryElement, 'catvalu')
    const label = firstChildText(
      categoryElement,
      'labl',
      options.preferredLanguage,
    )
    const explicitMissing = isMarkedMissing(categoryElement)
    const inferredMissing =
      options.inferMissingCodes !== false &&
      !explicitMissing &&
      Boolean(label && looksLikeMissingLabel(label))

    return {
      value: rawValue ? parseVariableValue(rawValue) : undefined,
      label,
      explicitMissing,
      inferredMissing,
      rawText: textContent(categoryElement),
    }
  })
}

function collectCategoryWarnings(
  variableName: string,
  categories: DdiCategoryMetadata[],
  rowNumber: number,
  options: DdiImportOptions,
): DictionaryImportWarning[] {
  const warnings: DictionaryImportWarning[] = []

  categories.forEach((category) => {
    if (category.value === undefined || !category.label) {
      warnings.push({
        code: 'unsupported_ddi_metadata',
        severity: 'warning',
        message: `Variable "${variableName}" has a category with incomplete value-label metadata; the raw category text was preserved.`,
        rowNumber,
      })
    }

    if (category.inferredMissing) {
      warnings.push({
        code: 'inferred_missing_code',
        severity: 'warning',
        message: `Variable "${variableName}" has category "${category.rawText}" treated as a missing code based on its label; review this inference.`,
        rowNumber,
      })
    }

    if (options.preserveUnsupportedXml && category.rawText) {
      return
    }
  })

  return warnings
}

function buildValueLabels(categories: DdiCategoryMetadata[]): ValueLabel[] {
  return categories.reduce<ValueLabel[]>((labels, category) => {
    if (category.value !== undefined && category.label) {
      labels.push({
        value: category.value,
        label: category.label,
      })
    }

    return labels
  }, [])
}

function buildDeclaredMissingCodes(
  categories: DdiCategoryMetadata[],
): DeclaredMissingCode[] {
  return categories.reduce<DeclaredMissingCode[]>((codes, category) => {
    if (
      category.value !== undefined &&
      (category.explicitMissing || category.inferredMissing)
    ) {
      const label = category.label ?? String(category.value)

      codes.push({
        value: category.value,
        label,
        category: inferMissingCategory(label),
      })
    }

    return codes
  }, [])
}

function extractValidRange(
  variableElement: XmlElementNode,
): ValidRange | undefined {
  const rangeElement =
    descendantsByName(variableElement, 'range')[0] ??
    descendantsByName(variableElement, 'valrng')[0]
  const min =
    attr(rangeElement ?? variableElement, ['min', 'minimum']) ??
    firstChildText(rangeElement ?? variableElement, 'min')
  const max =
    attr(rangeElement ?? variableElement, ['max', 'maximum']) ??
    firstChildText(rangeElement ?? variableElement, 'max')

  if (!min && !max) {
    return undefined
  }

  return {
    min: parseRangeValue(min),
    max: parseRangeValue(max),
    inclusiveMin: attr(rangeElement ?? variableElement, 'minExclusive')
      ? false
      : true,
    inclusiveMax: attr(rangeElement ?? variableElement, 'maxExclusive')
      ? false
      : true,
  }
}

function extractRepresentation(variableElement: XmlElementNode): {
  declaredType?: string
  storageType?: string
} {
  const varFormat = descendantsByName(variableElement, 'varformat')[0]
  const declaredType = normalizeWhitespace(
    [
      attr(variableElement, 'type'),
      attr(variableElement, 'intrvl'),
      attr(varFormat ?? variableElement, 'type'),
      attr(varFormat ?? variableElement, 'formatname'),
      firstChildText(variableElement, 'varformat'),
    ]
      .filter(Boolean)
      .join(' '),
  )

  return {
    declaredType: declaredType || undefined,
    storageType:
      attr(varFormat ?? variableElement, 'type') ??
      attr(varFormat ?? variableElement, 'formatname'),
  }
}

function createDdiRow(
  variableElement: XmlElementNode,
  metadata: DdiVariableMetadata,
  rowNumber: number,
): DictionaryRow {
  const raw = {
    'DDI variable ID': metadata.ddiId ?? '',
    'DDI variable name': metadata.originalName ?? '',
    'DDI label': metadata.label ?? '',
    'DDI text': metadata.description ?? metadata.questionText ?? '',
    'DDI representation':
      extractRepresentation(variableElement).declaredType ?? '',
  }

  return {
    rowNumber,
    raw,
    canonical: {
      name: metadata.name,
      label: metadata.label,
      type: raw['DDI representation'],
      notes: metadata.notes.join('; '),
    },
    unmapped: {},
  }
}

function createDdiColumnMapping(): DictionaryColumnMapping {
  return {
    columns: [...DDI_COLUMNS],
    mappedColumns: {
      name: 'DDI variable name',
      label: 'DDI label',
      type: 'DDI representation',
      notes: 'DDI text',
    },
    detectedSuggestions: [
      {
        concept: 'name',
        columnName: 'DDI variable name',
        confidence: 'high',
        reason: 'DDI <var> name attributes were used for variable names.',
      },
      {
        concept: 'label',
        columnName: 'DDI label',
        confidence: 'high',
        reason: 'DDI <labl> elements were used for variable labels.',
      },
    ],
    ambiguousMappings: [],
    unmappedColumns: [],
  }
}

function emptyDdiResult(
  columnMapping: DictionaryColumnMapping,
  warnings: DictionaryImportWarning[],
): DictionaryImportResult {
  return {
    variables: [],
    columnMapping,
    warnings,
    unmappedColumns: [],
    originalRowCount: 0,
    importedVariableCount: 0,
    rows: [],
  }
}

function normalizeVariableName(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9_]/g, '_')
}

function parseRangeValue(
  value: string | undefined,
): string | number | undefined {
  const parsedValue = value ? parseVariableValue(value) : undefined

  return typeof parsedValue === 'boolean' || parsedValue === null
    ? undefined
    : parsedValue
}

function isMarkedMissing(categoryElement: XmlElementNode): boolean {
  return ['missing', 'miss', 'isMissing'].some((name) =>
    /^(y|yes|true|1)$/i.test(attr(categoryElement, name) ?? ''),
  )
}
