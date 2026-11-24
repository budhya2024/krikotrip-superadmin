import React, { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine
    }
    return true
  })
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setShowReconnected(true)
        const timer = setTimeout(() => {
          setShowReconnected(false)
          setWasOffline(false)
        }, 3500)
        return () => clearTimeout(timer)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  if (!isOnline) {
    return (
      <aside
        role="alert"
        aria-live="assertive"
        className="w-full bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 transition-colors"
      >
        <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>You are currently offline. Changes cannot be synced until connection is restored.</span>
      </aside>
    )
  }

  if (showReconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="w-full bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 transition-colors"
      >
        <Wifi className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Connection restored. Back online.</span>
      </aside>
    )
  }

  return null
}
