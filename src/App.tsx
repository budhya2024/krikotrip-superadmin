import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemedToaster } from './components/common/ThemedToaster'
import { ThemeProvider } from './context/ThemeContext'
import { queryClient } from './lib/query-client'
import { router } from './router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ThemedToaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
