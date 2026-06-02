export const OPTIONAL_UPDATE_STATUSES = [
  'not_configured',
  'offline',
  'available',
  'unavailable',
] as const

export type OptionalUpdateStatusName = (typeof OPTIONAL_UPDATE_STATUSES)[number]

export interface OptionalUpdateStatus {
  status: OptionalUpdateStatusName
  message: string
}

export function getOptionalUpdateStatus(
  isOnline: boolean,
): OptionalUpdateStatus {
  if (!isOnline) {
    return {
      status: 'offline',
      message:
        'Offline mode: core features continue to work locally. Optional template-pack updates are unavailable.',
    }
  }

  return {
    status: 'not_configured',
    message:
      'Online: optional template-pack updates are planned for a later version and are not configured yet.',
  }
}

export async function checkForOptionalUpdates(
  isOnline = getCurrentOnlineStatus(),
): Promise<OptionalUpdateStatus> {
  // The first release intentionally does not fetch remote rule packs or upload user data.
  return getOptionalUpdateStatus(isOnline)
}

export function getCurrentOnlineStatus(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
