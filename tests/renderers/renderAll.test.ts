import { describe, expect, it } from 'vitest'
import type { CleaningPlan, CleaningStep } from '../../src/core'
import type { LanguageCode } from '../../src/i18n'
import { renderPythonScript } from '../../src/renderers/python'
import { renderRScript } from '../../src/renderers/r'
import { renderSpssScript } from '../../src/renderers/spss'
import { renderStataDoFile } from '../../src/renderers/stata'
import type { RenderedScript } from '../../src/renderers/types'
import { createRendererTestPlan, fixedGeneratedAt } from './rendererTestFixture'

const renderers = [
  {
    language: 'r',
    render: (plan = createRendererTestPlan(), language?: LanguageCode) =>
      renderRScript(plan, {
        generatedAt: fixedGeneratedAt,
        language,
      }),
  },
  {
    language: 'spss18',
    render: (plan = createRendererTestPlan(), language?: LanguageCode) =>
      renderSpssScript(plan, {
        generatedAt: fixedGeneratedAt,
        language,
      }),
  },
  {
    language: 'stata14',
    render: (plan = createRendererTestPlan(), language?: LanguageCode) =>
      renderStataDoFile(plan, {
        generatedAt: fixedGeneratedAt,
        language,
      }),
  },
  {
    language: 'python',
    render: (plan = createRendererTestPlan(), language?: LanguageCode) =>
      renderPythonScript(plan, {
        generatedAt: fixedGeneratedAt,
        language,
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
      const plan = addUnsupportedOutlierTreatment(createRendererTestPlan())
      const rendered =
        renderer.language === 'r'
          ? renderRScript(plan, { generatedAt: fixedGeneratedAt })
          : renderer.language === 'spss18'
            ? renderSpssScript(plan, { generatedAt: fixedGeneratedAt })
            : renderer.language === 'stata14'
              ? renderStataDoFile(plan, { generatedAt: fixedGeneratedAt })
              : renderPythonScript(plan, { generatedAt: fixedGeneratedAt })

      expect(rendered.unsupportedSteps.map((step) => step.type)).toEqual(
        expect.arrayContaining(['outlier_treatment']),
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

  it('localises generated comments to French without changing executable syntax', () => {
    renderers.forEach((renderer) => {
      const english = renderer.render(createRendererTestPlan(), 'en')
      const french = renderer.render(createRendererTestPlan(), 'fr')

      expect(executableLines(english.content, renderer.language)).toStrictEqual(
        executableLines(french.content, renderer.language),
      )
      expect(commentLines(french.content, renderer.language)).not.toStrictEqual(
        commentLines(english.content, renderer.language),
      )
      expect(french.content).toContain("Syntaxe d'apurement")
      expect(french.content).toContain('Justification')
      expect(french.content).toContain('IHSN_DDI')
      expect(french.content).toContain('income')
      expect(french.content).toContain('Male')
      expect(french.content).toContain('Female')
      expect(english.content).toContain('Survey Microdata Cleaning Syntax')
    })
  })

  it('renders unsupported-step warnings in French comments', () => {
    renderers.forEach((renderer) => {
      const plan = addUnsupportedOutlierTreatment(createRendererTestPlan())
      const rendered = renderer.render(plan, 'fr')

      expect(rendered.unsupportedSteps.map((step) => step.type)).toContain(
        'outlier_treatment',
      )
      expect(rendered.content).toContain('Étape non prise en charge')
      expect(rendered.content).toContain('outlier_treatment')
    })
  })
})

function addUnsupportedOutlierTreatment(plan: CleaningPlan): CleaningPlan {
  const unsupportedStep: CleaningStep = {
    id: 'step_unsupported_outlier_treatment',
    type: 'outlier_treatment',
    variables: ['income'],
    parameters: { noSilentDeletion: true, noSilentWinsorisation: true },
    rationale:
      'Outlier treatment must remain an explicit reviewer action rather than generated syntax.',
    citationKeys: ['de-waal-2011'],
    severity: 'warning',
    defaultAction: 'no_action',
    isAutomatic: false,
    requiresReview: true,
    rendererSupport: {
      r: { status: 'unsupported' },
      spss18: { status: 'unsupported' },
      stata14: { status: 'unsupported' },
      python: { status: 'unsupported' },
    },
  }

  plan.steps.push(unsupportedStep)
  return plan
}

function executableLines(
  content: string,
  rendererLanguage: (typeof renderers)[number]['language'],
): string[] {
  return content
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .filter((line) => !isFullLineComment(line, rendererLanguage))
}

function commentLines(
  content: string,
  rendererLanguage: (typeof renderers)[number]['language'],
): string[] {
  return content
    .split('\n')
    .filter((line) => isFullLineComment(line, rendererLanguage))
}

function isFullLineComment(
  line: string,
  rendererLanguage: (typeof renderers)[number]['language'],
): boolean {
  const trimmed = line.trimStart()

  return rendererLanguage === 'spss18' || rendererLanguage === 'stata14'
    ? trimmed.startsWith('*')
    : trimmed.startsWith('#')
}
