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
  it('renders a readable R script for the supported core steps', () => {
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

  it('records partially supported R renderer warnings', () => {
    const plan = createRendererTestPlan()
    const rendered = renderRScript(plan, { generatedAt: fixedGeneratedAt })

    expect(rendered.unsupportedSteps).toHaveLength(0)
    expect(rendered.warnings.join('\n')).toContain(
      'R structural-missing checks are rendered as review flags only',
    )
    expect(rendered.warnings.join('\n')).toContain(
      'R audit-log support is partial',
    )
  })
})
