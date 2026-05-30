import type { RuleReviewItem } from '../state/workflowTypes'
import { HelpText } from './HelpText'

interface RuleReviewStepProps {
  items: RuleReviewItem[]
  onToggleRule: (
    variableName: string,
    ruleId: string,
    selected: boolean,
  ) => void
}

export function RuleReviewStep({ items, onToggleRule }: RuleReviewStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">Step 4</p>
        <h2>Rule recommendation review</h2>
        <HelpText>
          Recommended rules prefer flagging and review. Imputation means filling
          in missing values using a documented statistical method.
        </HelpText>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Import variables before reviewing rules.</p>
      ) : (
        <div className="rule-review-list">
          {items.map((item) => (
            <section className="rule-group" key={item.variable.name}>
              <div className="rule-group-heading">
                <h3>
                  <code>{item.variable.name}</code>
                </h3>
                <span>
                  {item.recommendedRules.length} recommended,{' '}
                  {item.blockedRules.length} blocked
                </span>
              </div>

              <div className="rule-grid">
                {item.recommendedRules.map((rule) => (
                  <label className="rule-option" key={rule.id}>
                    <input
                      type="checkbox"
                      checked={item.selectedRuleIds.includes(rule.id)}
                      onChange={(event) =>
                        onToggleRule(
                          item.variable.name,
                          rule.id,
                          event.target.checked,
                        )
                      }
                    />
                    <span>
                      <strong>{rule.label}</strong>
                      <small>{rule.rationale}</small>
                      <small>Citations: {rule.citationKeys.join(', ')}</small>
                      {rule.requiresReview ? (
                        <small className="review-needed">
                          User review needed
                        </small>
                      ) : null}
                      {rule.warnings?.map((warning) => (
                        <small className="inline-warning" key={warning.code}>
                          {warning.message}
                        </small>
                      ))}
                    </span>
                  </label>
                ))}
              </div>

              {item.blockedRules.length > 0 ? (
                <details className="blocked-rules">
                  <summary>View blocked rules and explanations</summary>
                  <ul>
                    {item.blockedRules.map((blockedRule) => (
                      <li key={`${blockedRule.rule.id}-${blockedRule.code}`}>
                        <strong>{blockedRule.rule.label}:</strong>{' '}
                        {blockedRule.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
