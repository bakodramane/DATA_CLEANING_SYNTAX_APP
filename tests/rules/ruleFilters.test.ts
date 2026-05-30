import { describe, expect, it } from 'vitest'
import { sampleCleaningPlan, type SurveyVariable } from '../../src/core'
import {
  getApplicableRules,
  getBlockedRules,
  getRecommendedRules,
} from '../../src/rules'

function sampleVariable(name: string): SurveyVariable {
  const variable = sampleCleaningPlan.variables.find(
    (candidate) => candidate.name === name,
  )

  if (!variable) {
    throw new Error(`Expected sample variable "${name}".`)
  }

  return structuredClone(variable)
}

function ruleIds(rules: Array<{ id: string }>): string[] {
  return rules.map((rule) => rule.id)
}

describe('rule filtering', () => {
  it('offers range, missingness and outlier options for continuous variables', () => {
    const rules = getRecommendedRules(sampleVariable('income'), {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age', 'sex', 'education_level'],
    })

    expect(ruleIds(rules)).toEqual(
      expect.arrayContaining([
        'range_check_from_metadata',
        'missingness_diagnosis_basic',
        'outlier_tukey_flag',
        'outlier_mad_flag',
      ]),
    )
  })

  it('offers domain checks for nominal variables but no Tukey or MAD outlier rules', () => {
    const rules = getRecommendedRules(sampleVariable('sex'))
    const blockedRules = getBlockedRules(sampleVariable('sex'))

    expect(ruleIds(rules)).toContain('domain_check_from_labels')
    expect(ruleIds(rules)).not.toContain('outlier_tukey_flag')
    expect(ruleIds(rules)).not.toContain('outlier_mad_flag')
    expect(
      blockedRules.some(
        (blockedRule) =>
          blockedRule.rule.id === 'outlier_tukey_flag' &&
          blockedRule.code === 'invalid_outlier_variable_type',
      ),
    ).toBe(true)
  })

  it('offers binary domain checks and model-aware imputation options', () => {
    const binaryVariable: SurveyVariable = {
      name: 'owns_phone',
      label: 'Owns a mobile phone',
      type: 'binary',
      role: 'analysis',
      valueLabels: [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    }
    const rules = getRecommendedRules(binaryVariable, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age', 'education_level'],
    })

    expect(ruleIds(rules)).toEqual(
      expect.arrayContaining([
        'domain_check_from_labels',
        'impute_binary_logistic_mice',
      ]),
    )
    expect(ruleIds(rules)).not.toContain('impute_mode_fill_discouraged')
  })

  it('allows duplicate checks for identifiers but blocks identifier imputation', () => {
    const identifier = sampleVariable('household_id')
    const rules = getRecommendedRules(identifier, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age'],
    })
    const blockedRules = getBlockedRules(identifier, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age'],
    })

    expect(ruleIds(rules)).toContain('duplicate_identifier_check')
    expect(ruleIds(rules)).not.toContain('impute_hot_deck_donor')
    expect(blockedRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'identifier_imputation',
          reason: expect.stringContaining('record linkage'),
        }),
      ]),
    )
  })

  it('warns and blocks risky defaults for survey design variables', () => {
    const weight = sampleVariable('weight')
    const rules = getRecommendedRules(weight, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age'],
    })
    const blockedRules = getBlockedRules(weight, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age'],
    })

    expect(ruleIds(rules)).toContain('design_variable_protection_warning')
    expect(blockedRules.map((blockedRule) => blockedRule.code)).toEqual(
      expect.arrayContaining([
        'design_variable_imputation',
        'weight_outlier_requires_specialist_review',
      ]),
    )
  })

  it('blocks imputation when structural missingness or skip patterns are present', () => {
    const income = sampleVariable('income')
    const rules = getApplicableRules(income, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age', 'sex'],
    })
    const blockedRules = getBlockedRules(income, {
      imputationAllowed: true,
      availableAuxiliaryVariables: ['age', 'sex'],
    })

    expect(ruleIds(rules)).not.toContain('impute_continuous_mice_pmm')
    expect(blockedRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'structural_missing_imputation',
          reason: expect.stringContaining('valid skip patterns'),
        }),
      ]),
    )
  })

  it('proposes missing declarations and value-label steps when metadata exists', () => {
    const rules = getRecommendedRules(sampleVariable('education_level'))

    expect(ruleIds(rules)).toEqual(
      expect.arrayContaining([
        'preserve_value_labels',
        'declare_missing_codes',
        'domain_check_from_labels',
      ]),
    )
  })
})
