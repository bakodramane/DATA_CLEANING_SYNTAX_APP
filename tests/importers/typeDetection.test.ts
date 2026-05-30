import { describe, expect, it } from 'vitest'
import { detectVariableRole, detectVariableType } from '../../src/importers'
import type { ValueLabel, VariableRole, VariableType } from '../../src/core'

const labels = (count: number): ValueLabel[] =>
  Array.from({ length: count }, (_, index) => ({
    value: index + 1,
    label: `Label ${index + 1}`,
  }))

describe('metadata type detection', () => {
  it.each([
    {
      input: { name: 'household_id', declaredType: 'string' },
      expected: 'identifier',
    },
    {
      input: { name: 'weight_final', declaredType: 'double' },
      expected: 'weight',
    },
    {
      input: { name: 'strata', declaredType: 'string' },
      expected: 'geographic_code',
    },
    { input: { name: 'psu', declaredType: 'string' }, expected: 'identifier' },
    {
      input: { name: 'income', declaredType: 'numeric' },
      expected: 'continuous',
    },
    {
      input: { name: 'children_count', declaredType: 'integer' },
      expected: 'count',
    },
    { input: { name: 'sex', valueLabels: labels(2) }, expected: 'binary' },
    {
      input: { name: 'marital_status', valueLabels: labels(4) },
      expected: 'nominal',
    },
    {
      input: { name: 'education_level', valueLabels: labels(4) },
      expected: 'ordinal',
    },
    {
      input: { name: 'respondent_name', declaredType: 'text' },
      expected: 'string',
    },
    {
      input: { name: 'interview_date', declaredType: 'date' },
      expected: 'date',
    },
  ] satisfies Array<{
    input: Parameters<typeof detectVariableType>[0]
    expected: VariableType
  }>)('detects $expected for $input.name', ({ input, expected }) => {
    const result = detectVariableType(input)

    expect(result.value).toBe(expected)
    expect(result.reason.length).toBeGreaterThan(0)
  })
})

describe('metadata role detection', () => {
  it.each([
    { name: 'household_id', expected: 'identifier' },
    { name: 'sampling_weight', expected: 'weight' },
    { name: 'stratum', expected: 'stratum' },
    { name: 'cluster', expected: 'psu' },
    { name: 'derived_income_band', expected: 'derived' },
    { name: 'interviewer_id', expected: 'identifier' },
    { name: 'enumerator_name', expected: 'metadata' },
    { name: 'age', expected: 'analysis' },
  ] satisfies Array<{ name: string; expected: VariableRole }>)(
    'detects $expected role for $name',
    ({ name, expected }) => {
      const result = detectVariableRole(name)

      expect(result.value).toBe(expected)
      expect(result.reason.length).toBeGreaterThan(0)
    },
  )

  it('uses a supported declared role before heuristic rules', () => {
    const result = detectVariableRole('interviewer_id', 'metadata')

    expect(result.value).toBe('metadata')
    expect(result.confidence).toBe('high')
  })
})
