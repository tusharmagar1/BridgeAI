import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, MessageSquare, Star, Archive, Clock,
  MoreHorizontal, Trash2, Pencil, Pin, Share2, Download,
  Home, BarChart3, Settings, ChevronLeft,
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useChatStore } from '@/store/chat-store'
import { useIsMobile, useIsDesktop } from '@/hooks/use-media-query'
import { BridgeLogo } from '@/components/ui/bridge-logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { AIControls } from '@/features/chat/components/ai-controls'
import { cn } from '@/lib/utils'
import { formatRelativeDate, truncate } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { getClientId } from '@/lib/clientId'

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()
  const { conversations, searchQuery, setSearchQuery } = useChatStore()
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isOpen = isDesktop ? sidebarOpen : sidebarMobileOpen
  const setOpen = isDesktop ? setSidebarOpen : setSidebarMobileOpen

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Load conversations
  useEffect(() => {
    fetch(`/api/chat/conversations/${getClientId()}`, {
      headers: { 'X-Client-Id': getClientId() }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          useChatStore.getState().setConversations(data.data)
        }
      })
      .catch(() => {})
  }, [])

  // Swipe to open/close sidebar on mobile/tablet
  useEffect(() => {
    if (isDesktop) return

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const diffX = touchEndX - touchStartX
      const diffY = touchEndY - touchStartY

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 70) {
        if (diffX > 0 && touchStartX < 40) {
          setOpen(true)
        } else if (diffX < 0 && isOpen) {
          setOpen(false)
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDesktop, isOpen, setOpen])

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favorites = filteredConversations.filter((c) => c.isFavorite)
  const recent = filteredConversations.filter((c) => c.status !== 'archived')
  const archived = filteredConversations.filter((c) => c.status === 'archived')

  const navItems = [
    { path: '/', icon: Home, label: t('nav.dashboard') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setContextMenu({ id, x: e.clientX, y: e.clientY })
  }

  const toggleFavorite = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) useChatStore.getState().updateConversation(id, { isFavorite: !conv.isFavorite })
  }

  const togglePin = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) useChatStore.getState().updateConversation(id, { isPinned: !conv.isPinned })
  }

  const archiveConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) useChatStore.getState().updateConversation(id, { status: conv.status === 'archived' ? 'active' : 'archived' })
  }

  return (
    <>
      {/* Parameter Settings Slider Drawer Overlay */}
      <AIControls />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface-primary)] border-t sm:border border-[var(--color-border-default)] rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 max-w-full sm:max-w-sm w-full mx-0 sm:mx-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">Delete Conversation?</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              This conversation will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--color-border-default)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteConfirmId
                  setDeleteConfirmId(null)
                  const isActive = location.pathname === `/chat/${id}`
                  await useChatStore.getState().deleteConversation(id)
                  if (isActive) {
                    navigate('/chat')
                  }
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet overlay */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'w-[var(--sidebar-width)] h-screen flex flex-col border-r border-[var(--color-border-default)] bg-[var(--color-surface-primary)] z-40',
              !isDesktop ? 'fixed inset-y-0 left-0 shadow-2xl' : 'fixed inset-y-0 left-0'
            )}
          >
            {/* Header */}
            <div className="pt-6 pb-6 flex items-center justify-center">
              <button
                onClick={() => {
                  navigate('/')
                  if (!isDesktop) setOpen(false)
                }}
                className="group flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-bridge-500 rounded-2xl p-2.5 transition-all duration-300 hover:scale-[1.04] hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.25)] cursor-pointer active:scale-95"
                aria-label="Go to Dashboard"
                title="Go to Dashboard"
              >
                <BridgeLogo className="w-[88px] h-[88px]" />
              </button>
            </div>


            {/* New Chat Button */}
            <div className="px-3 pb-2">
              <Button
                className="w-full"
                onClick={() => {
                  navigate('/chat')
                  if (!isDesktop) setOpen(false)
                }}
              >
                <Plus className="w-4 h-4" />
                {t('nav.newChat')}
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                <input
                  id="sidebar-search-input"
                  type="text"
                  placeholder={t('nav.searchChats')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 rounded-lg bg-[var(--color-surface-tertiary)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-1 focus:ring-bridge-500 transition-all"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-3 pb-2 flex flex-col gap-0.5">
              {navItems.map(({ path, icon: Icon, label }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path)
                    if (!isDesktop) setOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border-l-2',
                    location.pathname === path
                      ? 'bg-[var(--color-active-bg)] text-[var(--color-active-text)] border-[var(--color-active-border)] font-medium'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  <Icon className={cn("w-4 h-4", location.pathname === path ? "text-[var(--color-active-icon)]" : "text-[var(--color-text-secondary)]")} />
                  {label}
                </button>
              ))}
            </div>

            <div className="h-px bg-[var(--color-border-default)] mx-3" />

            {/* Conversations */}
            <ScrollArea className="flex-1 min-h-0 px-1" type="always">
              <div className="p-2 space-y-4">
                {/* Favorites */}
                {favorites.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                      <Star className="w-3 h-3" />
                      {t('nav.favorites')}
                    </p>
                    {favorites.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={location.pathname === `/chat/${conv.id}`}
                        onSelect={() => {
                          navigate(`/chat/${conv.id}`)
                          if (!isDesktop) setOpen(false)
                        }}
                        onContextMenu={(e) => handleContextMenu(e, conv.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Recent */}
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {t('nav.recentChats')}
                  </p>
                  {recent.length === 0 ? (
                    <div className="px-2 py-3">
                      <EmptyState
                        icon={MessageSquare}
                        title="No conversations yet"
                        description="Start a new conversation to begin chatting."
                        actionLabel={t('nav.newChat', 'New Chat')}
                        onAction={() => {
                          navigate('/chat')
                          if (isMobile) setSidebarMobileOpen(false)
                        }}
                        compact
                      />
                    </div>
                  ) : (
                    recent.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={location.pathname === `/chat/${conv.id}`}
                        onSelect={() => {
                          navigate(`/chat/${conv.id}`)
                          if (!isDesktop) setOpen(false)
                        }}
                        onContextMenu={(e) => handleContextMenu(e, conv.id)}
                      />
                    ))
                  )}
                </div>

                {/* Archived */}
                {archived.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                      <Archive className="w-3 h-3" />
                      {t('nav.archived')}
                    </p>
                    {archived.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={location.pathname === `/chat/${conv.id}`}
                        onSelect={() => {
                          navigate(`/chat/${conv.id}`)
                          if (!isDesktop) setOpen(false)
                        }}
                        onContextMenu={(e) => handleContextMenu(e, conv.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--color-border-default)] space-y-2">
              <div className="flex items-center gap-2 px-2 text-xs text-[var(--color-text-tertiary)]">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Connected to GroqCloud
              </div>
              <button
                onClick={() => {
                  navigate('/settings?tab=credits')
                  if (!isDesktop) setOpen(false)
                }}
                className="flex items-center gap-1.5 px-2 text-[11px] text-bridge-500 hover:underline font-semibold cursor-pointer w-full text-left transition-all duration-200"
              >
                <span>About BridgeAI</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[60] bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] rounded-xl shadow-[var(--shadow-elevated)] py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {[
              { icon: Pin, label: t('common.pin'), action: () => togglePin(contextMenu.id) },
              { icon: Star, label: t('common.favorite'), action: () => toggleFavorite(contextMenu.id) },
              { icon: Archive, label: t('common.archive'), action: () => archiveConversation(contextMenu.id) },
              null, // separator
              { icon: Trash2, label: t('common.delete'), action: () => setDeleteConfirmId(contextMenu.id), danger: true },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="h-px bg-[var(--color-border-default)] my-1" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action()
                    setContextMenu(null)
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                    'danger' in item && item.danger
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]'
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ConversationItem({
  conv,
  isActive,
  onSelect,
  onContextMenu,
}: {
  conv: { id: string; title: string; updatedAt: string; isPinned?: boolean; isFavorite?: boolean }
  isActive: boolean
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
}) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all group cursor-pointer outline-none border-l-2',
        isActive
          ? 'bg-[var(--color-active-bg)] text-[var(--color-active-text)] border-[var(--color-active-border)]'
          : 'border-transparent hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)]'
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <MessageSquare className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--color-active-icon)]" : "text-[var(--color-text-secondary)]")} />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{conv.title}</p>
        <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
          {formatRelativeDate(conv.updatedAt)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onContextMenu(e)
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-surface-tertiary)] transition-all"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
      </button>
    </motion.div>
  )
}
