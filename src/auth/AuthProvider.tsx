import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchAdminSession, type AdminUser } from '../api/admin'
import { ApiError } from '../lib/api-error'
import { env } from '../config/env'
import { clearAccessToken } from '../lib/access-token'
import { authClient } from '../lib/auth-client'
import { queryClient } from '../lib/query-client'
import { AuthContext, type SignInResult } from './auth-context'

const IDLE_WARNING_TOAST_ID = 'idle-warning-toast'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const lastActivityRef = useRef<number>(0)
  const warningShownRef = useRef<boolean>(false)

  useEffect(() => {
    lastActivityRef.current = Date.now()
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const user = await fetchAdminSession()
      setAdminUser(user)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        clearAccessToken()
        setAdminUser(null)
      }
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut()
    } catch (err: unknown) {
      void err
    } finally {
      clearAccessToken()
      queryClient.clear()
      setAdminUser(null)
      toast.dismiss(IDLE_WARNING_TOAST_ID)
      navigate('/login')
    }
  }, [navigate])

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      try {
        const { error } = await authClient.signIn.email({
          email,
          password,
        })

        if (error) {
          const message = error.message?.toLowerCase() ?? ''
          if (
            message.includes('invalid') ||
            message.includes('credential') ||
            message.includes('password')
          ) {
            return { success: false, error: 'Invalid email or password.' }
          }
          if (message.includes('too many') || message.includes('rate limit')) {
            return {
              success: false,
              error: 'Too many attempts. Please try again later.',
            }
          }
          if (message.includes('not verified')) {
            return {
              success: false,
              error: 'Your email address has not been verified.',
            }
          }
          return {
            success: false,
            error: error.message || 'Failed to sign in. Please try again.',
          }
        }

        try {
          const user = await fetchAdminSession()
          setAdminUser(user)
          lastActivityRef.current = Date.now()
          warningShownRef.current = false
          return { success: true }
        } catch (sessionErr: unknown) {
          await authClient.signOut()
          clearAccessToken()
          setAdminUser(null)

          if (sessionErr instanceof ApiError && sessionErr.statusCode === 403) {
            return {
              success: false,
              error: 'This account is not authorized to access the admin panel.',
            }
          }
          return {
            success: false,
            error: 'Unable to verify administrator access.',
          }
        }
      } catch {
        return {
          success: false,
          error: 'Unable to connect to authentication server.',
        }
      }
    },
    [],
  )

  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        const sessionRes = await authClient.getSession()
        if (sessionRes?.data?.user) {
          const user = await fetchAdminSession()
          if (isMounted) {
            setAdminUser(user)
            lastActivityRef.current = Date.now()
          }
        } else {
          if (isMounted) {
            setAdminUser(null)
          }
        }
      } catch {
        if (isMounted) {
          clearAccessToken()
          setAdminUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!adminUser) {
      return
    }

    const resetActivity = () => {
      lastActivityRef.current = Date.now()
      if (warningShownRef.current) {
        warningShownRef.current = false
        toast.dismiss(IDLE_WARNING_TOAST_ID)
      }
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    for (const event of events) {
      window.addEventListener(event, resetActivity, { passive: true })
    }

    const timeoutMs = env.VITE_IDLE_TIMEOUT_MINUTES * 60 * 1000
    const warningLeadMs = 60 * 1000

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current

      if (elapsed >= timeoutMs) {
        toast.dismiss(IDLE_WARNING_TOAST_ID)
        toast.error('Session expired due to inactivity. Please sign in again.')
        void signOut()
      } else if (elapsed >= timeoutMs - warningLeadMs && !warningShownRef.current) {
        warningShownRef.current = true
        toast.warning('Session expiring in 1 minute due to inactivity.', {
          id: IDLE_WARNING_TOAST_ID,
          duration: warningLeadMs,
        })
      }
    }, 5000)

    return () => {
      for (const event of events) {
        window.removeEventListener(event, resetActivity)
      }
      clearInterval(interval)
      toast.dismiss(IDLE_WARNING_TOAST_ID)
    }
  }, [adminUser, signOut])

  const isAuthenticated = adminUser !== null

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
