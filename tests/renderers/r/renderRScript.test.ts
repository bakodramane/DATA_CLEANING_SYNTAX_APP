import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  sampleCleaningPlan,
  type Citation,
  type CleaningPlan,
  type CleaningStep,
} from '../../../src/core'
import { renderRScript } from '../../../src/renderers/r'

const fixedGeneratedAt = '2026-05-30T12:00:00.000Z'

function cloneSamplePlan(): CleaningPlan {
  return structuredClone(sampleCleaningPlan)
}

function rSupportedStep(
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
    rendererSupport: { r: { status: 'supported' } },
    ...overrides,
  }
}

function addRendererFixtureSteps(plan: CleaningPlan): CleaningPlan {
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
    rSupportedStep({
      id: 'step_variable_labels',
      type: 'variable_label',
      variables: ['age', 'income'],
      rationale: 'Preserve survey codebook labels in the R analysis dataset.',
    }),
    rSupportedStep({
      id: 'step_value_labels',
      type: 'value_label',
      variables: ['sex', 'education_level', 'employment_status'],
      rationale:
        'Preserve categorical code labels so analysts can review labelled values.',
    }),
    rSupportedStep({
      id: 'step_missing_value_declarations',
      type: 'missing_value_declaration',
      variables: ['age', 'sex', 'education_level', 'income'],
      rationale:
        'Convert declared nonresponse codes to R missing values while documenting the original codes.',
      defaultAction: 'set_missing',
      requiresReview: true,
    }),
    ...plan.steps,
  ]

  return plan
}

function readGoldenFragments(): string[] {
  const testDirectory = dirname(fileURLToPath(import.meta.url))
  const goldenPath = join(
    testDirectory,
    'golden',
    'sample-r-script-fragments.txt',
  )

  return readFileSync(goldenPath, 'utf8')
    .split('\n---\n')
    .map((fragment) => fragment.trim())
    .filter(Boolean)
}

describe('renderRScript', () => {
  it('renders a readable R script for the Phase 2 supported core steps', () => {
    const plan = addRendererFixtureSteps(cloneSamplePlan())
    const rendered = renderRScript(plan, { generatedAt: fixedGeneratedAt })

    expect(rendered.language).toBe('r')
    expect(rendered.filename).toBe(
      'sample-household-survey-cleaning-plan-r-cleaning-script.R',
    )
    expect(rendered.content).toContain(
      '# WARNING: Review this generated syntax',
    )

    readGoldenFragments().forEach((fragment) => {
      expect(rendered.content).toContain(fragment)
    })
  })

  it('records unsupported Phase 2 R renderer steps instead of failing silently', () => {
    const plan = addRendererFixtureSteps(cloneSamplePlan())
    const rendered = renderRScript(plan, { generatedAt: fixedGeneratedAt })

    expect(rendered.unsupportedSteps.map((step) => step.type)).toEqual(
      expect.arrayContaining([
        'structural_missing_check',
        'audit_log',
        'summary_report',
      ]),
    )
    expect(rendered.warnings).toEqual(
      expect.arrayContaining([
        'Step "step_income_structural_missing": Step type "structural_missing_check" is not yet supported by the Phase 2 R renderer.',
      ]),
    )
  })
})
