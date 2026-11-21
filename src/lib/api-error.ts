export interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
  requestId?: string
}

export class ApiError extends Error {
  readonly code: string
  readonly details?: unknown
  readonly requestId?: string
  readonly statusCode: number

  constructor(statusCode: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = payload.code
    this.details = payload.details
    this.requestId = payload.requestId
  }
}

export const toUserMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'UNAUTHENTICATED':
        return 'Your session has expired. Please sign in again.'
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.'
      case 'NOT_FOUND':
        return 'The requested record was not found.'
      case 'CONFLICT':
        return 'A conflicting change was detected. Please refresh and try again.'
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.'
      case 'VALIDATION_FAILED':
        return error.message || 'Please check your inputs and try again.'
      case 'SERVICE_UNAVAILABLE':
        return 'The service is temporarily unavailable. Please try again shortly.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred.'
}
