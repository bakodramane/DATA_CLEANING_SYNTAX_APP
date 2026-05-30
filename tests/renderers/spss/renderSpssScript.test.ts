import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderSpssScript } from '../../../src/renderers/spss'
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
      'sample-spss-script-fragments.txt',
    ),
  )
}

describe('renderSpssScript', () => {
  it('renders SPSS v18 syntax for the MVP cleaning steps', () => {
    const rendered = renderSpssScript(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.language).toBe('spss18')
    expect(rendered.filename).toBe(
      'sample-household-survey-cleaning-plan-spss18-cleaning-script.sps',
    )
    expectGoldenFragments(rendered.content, goldenFragments())
  })

  it('records unsupported and partially supported SPSS warnings', () => {
    const rendered = renderSpssScript(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.unsupportedSteps.map((step) => step.type)).toEqual(
      expect.arrayContaining([
        'structural_missing_check',
        'audit_log',
        'summary_report',
      ]),
    )
    expect(rendered.warnings.join('\n')).toContain(
      'SPSS v18 multiple imputation syntax requires module availability',
    )
    expect(rendered.warnings.join('\n')).toContain(
      'SPSS v18 mad outlier thresholds are emitted as a review template',
    )
  })
})
