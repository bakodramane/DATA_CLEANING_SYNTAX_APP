import { describe, expect, it } from 'vitest'
import {
  RULE_FAMILIES,
  loadDefaultCitations,
  loadDefaultRules,
  validateRuleLibrary,
} from '../../src/rules'

describe('default cleaning rules', () => {
  it('loads the editable default rule library', () => {
    const rules = loadDefaultRules()
    const validation = validateRuleLibrary(rules)

    expect(rules.length).toBeGreaterThan(20)
    expect(validation.valid).toBe(true)
  })

  it('gives every default rule an ID, label, rationale and citation key', () => {
    const rules = loadDefaultRules()

    rules.forEach((rule) => {
      expect(rule.id).toBeTruthy()
      expect(rule.label).toBeTruthy()
      expect(rule.rationale).toBeTruthy()
      expect(rule.citationKeys.length).toBeGreaterThan(0)
    })
  })

  it('covers the required rule families', () => {
    const familySet = new Set(loadDefaultRules().map((rule) => rule.family))

    RULE_FAMILIES.forEach((family) => {
      expect(familySet.has(family)).toBe(true)
    })
  })

  it('ships citation entries for all default rule citation keys', () => {
    const citationKeys = new Set(
      loadDefaultCitations().map((citation) => citation.key),
    )

    loadDefaultRules().forEach((rule) => {
      rule.citationKeys.forEach((citationKey) => {
        expect(citationKeys.has(citationKey)).toBe(true)
      })
    })
  })
})
