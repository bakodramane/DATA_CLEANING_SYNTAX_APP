import { useMemo } from 'react'
import { getOptionalUpdateStatus } from '../pwa/optionalUpdates'
import { useOnlineStatus } from '../pwa/useOnlineStatus'

export function OfflineStatusIndicator() {
  const isOnline = useOnlineStatus()
  const updateStatus = useMemo(
    () => getOptionalUpdateStatus(isOnline),
    [isOnline],
  )

  return (
    <section className="offline-status" data-online={isOnline}>
      <strong>{isOnline ? 'Online' : 'Offline'}</strong>
      <span>{updateStatus.message}</span>
    </section>
  )
}
