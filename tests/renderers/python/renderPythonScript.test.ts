import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderPythonScript } from '../../../src/renderers/python'
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
      'sample-python-script-fragments.txt',
    ),
  )
}

describe('renderPythonScript', () => {
  it('renders Python syntax for the MVP cleaning steps', () => {
    const rendered = renderPythonScript(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.language).toBe('python')
    expect(rendered.filename).toBe(
      'sample-household-survey-cleaning-plan-python-cleaning-script.py',
    )
    expectGoldenFragments(rendered.content, goldenFragments())
  })

  it('records unsupported and imputation-review Python warnings', () => {
    const rendered = renderPythonScript(createRendererTestPlan(), {
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
      'Python imputation uses an experimental IterativeImputer example',
    )
  })
})
