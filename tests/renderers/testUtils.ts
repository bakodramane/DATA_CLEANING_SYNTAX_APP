import { readFileSync } from 'node:fs'
import { expect } from 'vitest'

export function readGoldenFragments(goldenPath: string): string[] {
  return readFileSync(goldenPath, 'utf8')
    .split('\n---\n')
    .map((fragment) => fragment.trim())
    .filter(Boolean)
}

export function expectGoldenFragments(content: string, fragments: string[]) {
  fragments.forEach((fragment) => {
    expect(content).toContain(fragment)
  })
}
