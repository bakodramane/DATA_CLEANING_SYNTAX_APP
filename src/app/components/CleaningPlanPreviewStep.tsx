import type { CleaningPlan, CleaningStep, ValidationResult } from '../../core'
import { translateStepRationale } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
import { formatValidationMessages } from '../state/appState'
import { HelpText } from './HelpText'
import { WarningList } from './WarningList'

interface CleaningPlanPreviewStepProps {
  plan?: CleaningPlan
  validation?: ValidationResult
}

export function CleaningPlanPreviewStep({
  plan,
  validation,
}: CleaningPlanPreviewStepProps) {
  const { language, t } = useI18n()
  const validationMessages = formatValidationMessages(validation)

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 5 })}</p>
        <h2>{t('plan.title')}</h2>
        <HelpText>{t('plan.help')}</HelpText>
      </div>

      {!plan ? (
        <p className="empty-state">{t('plan.empty')}</p>
      ) : (
        <>
          <section className="summary-band" aria-label={t('plan.summary')}>
            <div>
              <span className="metric-value">{plan.variables.length}</span>
              <span className="metric-label">{t('plan.variables')}</span>
            </div>
            <div>
              <span className="metric-value">{plan.steps.length}</span>
              <span className="metric-label">{t('plan.cleaningSteps')}</span>
            </div>
            <div>
              <span className="metric-value">
                {validation?.valid ? t('common.ready') : t('common.review')}
              </span>
              <span className="metric-label">{t('plan.validationStatus')}</span>
            </div>
          </section>

          <WarningList
            title={t('plan.validationMessages')}
            messages={validationMessages}
          />

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t('plan.step')}</th>
                  <th>{t('plan.type')}</th>
                  <th>{t('plan.variables')}</th>
                  <th>{t('plan.action')}</th>
                  <th>{t('plan.rationale')}</th>
                  <th>{t('common.citations')}</th>
                </tr>
              </thead>
              <tbody>
                {plan.steps.map((step) => (
                  <tr key={step.id}>
                    <td>
                      <code>{step.id}</code>
                    </td>
                    <td>{t(`stepType.${step.type}`)}</td>
                    <td>{step.variables.join(', ')}</td>
                    <td>{t(`action.${step.defaultAction}`)}</td>
                    <td>{translatedStepRationale(step, language)}</td>
                    <td>{step.citationKeys.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function translatedStepRationale(
  step: CleaningStep,
  language: ReturnType<typeof useI18n>['language'],
): string {
  return translateStepRationale(language, step)
}
