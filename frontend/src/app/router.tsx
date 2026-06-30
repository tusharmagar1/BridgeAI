import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/features/dashboard/page'))
const ChatPage = lazy(() => import('@/features/chat/page'))
const AnalyticsPage = lazy(() => import('@/features/analytics/page'))
const SettingsPage = lazy(() => import('@/features/settings/page'))

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-bridge-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--color-text-tertiary)]">Loading...</span>
      </div>
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>,
      },
      {
        path: 'chat',
        element: <SuspenseWrapper><ChatPage /></SuspenseWrapper>,
      },
      {
        path: 'chat/:conversationId',
        element: <SuspenseWrapper><ChatPage /></SuspenseWrapper>,
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper>,
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
