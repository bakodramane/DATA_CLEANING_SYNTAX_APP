import type { CleaningPlan, ValidationResult } from '../../core'
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
  const validationMessages = formatValidationMessages(validation)

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">Step 5</p>
        <h2>Cleaning Plan preview</h2>
        <HelpText>
          A Cleaning Plan is the language-neutral checklist that renderers turn
          into SPSS, Stata, R, and Python syntax.
        </HelpText>
      </div>

      {!plan ? (
        <p className="empty-state">Select rules before previewing the plan.</p>
      ) : (
        <>
          <section className="summary-band" aria-label="Cleaning Plan summary">
            <div>
              <span className="metric-value">{plan.variables.length}</span>
              <span className="metric-label">Variables</span>
            </div>
            <div>
              <span className="metric-value">{plan.steps.length}</span>
              <span className="metric-label">Cleaning steps</span>
            </div>
            <div>
              <span className="metric-value">
                {validation?.valid ? 'Ready' : 'Review'}
              </span>
              <span className="metric-label">Validation status</span>
            </div>
          </section>

          <WarningList
            title="Validation messages"
            messages={validationMessages}
          />

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Type</th>
                  <th>Variables</th>
                  <th>Action</th>
                  <th>Rationale</th>
                  <th>Citations</th>
                </tr>
              </thead>
              <tbody>
                {plan.steps.map((step) => (
                  <tr key={step.id}>
                    <td>
                      <code>{step.id}</code>
                    </td>
                    <td>{step.type}</td>
                    <td>{step.variables.join(', ')}</td>
                    <td>{step.defaultAction}</td>
                    <td>{step.rationale}</td>
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
