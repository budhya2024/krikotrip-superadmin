import axios from 'axios'
import { env } from '../config/env'
import { ApiError } from './api-error'

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

http.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data
    }
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
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
