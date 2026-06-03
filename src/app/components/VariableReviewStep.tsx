import type { SurveyVariable, VariableRole, VariableType } from '../../core'
import { useI18n } from '../../i18n/useI18n'
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
  const { t } = useI18n()

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 3 })}</p>
        <h2>{t('variables.title')}</h2>
        <HelpText>{t('variables.help')}</HelpText>
      </div>

      {variables.length === 0 ? (
        <p className="empty-state">{t('variables.empty')}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('variables.name')}</th>
                <th>{t('variables.label')}</th>
                <th>{t('variables.type')}</th>
                <th>{t('variables.role')}</th>
                <th>{t('variables.valueLabels')}</th>
                <th>{t('variables.missingCodes')}</th>
                <th>{t('variables.validRange')}</th>
                <th>{t('variables.detectionNote')}</th>
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
                      {t('variables.typeFor', { name: variable.name })}
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
                          {t(`type.${type}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label
                      className="sr-only"
                      htmlFor={`${variable.name}-role`}
                    >
                      {t('variables.roleFor', { name: variable.name })}
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
                          {t(`role.${role}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{summarizeValueLabels(variable, t)}</td>
                  <td>{summarizeMissingCodes(variable, t)}</td>
                  <td>{summarizeValidRange(variable, t)}</td>
                  <td>{detectionNotes(variable, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
