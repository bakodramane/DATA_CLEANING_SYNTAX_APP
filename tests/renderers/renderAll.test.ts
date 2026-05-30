import { describe, expect, it } from 'vitest'
import { renderPythonScript } from '../../src/renderers/python'
import { renderRScript } from '../../src/renderers/r'
import { renderSpssScript } from '../../src/renderers/spss'
import { renderStataDoFile } from '../../src/renderers/stata'
import type { RenderedScript } from '../../src/renderers/types'
import { createRendererTestPlan, fixedGeneratedAt } from './rendererTestFixture'

const renderers = [
  {
    language: 'r',
    render: () =>
      renderRScript(createRendererTestPlan(), {
        generatedAt: fixedGeneratedAt,
      }),
  },
  {
    language: 'spss18',
    render: () =>
      renderSpssScript(createRendererTestPlan(), {
        generatedAt: fixedGeneratedAt,
      }),
  },
  {
    language: 'stata14',
    render: () =>
      renderStataDoFile(createRendererTestPlan(), {
        generatedAt: fixedGeneratedAt,
      }),
  },
  {
    language: 'python',
    render: () =>
      renderPythonScript(createRendererTestPlan(), {
        generatedAt: fixedGeneratedAt,
      }),
  },
] as const

describe('all MVP renderers', () => {
  it('renders the same sample Cleaning Plan in all four target languages', () => {
    const renderedScripts = renderers.map((renderer) => renderer.render())

    expect(renderedScripts.map((script) => script.language)).toEqual([
      'r',
      'spss18',
      'stata14',
      'python',
    ])
    renderedScripts.forEach((script) => {
      expect(script.content).toContain('Step ID: step_age_range')
      expect(script.content).toContain('step_income_imputation_review')
      expect(script.content.length).toBeGreaterThan(1000)
    })
  })

  it('returns warnings and unsupported-step metadata instead of failing silently', () => {
    renderers.forEach((renderer) => {
      const rendered = renderer.render()

      expect(rendered.unsupportedSteps.map((step) => step.type)).toEqual(
        expect.arrayContaining([
          'structural_missing_check',
          'audit_log',
          'summary_report',
        ]),
      )
      expect(rendered.warnings.length).toBeGreaterThan(0)
    })
  })

  it('does not emit deletion, winsorisation, or capping commands', () => {
    const unsafePatterns = [
      /\bDELETE\s+CASES\b/i,
      /\bdrop\s+if\b/i,
      /\bwinsori[sz]e\b/i,
      /\bcap\s+if\b/i,
    ]

    renderers
      .map((renderer) => renderer.render())
      .forEach((script: RenderedScript) => {
        unsafePatterns.forEach((pattern) => {
          expect(script.content).not.toMatch(pattern)
        })
      })
  })
})
