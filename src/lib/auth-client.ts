import { createAuthClient } from '@neon/auth'
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters'
import { env } from '../config/env'

export interface AuthTokenResponse {
  data?: {
    token: string
  } | null
  error?: unknown
}

export interface SendVerificationOtpInput {
  email: string
  type: 'sign-in' | 'change-email' | 'email-verification' | 'forget-password'
}

export interface ResetPasswordInput {
  email: string
  otp: string
  password: string
}

export interface AuthSessionData {
  user: {
    id: string
    email: string
    name: string
  }
  session: {
    id: string
    userId: string
    token?: string
  }
}

export interface NeonAuthClient {
  signIn: {
    email: (params: { email: string; password: string }) => Promise<{
      data?: AuthSessionData | null
      error?: { message?: string; status?: number; code?: string } | null
    }>
  }
  signOut: () => Promise<void>
  getSession: () => Promise<{
    data?: AuthSessionData | null
    error?: unknown
  }>
  token: () => Promise<AuthTokenResponse>
  emailOtp: {
    sendVerificationOtp: (params: SendVerificationOtpInput) => Promise<{
      data?: unknown
      error?: { message?: string } | null
    }>
    resetPassword: (params: ResetPasswordInput) => Promise<{
      data?: unknown
      error?: { message?: string } | null
    }>
  }
  updateUser: (params: { name?: string }) => Promise<{
    data?: unknown
    error?: { message?: string } | null
  }>
  changeEmail: (params: {
    newEmail: string
    callbackURL?: string
  }) => Promise<{
    data?: unknown
    error?: { message?: string } | null
  }>
  changePassword: (params: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }) => Promise<{
    data?: unknown
    error?: { message?: string } | null
  }>
}

export const authClient = createAuthClient(env.VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
}) as unknown as NeonAuthClient
