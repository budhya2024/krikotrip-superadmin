import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from '../config/env'
import { clearAccessToken, getAccessToken } from './access-token'
import { ApiError } from './api-error'

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

http.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data
    }
    return response
  },
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined

      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        const newToken = await getAccessToken(true)
        if (newToken) {
          originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
          return http(originalRequest)
        }
        clearAccessToken()
      }

      const errorBody = error.response.data?.error
      if (errorBody && typeof errorBody === 'object') {
        throw new ApiError(error.response.status, {
          code: errorBody.code ?? 'UNKNOWN_ERROR',
          message: errorBody.message ?? error.message,
          details: errorBody.details,
          requestId: errorBody.requestId,
        })
      }
      throw new ApiError(error.response.status, {
        code: 'HTTP_ERROR',
        message: error.message,
      })
    }
    throw error
  },
)
