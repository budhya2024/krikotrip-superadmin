import React from 'react'
import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  let errorMessage = 'An unexpected error occurred.'
  let statusText = 'Error'

  if (isRouteErrorResponse(error)) {
    statusText = `${error.status} ${error.statusText}`
    errorMessage = error.data?.message || error.statusText || errorMessage
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>
        <span className="inline-block text-xs font-semibold tracking-wider uppercase text-rose-600 dark:text-rose-400 mb-1">
          {statusText}
        </span>
        <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 break-words">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Reload Page
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}

interface ViewErrorBoundaryProps {
  children: React.ReactNode
  viewName?: string
}

interface ViewErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ViewErrorBoundary extends React.Component<ViewErrorBoundaryProps, ViewErrorBoundaryState> {
  constructor(props: ViewErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ViewErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled view error caught by ViewErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center my-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Failed to render {this.props.viewName || 'section'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-5 break-words">
            {this.state.error?.message || 'An unexpected error occurred in this view.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
