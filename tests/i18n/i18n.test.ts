import { describe, expect, it } from 'vitest'
import {
  dictionaries,
  languageStorageKey,
  normaliseLanguage,
  translate,
  translateKnownMessage,
  translateWithFallback,
} from '../../src/i18n'

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
