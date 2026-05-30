import { useEffect, useState } from 'react'
import { getCurrentOnlineStatus } from './optionalUpdates'

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(getCurrentOnlineStatus)

  useEffect(() => {
    const updateStatus = () => setIsOnline(getCurrentOnlineStatus())

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return isOnline
}
