import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toUserMessage } from './api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (failureCount >= 2) {
          return false
        }
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const status = (error as { statusCode?: number }).statusCode
          return status !== undefined && status >= 500
        }
        return true
      },
    },
    mutations: {
      onError: (error) => {
        toast.error(toUserMessage(error))
      },
    },
  },
})
