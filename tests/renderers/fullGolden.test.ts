import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { CleaningPlan, CleaningStep } from '../../src/core'
import { renderPythonScript } from '../../src/renderers/python'
import { renderRScript } from '../../src/renderers/r'
import { renderSpssScript } from '../../src/renderers/spss'
import { renderStataDoFile } from '../../src/renderers/stata'
import type { RenderedScript } from '../../src/renderers/types'
import {
  createAgricultureGoldenPlan,
  createHouseholdGoldenPlan,
  createStructuralMissingGoldenPlan,
  fixedGeneratedAt,
} from './rendererTestFixture'

const goldenDirectory = join(dirname(fileURLToPath(import.meta.url)), 'golden')

const updateGoldens = process.env.UPDATE_RENDERER_GOLDENS === '1'

const plans = [
  { slug: 'household', createPlan: createHouseholdGoldenPlan },
  { slug: 'agriculture', createPlan: createAgricultureGoldenPlan },
  {
    slug: 'structural-missing',
    createPlan: createStructuralMissingGoldenPlan,
  },
]

const renderers = [
  {
    language: 'spss',
    extension: 'sps',
    render: (plan: CleaningPlan) =>
      renderSpssScript(plan, { generatedAt: fixedGeneratedAt }),
  },
  {
    language: 'stata',
    extension: 'do',
    render: (plan: CleaningPlan) =>
      renderStataDoFile(plan, { generatedAt: fixedGeneratedAt }),
  },
  {
    language: 'r',
    extension: 'R',
    render: (plan: CleaningPlan) =>
      renderRScript(plan, { generatedAt: fixedGeneratedAt }),
  },
  {
    language: 'python',
    extension: 'py',
    render: (plan: CleaningPlan) =>
      renderPythonScript(plan, { generatedAt: fixedGeneratedAt }),
  },
]

function normalize(content: string): string {
  return content.replace(/\r\n/g, '\n')
}

function readExpected(path: string): string {
  return normalize(readFileSync(path, 'utf8'))
}

function maybeUpdateExpected(path: string, content: string) {
  if (!updateGoldens) {
    return
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function unsupportedFixtureStep(): CleaningStep {
  return {
    id: 'unsupported_outlier_treatment',
    type: 'outlier_treatment',
    variables: ['income'],
    parameters: { noSilentDeletion: true, noSilentWinsorisation: true },
    rationale:
      'Outlier treatment decisions require explicit reviewer action and must not be generated silently.',
    citationKeys: ['DE_WAAL_2011'],
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
}

describe('full-file renderer golden outputs', () => {
  plans.forEach(({ slug, createPlan }) => {
    renderers.forEach((renderer) => {
      it(`matches ${slug} ${renderer.language} golden output`, () => {
        const rendered = renderer.render(createPlan())
        const goldenPath = join(
          goldenDirectory,
          `${slug}.${renderer.language}.expected.${renderer.extension}`,
        )

        maybeUpdateExpected(goldenPath, rendered.content)
        expect(normalize(rendered.content)).toBe(readExpected(goldenPath))
      })
    })
  })

  it('returns warnings and comments for unsupported steps', () => {
    renderers.forEach((renderer) => {
      const plan = createHouseholdGoldenPlan()
      plan.steps.push(unsupportedFixtureStep())
      const rendered = renderer.render(plan)

      expect(rendered.unsupportedSteps.map((step) => step.type)).toContain(
        'outlier_treatment',
      )
      expect(rendered.warnings.join('\n')).toContain('outlier_treatment')
      expect(rendered.content).toContain('WARNING:')
    })
  })

  it('returns warnings and comments for partially supported steps', () => {
    renderers.forEach((renderer) => {
      const rendered = renderer.render(createStructuralMissingGoldenPlan())

      expect(rendered.warnings.join('\n')).toContain('partial')
      expect(rendered.content).toContain('WARNING:')
      expect(rendered.content).toContain('struct_wage_structural_missing')
      expect(rendered.content).toContain('struct_wage_skip_pattern')
    })
  })

  it('does not silently delete records or treat outliers', () => {
    const unsafePatterns = [
      /\bDELETE\s+CASES\b/i,
      /\bdrop\s+if\b/i,
      /\bwinsori[sz]e\b/i,
      /\bcap\s+if\b/i,
    ]

    renderAllGoldenScripts().forEach((script) => {
      unsafePatterns.forEach((pattern) => {
        expect(script.content).not.toMatch(pattern)
      })
    })
  })

  it('excludes identifiers and structural missing values from imputation examples', () => {
    renderers.forEach((renderer) => {
      const rendered = renderer.render(createStructuralMissingGoldenPlan())

      expect(rendered.warnings.join('\n')).toContain(
        'Identifier variable "person_id" was excluded from imputation',
      )
      expect(rendered.warnings.join('\n')).toContain(
        'Structural missing values were requested for imputation and have been blocked.',
      )
      expect(rendered.content).toContain('person_id')
      expect(rendered.content).toContain('Structural missing values')
    })
  })
})

function renderAllGoldenScripts(): RenderedScript[] {
  return plans.flatMap(({ createPlan }) =>
    renderers.map((renderer) => renderer.render(createPlan())),
  )
}
