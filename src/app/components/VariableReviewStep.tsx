import type { SurveyVariable, VariableRole, VariableType } from '../../core'
import {
  detectionNotes,
  supportedVariableRoles,
  supportedVariableTypes,
  summarizeMissingCodes,
  summarizeValidRange,
  summarizeValueLabels,
} from '../state/appState'
import { HelpText } from './HelpText'

interface VariableReviewStepProps {
  variables: SurveyVariable[]
  onCorrectVariable: (
    variableName: string,
    patch: Partial<Pick<SurveyVariable, 'type' | 'role'>>,
  ) => void
}

export function VariableReviewStep({
  variables,
  onCorrectVariable,
}: VariableReviewStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">Step 3</p>
        <h2>Variable review</h2>
        <HelpText>
          Check the detected type and role. Corrections immediately update rule
          recommendations and generated syntax.
        </HelpText>
      </div>

      {variables.length === 0 ? (
        <p className="empty-state">
          Import metadata before reviewing variables.
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Label</th>
                <th>Type</th>
                <th>Role</th>
                <th>Value labels</th>
                <th>Missing codes</th>
                <th>Valid range</th>
                <th>Detection note</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((variable) => (
                <tr key={variable.name}>
                  <td>
                    <code>{variable.name}</code>
                  </td>
                  <td>{variable.label}</td>
                  <td>
                    <label
                      className="sr-only"
                      htmlFor={`${variable.name}-type`}
                    >
                      Type for {variable.name}
                    </label>
                    <select
                      id={`${variable.name}-type`}
                      value={variable.type}
                      onChange={(event) =>
                        onCorrectVariable(variable.name, {
                          type: event.target.value as VariableType,
                        })
                      }
                    >
                      {supportedVariableTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label
                      className="sr-only"
                      htmlFor={`${variable.name}-role`}
                    >
                      Role for {variable.name}
                    </label>
                    <select
                      id={`${variable.name}-role`}
                      value={variable.role}
                      onChange={(event) =>
                        onCorrectVariable(variable.name, {
                          role: event.target.value as VariableRole,
                        })
                      }
                    >
                      {supportedVariableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{summarizeValueLabels(variable)}</td>
                  <td>{summarizeMissingCodes(variable)}</td>
                  <td>{summarizeValidRange(variable)}</td>
                  <td>{detectionNotes(variable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
