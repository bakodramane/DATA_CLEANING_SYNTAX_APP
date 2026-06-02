import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DOCUMENTED_RENDERER_STEP_TYPES,
  getRendererCapability,
} from '../../src/renderers/capabilities'
import type { RenderedLanguage } from '../../src/renderers/types'

const statusLabels = {
  supported: 'Supported',
  partially_supported: 'Partial',
  unsupported: 'Unsupported',
} as const

const languages: RenderedLanguage[] = ['spss18', 'stata14', 'r', 'python']

describe('renderer support matrix documentation', () => {
  it('documents every renderer capability row with matching statuses', () => {
    const matrixPath = join(process.cwd(), 'docs', 'renderer-support-matrix.md')
    const content = readFileSync(matrixPath, 'utf8')
    const rows = content.split(/\r?\n/).filter((line) => line.startsWith('| `'))

    DOCUMENTED_RENDERER_STEP_TYPES.forEach((stepType) => {
      const row = rows.find((line) =>
        new RegExp(`^\\|\\s+\`${stepType}\`\\s+\\|`).test(line),
      )

      expect(row, `Missing docs row for ${stepType}`).toBeDefined()
      languages.forEach((language) => {
        const expectedStatus =
          statusLabels[getRendererCapability(stepType, language).status]

        expect(row).toContain(expectedStatus)
      })
    })
  })
})
