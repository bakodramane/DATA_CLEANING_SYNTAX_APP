import { describe, expect, it } from 'vitest'
import { createVariableFromManualEntry } from '../../src/importers'

describe('createVariableFromManualEntry', () => {
  it('converts manual metadata into a core SurveyVariable', () => {
    const result = createVariableFromManualEntry({
      name: 'education_level',
      label: 'Highest education level completed',
      role: 'analysis',
      valueLabels:
        '0=No schooling; 1=Primary; 2=Lower secondary; 3=Upper secondary',
      missingCodes: "98=Don't know; 99=Refused",
      validMin: 0,
      validMax: 3,
      notes: 'Entered manually from the codebook.',
    })

    expect(result.warnings).toHaveLength(0)
    expect(result.variable).toMatchObject({
      name: 'education_level',
      label: 'Highest education level completed',
      type: 'ordinal',
      role: 'analysis',
      validRange: {
        min: 0,
        max: 3,
        inclusiveMin: true,
        inclusiveMax: true,
      },
      userNotes: 'Entered manually from the codebook.',
    })
    expect(result.variable.valueLabels).toHaveLength(4)
    expect(result.variable.declaredMissingCodes).toEqual([
      { value: 98, label: "Don't know", category: 'dont_know' },
      { value: 99, label: 'Refused', category: 'refusal' },
    ])
    expect(result.variable.sourceMetadata?.sourceType).toBe('manual')
    expect(result.variable.sourceMetadata?.notes?.join(' ')).toContain(
      'Manual value labels',
    )
  })

  it('reports malformed manual value-label text', () => {
    const result = createVariableFromManualEntry({
      name: 'sex',
      valueLabels: '1=Male; malformed',
    })

    expect(result.warnings.map((warning) => warning.code)).toContain(
      'malformed_value_label',
    )
    expect(result.variable.valueLabels).toEqual([{ value: 1, label: 'Male' }])
  })
})
