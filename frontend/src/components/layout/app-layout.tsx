import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { CommandPalette } from '@/components/ui/command-palette'
import { ToastContainer } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useUIStore } from '@/store/ui-store'
import { useIsMobile, useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

export function AppLayout() {
  useKeyboardShortcuts()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  // Handle virtual keyboard offset on mobile devices
  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      const viewport = window.visualViewport
      if (!viewport) return
      
      const offset = window.innerHeight - viewport.height
      document.documentElement.style.setProperty('--keyboard-offset', `${Math.max(0, offset)}px`)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])

  // Auto-collapse sidebar on tablet and mobile viewports on mount / window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1025) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className="h-screen w-screen flex overflow-hidden bg-transparent transition-[padding] duration-150"
        style={{ paddingBottom: 'var(--keyboard-offset, 0px)' }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 flex flex-col h-full relative transition-all duration-300',
            isDesktop && sidebarOpen && 'ml-[var(--sidebar-width)]'
          )}
        >
          <Header />
          <div className="flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>

        {/* Overlays */}
        <CommandPalette />
        <ToastContainer />
      </div>
    </TooltipProvider>
  )
}

