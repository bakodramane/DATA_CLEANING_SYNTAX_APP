import type { RuleReviewItem } from '../state/workflowTypes'
import { translateKnownMessage } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
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
  const { language, t, tf } = useI18n()

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 4 })}</p>
        <h2>{t('rules.title')}</h2>
        <HelpText>{t('rules.help')}</HelpText>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">{t('rules.empty')}</p>
      ) : (
        <div className="rule-review-list">
          {items.map((item) => (
            <section className="rule-group" key={item.variable.name}>
              <div className="rule-group-heading">
                <h3>
                  <code>{item.variable.name}</code>
                </h3>
                <span>
                  {t('rules.groupSummary', {
                    recommended: item.recommendedRules.length,
                    blocked: item.blockedRules.length,
                  })}
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
                      <strong>{tf(`rule.${rule.id}.label`, rule.label)}</strong>
                      <small>
                        {tf(`rule.${rule.id}.rationale`, rule.rationale)}
                      </small>
                      <small>
                        {t('common.citations')}: {rule.citationKeys.join(', ')}
                      </small>
                      {rule.requiresReview ? (
                        <small className="review-needed">
                          {t('rules.userReviewNeeded')}
                        </small>
                      ) : null}
                      {rule.warnings?.map((warning) => (
                        <small className="inline-warning" key={warning.code}>
                          {translateKnownMessage(language, warning.message)}
                        </small>
                      ))}
                    </span>
                  </label>
                ))}
              </div>

              {item.blockedRules.length > 0 ? (
                <details className="blocked-rules">
                  <summary>{t('rules.viewBlocked')}</summary>
                  <ul>
                    {item.blockedRules.map((blockedRule) => (
                      <li key={`${blockedRule.rule.id}-${blockedRule.code}`}>
                        <strong>
                          {tf(
                            `rule.${blockedRule.rule.id}.label`,
                            blockedRule.rule.label,
                          )}
                          :
                        </strong>{' '}
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
