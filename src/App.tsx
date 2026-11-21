import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { AdminLayout } from './components/layout/AdminLayout'
import { queryClient } from './lib/query-client'
import { ThemedToaster } from './components/common/ThemedToaster'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminLayout />
        <ThemedToaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
