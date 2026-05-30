import { describe, expect, it } from 'vitest'
import { detectColumnMapping } from '../../src/importers'

describe('dictionary column mapping', () => {
  it('maps common column-name variants to canonical concepts', () => {
    const mapping = detectColumnMapping([
      'var_name',
      'description',
      'data_type',
      'variable_role',
      'categories',
      'missing_codes',
      'valid_min',
      'valid_max',
      'comments',
    ])

    expect(mapping.mappedColumns).toMatchObject({
      name: 'var_name',
      label: 'description',
      type: 'data_type',
      role: 'variable_role',
      valueLabels: 'categories',
      missingCodes: 'missing_codes',
      validMin: 'valid_min',
      validMax: 'valid_max',
      notes: 'comments',
    })
  })

  it('records ambiguous mappings as inspectable suggestions', () => {
    const mapping = detectColumnMapping(['name', 'variable_name', 'label'])

    expect(mapping.mappedColumns.name).toBe('name')
    expect(mapping.ambiguousMappings).toEqual([
      expect.objectContaining({
        concept: 'name',
        candidateColumns: ['name', 'variable_name'],
      }),
    ])
  })

  it('preserves unmapped columns for source metadata', () => {
    const mapping = detectColumnMapping(['variable_name', 'field_owner'])

    expect(mapping.mappedColumns.name).toBe('variable_name')
    expect(mapping.unmappedColumns).toEqual(['field_owner'])
  })

  it('honours explicit user mappings', () => {
    const mapping = detectColumnMapping(['Question ID', 'Question Text'], {
      name: 'Question ID',
      label: 'Question Text',
    })

    expect(mapping.mappedColumns.name).toBe('Question ID')
    expect(mapping.mappedColumns.label).toBe('Question Text')
  })
})
