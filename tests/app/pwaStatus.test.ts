import { describe, expect, it } from 'vitest'
import {
  checkForOptionalUpdates,
  getOptionalUpdateStatus,
} from '../../src/app/pwa/optionalUpdates'

describe('PWA optional update status', () => {
  it('returns an offline status without remote fetching', () => {
    const status = getOptionalUpdateStatus(false)

    expect(status).toEqual({
      status: 'offline',
      message:
        'Offline mode: core features continue to work locally. Optional template-pack updates are unavailable.',
    })
  })

  it('returns a not-configured status while online template packs are not implemented', async () => {
    await expect(checkForOptionalUpdates(true)).resolves.toEqual({
      status: 'not_configured',
      message:
        'Online: optional template-pack updates are planned for a later version and are not configured yet.',
    })
  })
})
