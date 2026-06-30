import { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquarePlus, BarChart3, Settings, Search,
  Globe, Mic, Keyboard, Home,
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const runAction = (action: () => void) => {
    action()
    setCommandPaletteOpen(false)
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <Command className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] shadow-[var(--shadow-elevated)] overflow-hidden">
              <div className="flex items-center border-b border-[var(--color-border-default)] px-3">
                <Search className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                <Command.Input
                  placeholder={`${t('common.search')} ${t('common.commandPalette')}...`}
                  className="flex h-12 w-full bg-transparent py-3 px-2 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] text-[var(--color-text-primary)]"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                  {t('common.noResults')}
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs text-[var(--color-text-tertiary)] px-2 py-1.5 font-medium">
                  <Command.Item
                    onSelect={() => runAction(() => navigate('/'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors"
                  >
                    <Home className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    {t('nav.dashboard')}
                    <kbd className="ml-auto text-[10px] text-[var(--color-text-tertiary)] border border-[var(--color-border-default)] rounded px-1.5 py-0.5">⌘H</kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => navigate('/chat'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    {t('nav.newChat')}
                    <kbd className="ml-auto text-[10px] text-[var(--color-text-tertiary)] border border-[var(--color-border-default)] rounded px-1.5 py-0.5">⌘N</kbd>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => navigate('/analytics'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    {t('nav.analytics')}
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runAction(() => navigate('/settings'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    {t('nav.settings')}
                    <kbd className="ml-auto text-[10px] text-[var(--color-text-tertiary)] border border-[var(--color-border-default)] rounded px-1.5 py-0.5">⌘,</kbd>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="h-px bg-[var(--color-border-default)] my-1" />

                <Command.Group heading="Actions" className="text-xs text-[var(--color-text-tertiary)] px-2 py-1.5 font-medium">

                  <Command.Item className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors">
                    <Globe className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    Change Language
                  </Command.Item>
                  <Command.Item className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors">
                    <Mic className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    Start Voice Chat
                  </Command.Item>
                  <Command.Item className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] data-[selected=true]:bg-[var(--color-surface-tertiary)] transition-colors">
                    <Keyboard className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    View Keyboard Shortcuts
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="border-t border-[var(--color-border-default)] p-2 flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] px-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
