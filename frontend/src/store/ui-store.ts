import { create } from 'zustand'
import { Toast } from '@/types'
import { generateId } from '@/lib/utils'

interface UIState {
  // Layout
  sidebarOpen: boolean
  sidebarMobileOpen: boolean
  commandPaletteOpen: boolean
  aiControlsOpen: boolean

  // Toasts
  toasts: Toast[]

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setAIControlsOpen: (open: boolean) => void

  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarMobileOpen: false,
  commandPaletteOpen: false,
  aiControlsOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setAIControlsOpen: (aiControlsOpen) => set({ aiControlsOpen }),

  addToast: (toast) => {
    const id = generateId()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    const duration = toast.duration ?? 4000
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),
}))
