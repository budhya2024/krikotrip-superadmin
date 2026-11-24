import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAdmin } from './auth/RequireAdmin'
import { AdminLayout } from './components/layout/AdminLayout'
import { RootLayout } from './components/layout/RootLayout'
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: (
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        ),
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
