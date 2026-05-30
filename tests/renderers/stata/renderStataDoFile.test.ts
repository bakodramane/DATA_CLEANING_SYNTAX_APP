import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderStataDoFile } from '../../../src/renderers/stata'
import {
  createRendererTestPlan,
  fixedGeneratedAt,
} from '../rendererTestFixture'
import { expectGoldenFragments, readGoldenFragments } from '../testUtils'

function goldenFragments() {
  return readGoldenFragments(
    join(
      dirname(fileURLToPath(import.meta.url)),
      'golden',
      'sample-stata-script-fragments.txt',
    ),
  )
}

describe('renderStataDoFile', () => {
  it('renders Stata v14 syntax for the MVP cleaning steps', () => {
    const rendered = renderStataDoFile(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.language).toBe('stata14')
    expect(rendered.filename).toBe(
      'sample-household-survey-cleaning-plan-stata14-cleaning-script.do',
    )
    expectGoldenFragments(rendered.content, goldenFragments())
  })

  it('records unsupported Stata renderer steps', () => {
    const rendered = renderStataDoFile(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.unsupportedSteps.map((step) => step.type)).toEqual(
      expect.arrayContaining([
        'structural_missing_check',
        'audit_log',
        'summary_report',
      ]),
    )
    expect(rendered.warnings).toEqual(
      expect.arrayContaining([
        'Step "step_income_structural_missing": Step type "structural_missing_check" is not yet supported by the Phase 3 Stata v14 renderer.',
      ]),
    )
  })
})
