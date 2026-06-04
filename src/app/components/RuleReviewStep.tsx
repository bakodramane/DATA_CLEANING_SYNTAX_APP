import type { RuleReviewItem } from '../state/workflowTypes'
import {
  METHODOLOGY_PRESETS,
  getMethodologyPresetDefinition,
  type MethodologyPresetId,
} from '../../rules'
import {
  translateBlockedRuleReason,
  translateRuleDescription,
  translateRuleLabel,
  translateRuleRationale,
  translateRuleWarning,
} from '../../i18n'
import { useI18n } from '../../i18n/useI18n'
import { HelpText } from './HelpText'

interface RuleReviewStepProps {
  items: RuleReviewItem[]
  methodologyPreset: MethodologyPresetId
  onSelectMethodologyPreset: (methodologyPreset: MethodologyPresetId) => void
  onToggleRule: (
    variableName: string,
    ruleId: string,
    selected: boolean,
  ) => void
}

export function RuleReviewStep({
  items,
  methodologyPreset,
  onSelectMethodologyPreset,
  onToggleRule,
}: RuleReviewStepProps) {
  const { language, t } = useI18n()

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 4 })}</p>
        <h2>{t('rules.title')}</h2>
        <HelpText>{t('rules.help')}</HelpText>
      </div>

      <fieldset className="preset-selector">
        <legend>{t('presets.title')}</legend>
        <HelpText>{t('presets.help')}</HelpText>
        <div className="preset-grid">
          {METHODOLOGY_PRESETS.map((preset) => {
            const definition = getMethodologyPresetDefinition(preset)

            return (
              <label className="preset-option" key={preset}>
                <input
                  type="radio"
                  name="methodology-preset"
                  value={preset}
                  checked={methodologyPreset === preset}
                  onChange={() => onSelectMethodologyPreset(preset)}
                />
                <span>
                  <strong>{t(`preset.${preset}.name`)}</strong>
                  <small>{t(`preset.${preset}.description`)}</small>
                  <small>
                    <b>{t('presets.useCase')}:</b>{' '}
                    {t(`preset.${preset}.useCase`)}
                  </small>
                  <small>
                    <b>{t('presets.includes')}:</b>{' '}
                    {definition.includedFamilies
                      .map((family) => t(`ruleFamily.${family}`))
                      .join(', ')}
                  </small>
                  <small>
                    <b>{t('presets.excludes')}:</b>{' '}
                    {definition.excludedFamilies
                      .map((family) => t(`ruleFamily.${family}`))
                      .join(', ')}
                  </small>
                  <small className="inline-warning">
                    {t(`preset.${preset}.caution`)}
                  </small>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

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
                      <strong>{translateRuleLabel(language, rule)}</strong>
                      <small>{translateRuleDescription(language, rule)}</small>
                      <small>{translateRuleRationale(language, rule)}</small>
                      <small>
                        {t('common.citations')}: {rule.citationKeys.join(', ')}
                      </small>
                      {rule.requiresReview ? (
                        <small className="review-needed">
                          {t('rules.userReviewNeeded')}
                        </small>
                      ) : null}
                      {rule.warnings && rule.warnings.length > 0 ? (
                        <span className="method-warning-group">
                          <small>{t('rules.methodWarnings')}</small>
                          {rule.warnings.map((warning) => (
                            <small
                              className="inline-warning"
                              key={warning.code}
                            >
                              {translateRuleWarning(language, rule, warning)}
                            </small>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>

              {item.selectedRuleIds.length === 0 ? (
                <p className="empty-state">{t('rules.noneSelected')}</p>
              ) : null}

              {item.blockedRules.length > 0 ? (
                <details className="blocked-rules">
                  <summary>{t('rules.viewBlocked')}</summary>
                  <ul>
                    {item.blockedRules.map((blockedRule) => (
                      <li key={`${blockedRule.rule.id}-${blockedRule.code}`}>
                        <strong>
                          {translateRuleLabel(language, blockedRule.rule)}:
                        </strong>{' '}
                        {translateBlockedRuleReason(language, blockedRule)}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <p className="small-note">{t('rules.noBlocked')}</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
