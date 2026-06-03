import { describe, expect, it } from 'vitest'
import {
  dictionaries,
  languageStorageKey,
  normaliseLanguage,
  translate,
  translateBlockedRuleReason,
  translateKnownMessage,
  translateRuleDescription,
  translateRuleLabel,
  translateRuleRationale,
  translateRuleWarning,
  translateWithFallback,
} from '../../src/i18n'
import { loadDefaultRules } from '../../src/rules'

describe('i18n helpers', () => {
  it('defaults unsupported language codes to English', () => {
    expect(normaliseLanguage(null)).toBe('en')
    expect(normaliseLanguage('fr')).toBe('fr')
    expect(normaliseLanguage('es')).toBe('en')
  })

  it('translates English and French UI keys', () => {
    expect(translate('en', 'project.title')).toBe('Project information')
    expect(translate('fr', 'project.title')).toBe('Informations sur le projet')
  })

  it('falls back to English when a selected language misses a key', () => {
    const original = dictionaries.fr['app.title']
    delete dictionaries.fr['app.title']

    try {
      expect(translate('fr', 'app.title')).toBe('Cleaning Syntax Generator')
    } finally {
      dictionaries.fr['app.title'] = original
    }
  })

  it('falls back to caller-provided text for dynamic translated content', () => {
    expect(
      translateWithFallback('fr', 'rule.not_translated.label', 'Original rule'),
    ).toBe('Original rule')
  })

  it('translates reviewer-facing rule text and warnings', () => {
    const labelRule = findRule('preserve_variable_label')
    const warningRule = findRule('structural_missingness_check')
    const warning = warningRule.warnings?.[0]

    expect(translateRuleLabel('en', labelRule)).toBe('Preserve variable label')
    expect(translateRuleLabel('fr', labelRule)).toBe(
      'Conserver le libelle de variable',
    )
    expect(translateRuleDescription('fr', labelRule)).toContain(
      'libelle du codebook',
    )
    expect(translateRuleRationale('fr', warningRule)).toContain(
      'valeurs manquantes structurelles',
    )
    expect(warning).toBeDefined()
    expect(translateRuleWarning('fr', warningRule, warning!)).toContain(
      'exclues de l imputation',
    )
  })

  it('translates blocked-rule explanations with fallback values', () => {
    const rule = findRule('impute_continuous_mice_pmm')

    expect(
      translateBlockedRuleReason('fr', {
        code: 'identifier_imputation',
        reason: 'Identifiers should not be imputed.',
        rule,
        variableName: 'household_id',
      }),
    ).toContain('Les identifiants ne doivent pas etre imputes')
  })

  it('translates known warnings without changing unknown parser details', () => {
    expect(
      translateKnownMessage(
        'fr',
        'Direct metadata extraction from this file was not possible. Export a metadata-only variable dictionary from SPSS or Stata to CSV/Excel, including variable names, labels, storage types, value labels, missing codes, valid ranges, and notes where available, then import that dictionary instead.',
      ),
    ).toContain('L extraction directe')
    expect(translateKnownMessage('fr', 'Dynamic parser warning')).toBe(
      'Dynamic parser warning',
    )
  })

  it('exposes the local storage key used for language persistence', () => {
    expect(languageStorageKey).toBe('data-cleaning-syntax-app.language')
  })
})

function findRule(ruleId: string) {
  const rule = loadDefaultRules().find((candidate) => candidate.id === ruleId)

  if (!rule) {
    throw new Error(`Missing fixture rule: ${ruleId}`)
  }

  return rule
}
