import { describe, expect, it } from 'vitest'
import { corePackage } from '../src/core'

describe('project scaffold', () => {
  it('marks the core package as offline-first', () => {
    expect(corePackage.offlineFirst).toBe(true)
  })
})
