import {
  sampleCleaningPlan,
  type Citation,
  type CleaningPlan,
  type CleaningStep,
} from '../../src/core'

export const fixedGeneratedAt = '2026-05-30T12:00:00.000Z'

export function cloneSamplePlan(): CleaningPlan {
  return structuredClone(sampleCleaningPlan)
}

function rendererSupportedStep(
  overrides: Pick<CleaningStep, 'id' | 'type' | 'variables' | 'rationale'> &
    Partial<CleaningStep>,
): CleaningStep {
  return {
    parameters: {},
    citationKeys: ['IHSN_DDI'],
    severity: 'info',
    defaultAction: 'no_action',
    isAutomatic: true,
    requiresReview: false,
    rendererSupport: {
      r: { status: 'supported' },
      spss18: { status: 'supported' },
      stata14: { status: 'supported' },
      python: { status: 'supported' },
    },
    ...overrides,
  }
}

export function createRendererTestPlan(): CleaningPlan {
  const plan = cloneSamplePlan()
  const ihsnDdiCitation: Citation = {
    key: 'IHSN_DDI',
    title: 'DDI metadata guidance',
    authorOrOrganisation: 'IHSN',
    year: 'NEEDS_VERIFICATION',
    sourceType: 'official_guidance',
    note: 'Placeholder citation for renderer tests.',
  }

  const missingnessStep = plan.steps.find(
    (step) => step.id === 'step_income_missingness',
  )

  if (missingnessStep) {
    missingnessStep.parameters = {
      ...missingnessStep.parameters,
      createIndicators: true,
    }
  }

  plan.citations.push(ihsnDdiCitation)
  plan.steps = [
    rendererSupportedStep({
      id: 'step_variable_labels',
      type: 'variable_label',
      variables: ['age', 'income'],
      rationale: 'Preserve survey codebook labels in the analysis dataset.',
    }),
    rendererSupportedStep({
      id: 'step_value_labels',
      type: 'value_label',
      variables: ['sex', 'education_level', 'employment_status'],
      rationale:
        'Preserve categorical code labels so analysts can review labelled values.',
    }),
    rendererSupportedStep({
      id: 'step_missing_value_declarations',
      type: 'missing_value_declaration',
      variables: ['age', 'sex', 'education_level', 'income'],
      rationale:
        'Convert declared nonresponse codes to missing values while documenting the original codes.',
      defaultAction: 'set_missing',
      requiresReview: true,
    }),
    ...plan.steps,
  ]

  return plan
}
