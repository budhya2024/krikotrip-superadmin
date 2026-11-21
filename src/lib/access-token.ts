import { authClient } from './auth-client'

interface TokenResult {
  data?: {
    token?: string
  } | null
}

let cachedToken: string | null = null
let cachedExp = 0

function parseTokenExpiry(token: string): number {
  try {
    const parts = token.split('.')
    if (parts.length < 2) {
      return 0
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = window.atob(base64)
    const json = JSON.parse(decoded) as { exp?: number }
    return typeof json.exp === 'number' ? json.exp * 1000 : 0
  } catch {
    return 0
  }
}

export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  const now = Date.now()
  if (!forceRefresh && cachedToken && cachedExp - now > 60_000) {
    return cachedToken
  }

  try {
    const res = (await authClient.token()) as TokenResult
    const token = res?.data?.token
    if (typeof token === 'string' && token.length > 0) {
      cachedToken = token
      cachedExp = parseTokenExpiry(token)
      return token
    }
    cachedToken = null
    cachedExp = 0
    return null
  } catch {
    cachedToken = null
    cachedExp = 0
    return null
  }
}

export function clearAccessToken(): void {
  cachedToken = null
  cachedExp = 0
}
