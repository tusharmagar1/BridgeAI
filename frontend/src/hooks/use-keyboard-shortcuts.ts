import { useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const { toggleSidebar, toggleCommandPalette } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          target.blur()
        }
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey

      if (isCtrl && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      } else if (isCtrl && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      } else if (isCtrl && e.key === 'n') {
        e.preventDefault()
        navigate('/chat')
      } else if (isCtrl && e.key === ',') {
        e.preventDefault()
        navigate('/settings')
      } else if (isCtrl && e.key === '/') {
        e.preventDefault()
        navigate('/settings?tab=shortcuts')
      } else if (isCtrl && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        const searchInput = document.getElementById('sidebar-search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSidebar, toggleCommandPalette, navigate])
}
