import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderRScript } from '../../../src/renderers/r'
import {
  createRendererTestPlan,
  fixedGeneratedAt,
} from '../rendererTestFixture'

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
    const plan = createRendererTestPlan()
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
    const plan = createRendererTestPlan()
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
