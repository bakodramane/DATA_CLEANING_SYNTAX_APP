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

  it('records partially supported Stata renderer warnings', () => {
    const rendered = renderStataDoFile(createRendererTestPlan(), {
      generatedAt: fixedGeneratedAt,
    })

    expect(rendered.unsupportedSteps).toHaveLength(0)
    expect(rendered.warnings.join('\n')).toContain(
      'Stata structural-missing checks are rendered as review flags only',
    )
    expect(rendered.warnings.join('\n')).toContain(
      'Stata audit-log support is partial',
    )
  })
})
