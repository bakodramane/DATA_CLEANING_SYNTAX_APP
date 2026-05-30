import { describe, expect, it } from 'vitest'
import {
  parseAllowedValues,
  parseMissingCodes,
  parseValueLabels,
} from '../../src/importers'

describe('dictionary value parsing', () => {
  it.each([
    ['1=Male; 2=Female'],
    ['1: Male, 2: Female'],
    ['1 Male | 2 Female'],
  ])('parses labelled values from "%s"', (text) => {
    const result = parseValueLabels(text)

    expect(result.warnings).toHaveLength(0)
    expect(result.values).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
    ])
  })

  it('parses declared missing codes and infers categories', () => {
    const result = parseMissingCodes("-8=Don't know; -9=Refused; -7=Skipped")

    expect(result.warnings).toHaveLength(0)
    expect(result.values).toEqual([
      { value: -8, label: "Don't know", category: 'dont_know' },
      { value: -9, label: 'Refused', category: 'refusal' },
      { value: -7, label: 'Skipped', category: 'structural' },
    ])
  })

  it('reports malformed label entries without dropping the warning context', () => {
    const result = parseValueLabels('1=Valid; malformed', {
      rowNumber: 4,
      columnName: 'value_labels',
    })

    expect(result.values).toEqual([{ value: 1, label: 'Valid' }])
    expect(result.warnings).toEqual([
      expect.objectContaining({
        code: 'malformed_value_label',
        rowNumber: 4,
        columnName: 'value_labels',
      }),
    ])
  })

  it('parses allowed value lists into typed values', () => {
    expect(parseAllowedValues('1, 2, true, A')).toEqual([1, 2, true, 'A'])
  })
})
