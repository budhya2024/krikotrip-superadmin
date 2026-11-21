import { createContext } from 'react'
import type { AdminUser } from '../api/admin'

export interface SignInResult {
  success: boolean
  error?: string
}

export interface AuthContextValue {
  adminUser: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
