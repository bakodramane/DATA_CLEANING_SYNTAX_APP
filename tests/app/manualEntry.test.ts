import { describe, expect, it } from 'vitest'
import {
  createManualVariableFormValues,
  removeManualVariable,
  saveManualVariable,
  validateManualVariableForm,
} from '../../src/app/state/manualEntry'

describe('manual variable workflow helpers', () => {
  it('validates required names, duplicate names, required type, and ranges', () => {
    const messages = validateManualVariableForm(
      {
        name: 'age',
        label: '',
        type: '',
        role: 'analysis',
        storageType: '',
        valueLabels: '',
        missingCodes: '',
        validMin: '120',
        validMax: '0',
        allowedValues: '',
        skipPattern: '',
        notes: '',
      },
      [
        {
          name: 'age',
          label: 'Age',
          type: 'continuous',
          role: 'analysis',
        },
      ],
    )

    expect(messages).toEqual([
      'This variable name is already used.',
      'The variable type is required.',
      'The minimum value cannot be greater than the maximum value.',
    ])
  })

  it('adds, edits, and removes manual variables', () => {
    const added = saveManualVariable([], {
      name: 'sex',
      label: 'Sex',
      type: 'nominal',
      role: 'analysis',
      storageType: '',
      valueLabels: '1=Male; 2=Female',
      missingCodes: '-9=Refused',
      validMin: '',
      validMax: '',
      allowedValues: '',
      skipPattern: '',
      notes: 'Questionnaire item.',
    })

    expect(added.messages).toHaveLength(0)
    expect(added.variables).toHaveLength(1)
    expect(added.savedVariable?.valueLabels).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
    ])
    expect(added.savedVariable?.sourceMetadata?.sourceType).toBe('manual')

    const editForm = createManualVariableFormValues(added.variables[0])
    const edited = saveManualVariable(
      added.variables,
      { ...editForm, label: 'Respondent sex', type: 'binary' },
      'sex',
    )

    expect(edited.messages).toHaveLength(0)
    expect(edited.variables[0]).toMatchObject({
      name: 'sex',
      label: 'Respondent sex',
      type: 'binary',
    })

    expect(removeManualVariable(edited.variables, 'sex')).toHaveLength(0)
  })

  it('blocks malformed value-label text before saving', () => {
    const result = saveManualVariable([], {
      name: 'sex',
      label: '',
      type: 'nominal',
      role: 'analysis',
      storageType: '',
      valueLabels: '1=Male; malformed',
      missingCodes: '',
      validMin: '',
      validMax: '',
      allowedValues: '',
      skipPattern: '',
      notes: '',
    })

    expect(result.variables).toHaveLength(0)
    expect(result.messages.join(' ')).toContain('Could not parse label entry')
  })
})
