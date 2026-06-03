import { useMemo } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { getOptionalUpdateStatus } from '../pwa/optionalUpdates'
import { useOnlineStatus } from '../pwa/useOnlineStatus'

export function OfflineStatusIndicator() {
  const { t } = useI18n()
  const isOnline = useOnlineStatus()
  const updateStatus = useMemo(
    () => getOptionalUpdateStatus(isOnline),
    [isOnline],
  )

  return (
    <section className="offline-status" data-online={isOnline}>
      <strong>{isOnline ? t('status.online') : t('status.offline')}</strong>
      <span>{t(`status.optional.${statusKey(updateStatus.status)}`)}</span>
    </section>
  )
}

function statusKey(
  status: ReturnType<typeof getOptionalUpdateStatus>['status'],
) {
  return status === 'offline' ? 'offline' : 'notConfigured'
}
