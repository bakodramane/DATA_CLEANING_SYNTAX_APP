import { useState, type ChangeEvent } from 'react'
import type { SurveyVariable } from '../../core'
import {
  createManualVariableFormValues,
  emptyManualVariableForm,
  isManualVariable,
  type ManualVariableFormValues,
  type ManualVariableSaveResult,
} from '../state/manualEntry'
import {
  supportedVariableRoles,
  supportedVariableTypes,
} from '../state/appState'
import { HelpText } from './HelpText'
import { WarningList } from './WarningList'

interface ManualVariableEntryProps {
  variables: SurveyVariable[]
  onSaveVariable: (
    formValues: ManualVariableFormValues,
    editingName?: string,
  ) => ManualVariableSaveResult
  onRemoveVariable: (variableName: string) => void
}

export function ManualVariableEntry({
  variables,
  onSaveVariable,
  onRemoveVariable,
}: ManualVariableEntryProps) {
  const [formValues, setFormValues] = useState<ManualVariableFormValues>({
    ...emptyManualVariableForm,
  })
  const [editingName, setEditingName] = useState<string | undefined>()
  const [messages, setMessages] = useState<string[]>([])
  const manualVariables = variables.filter(isManualVariable)

  const updateField =
    (field: keyof ManualVariableFormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const saveVariable = () => {
    const result = onSaveVariable(formValues, editingName)

    setMessages(result.messages)

    if (result.messages.length === 0) {
      setFormValues({ ...emptyManualVariableForm })
      setEditingName(undefined)
    }
  }

  const editVariable = (variable: SurveyVariable) => {
    setFormValues(createManualVariableFormValues(variable))
    setEditingName(variable.name)
    setMessages([])
  }

  const cancelEdit = () => {
    setFormValues({ ...emptyManualVariableForm })
    setEditingName(undefined)
    setMessages([])
  }

  return (
    <section className="manual-entry-panel" aria-label="Manual variable entry">
      <div className="step-heading">
        <h3>Manual variable entry</h3>
        <HelpText>
          Add variables one by one when no dictionary file is available. Value
          labels and missing codes accept entries like 1=Male; 2=Female or
          -8=Don't know; -9=Refused.
        </HelpText>
      </div>

      <div className="form-grid">
        <label>
          <span>Variable name</span>
          <input
            type="text"
            value={formValues.name}
            onChange={updateField('name')}
            placeholder="age"
          />
        </label>

        <label>
          <span>Variable label</span>
          <input
            type="text"
            value={formValues.label}
            onChange={updateField('label')}
            placeholder="Age in completed years"
          />
        </label>

        <label>
          <span>Variable type</span>
          <select value={formValues.type} onChange={updateField('type')}>
            <option value="">Select type</option>
            {supportedVariableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Variable role</span>
          <select value={formValues.role} onChange={updateField('role')}>
            {supportedVariableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Storage type</span>
          <input
            type="text"
            value={formValues.storageType}
            onChange={updateField('storageType')}
            placeholder="numeric"
          />
        </label>

        <label>
          <span>Allowed values</span>
          <input
            type="text"
            value={formValues.allowedValues}
            onChange={updateField('allowedValues')}
            placeholder="1, 2, 3"
          />
        </label>

        <label className="wide-field">
          <span>Value labels</span>
          <input
            type="text"
            value={formValues.valueLabels}
            onChange={updateField('valueLabels')}
            placeholder="1=Male; 2=Female"
          />
        </label>

        <label className="wide-field">
          <span>Missing-value codes</span>
          <input
            type="text"
            value={formValues.missingCodes}
            onChange={updateField('missingCodes')}
            placeholder="-8=Don't know; -9=Refused"
          />
        </label>

        <label>
          <span>Valid minimum</span>
          <input
            type="text"
            value={formValues.validMin}
            onChange={updateField('validMin')}
            placeholder="0"
          />
        </label>

        <label>
          <span>Valid maximum</span>
          <input
            type="text"
            value={formValues.validMax}
            onChange={updateField('validMax')}
            placeholder="120"
          />
        </label>

        <label className="wide-field">
          <span>Skip-pattern note</span>
          <input
            type="text"
            value={formValues.skipPattern}
            onChange={updateField('skipPattern')}
            placeholder="Only asked when respondent is employed"
          />
        </label>

        <label className="wide-field">
          <span>User notes</span>
          <textarea
            rows={3}
            value={formValues.notes}
            onChange={updateField('notes')}
            placeholder="Entered manually from the questionnaire."
          />
        </label>
      </div>

      <div className="action-row">
        <button className="primary-button" type="button" onClick={saveVariable}>
          {editingName ? 'Update manual variable' : 'Add manual variable'}
        </button>
        {editingName ? (
          <button
            className="secondary-button"
            type="button"
            onClick={cancelEdit}
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <WarningList title="Manual-entry validation" messages={messages} />

      {manualVariables.length > 0 ? (
        <div className="manual-variable-list">
          <h3>Manual variables</h3>
          {manualVariables.map((variable) => (
            <article className="manual-variable-row" key={variable.name}>
              <div>
                <strong>{variable.name}</strong>
                <p>
                  {variable.label} · {variable.type} · {variable.role}
                </p>
              </div>
              <div className="action-row">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => editVariable(variable)}
                >
                  Edit
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onRemoveVariable(variable.name)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
