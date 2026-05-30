import type { DetectionResult, DictionaryRow } from './types'
import type { ValueLabel, VariableRole, VariableType } from '../core'

export interface TypeDetectionInput {
  name: string
  declaredType?: string
  storageType?: string
  valueLabels?: ValueLabel[]
  validMin?: string | number
  validMax?: string | number
}

export function detectVariableType(
  input: TypeDetectionInput,
): DetectionResult<VariableType> {
  const name = input.name.toLowerCase()
  const declaredType = `${input.declaredType ?? ''} ${input.storageType ?? ''}`
    .trim()
    .toLowerCase()

  if (/\b(date|datetime)\b/.test(declaredType) || /\b(date|dob)\b/.test(name)) {
    return {
      value: 'date',
      confidence: 'high',
      reason: 'The declared type or variable name is date-like.',
    }
  }

  if (/\b(time)\b/.test(declaredType) || /\b(time)\b/.test(name)) {
    return {
      value: 'time',
      confidence: 'high',
      reason: 'The declared type or variable name is time-like.',
    }
  }

  if (/(^|_)(hhid|id|identifier)($|_)/.test(name) || name.endsWith('_id')) {
    return {
      value: 'identifier',
      confidence: 'high',
      reason: 'The variable name looks like an identifier.',
    }
  }

  if (/(weight|wgt|sampling_weight|final_weight)/.test(name)) {
    return {
      value: 'weight',
      confidence: 'high',
      reason: 'The variable name looks like a survey weight.',
    }
  }

  if (/(strata|stratum|region|district|geo|geocode)/.test(name)) {
    return {
      value: 'geographic_code',
      confidence: 'high',
      reason:
        'The variable name looks like a geographic or sampling-domain code.',
    }
  }

  if (/(^|_)(psu|cluster|ea)($|_)/.test(name)) {
    return {
      value: 'identifier',
      confidence: 'high',
      reason:
        'The variable name looks like a primary sampling unit identifier.',
    }
  }

  if (/\b(string|text|character|char)\b/.test(declaredType)) {
    return {
      value: input.valueLabels?.length ? 'nominal' : 'string',
      confidence: input.valueLabels?.length ? 'medium' : 'high',
      reason: input.valueLabels?.length
        ? 'String storage has value labels, so it is treated as nominal.'
        : 'The declared type is text-like.',
    }
  }

  if (input.valueLabels?.length === 2) {
    return {
      value: 'binary',
      confidence: 'high',
      reason: 'Exactly two labelled values were provided.',
    }
  }

  if (input.valueLabels && input.valueLabels.length > 2) {
    const orderedName = /(level|grade|rank|order|education)/.test(name)
    return {
      value: orderedName ? 'ordinal' : 'nominal',
      confidence: orderedName ? 'high' : 'medium',
      reason: orderedName
        ? 'The variable name suggests ordered categories.'
        : 'Multiple categorical labels were provided without a clear order.',
    }
  }

  if (/\b(byte|int|integer|long)\b/.test(declaredType)) {
    return {
      value: 'count',
      confidence: 'medium',
      reason: looksLikeSmallIntegerDomain(input)
        ? 'The declared type is integer-like with a small numeric range.'
        : 'The declared type is integer-like.',
    }
  }

  if (/\b(numeric|number|double|float|decimal|real)\b/.test(declaredType)) {
    return {
      value: 'continuous',
      confidence: 'medium',
      reason: 'The declared type is numeric-like.',
    }
  }

  if (input.validMin !== undefined || input.validMax !== undefined) {
    return {
      value: 'continuous',
      confidence: 'low',
      reason:
        'A numeric range was provided, but no stronger type metadata was available.',
    }
  }

  return {
    value: 'string',
    confidence: 'low',
    reason: 'No reliable type metadata was available; defaulting to string.',
  }
}

export function detectVariableRole(
  name: string,
  declaredRole?: string,
): DetectionResult<VariableRole> {
  const normalizedName = name.toLowerCase()
  const normalizedRole = declaredRole?.trim().toLowerCase()

  if (isVariableRole(normalizedRole)) {
    return {
      value: normalizedRole,
      confidence: 'high',
      reason: 'The dictionary declared a supported variable role.',
    }
  }

  if (
    /(^|_)(hhid|id|identifier)($|_)/.test(normalizedName) ||
    normalizedName.endsWith('_id')
  ) {
    return {
      value: 'identifier',
      confidence: 'high',
      reason: 'The variable name looks like an identifier.',
    }
  }

  if (/(weight|wgt|sampling_weight|final_weight)/.test(normalizedName)) {
    return {
      value: 'weight',
      confidence: 'high',
      reason: 'The variable name looks like a survey weight.',
    }
  }

  if (/(strata|stratum)/.test(normalizedName)) {
    return {
      value: 'stratum',
      confidence: 'high',
      reason: 'The variable name looks like a sampling stratum.',
    }
  }

  if (/(^|_)(psu|cluster|ea)($|_)/.test(normalizedName)) {
    return {
      value: 'psu',
      confidence: 'high',
      reason: 'The variable name looks like a primary sampling unit.',
    }
  }

  if (/(derived|calc|computed)/.test(normalizedName)) {
    return {
      value: 'derived',
      confidence: 'medium',
      reason: 'The variable name suggests a derived variable.',
    }
  }

  if (/(source|file|timestamp|interviewer|enumerator)/.test(normalizedName)) {
    return {
      value: 'metadata',
      confidence: 'medium',
      reason:
        'The variable name suggests metadata rather than analysis content.',
    }
  }

  return {
    value: 'analysis',
    confidence: 'low',
    reason: 'No special role was detected; defaulting to analysis.',
  }
}

export function detectTypeFromDictionaryRow(
  row: DictionaryRow,
  valueLabels: ValueLabel[],
): DetectionResult<VariableType> {
  return detectVariableType({
    name: row.canonical.name ?? '',
    declaredType: row.canonical.type,
    storageType: row.canonical.storageType,
    valueLabels,
    validMin: row.canonical.validMin,
    validMax: row.canonical.validMax,
  })
}

function isVariableRole(value: string | undefined): value is VariableRole {
  return Boolean(
    value &&
    [
      'identifier',
      'weight',
      'stratum',
      'psu',
      'analysis',
      'auxiliary',
      'derived',
      'metadata',
    ].includes(value),
  )
}

function looksLikeSmallIntegerDomain(input: TypeDetectionInput): boolean {
  const min = Number(input.validMin)
  const max = Number(input.validMax)

  return Number.isFinite(min) && Number.isFinite(max) && max - min <= 30
}
