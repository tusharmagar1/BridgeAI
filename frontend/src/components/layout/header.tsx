import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Menu, Search, Globe, Settings, Sparkles,
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useSettingsStore } from '@/store/settings-store'
import { useIsMobile, useIsDesktop } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BridgeLogo } from '@/components/ui/bridge-logo'
import { SUPPORTED_LANGUAGES } from '@/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, toggleSidebar, setSidebarMobileOpen, setCommandPaletteOpen } = useUIStore()
  const { uiLanguage, setUILanguage } = useSettingsStore()
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [langOpen, setLangOpen] = useState(false)

  const pageTitle = () => {
    if (location.pathname === '/') return t('nav.dashboard')
    if (location.pathname.startsWith('/chat')) return t('nav.chat')
    if (location.pathname === '/analytics') return t('nav.analytics')
    if (location.pathname === '/settings') return t('nav.settings')
    return ''
  }

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === uiLanguage)

  return (
    <header className="h-[var(--header-height)] glass-subtle flex items-center justify-between px-4 z-30 border-b border-[var(--color-border-subtle)]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => !isDesktop ? setSidebarMobileOpen(true) : toggleSidebar()}
          className="text-[var(--color-text-secondary)]"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {!sidebarOpen && isDesktop && (
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bridge-500 rounded-xl p-1.5 transition-all duration-300 hover:scale-[1.04] cursor-pointer active:scale-95"
            aria-label="Go to Dashboard"
            title="Go to Dashboard"
          >
            <BridgeLogo className="w-8 h-8" />
            <span className="font-bold text-sm text-[var(--color-text-primary)] tracking-wide select-none">
              BridgeAI
            </span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">{pageTitle()}</h2>
          <Badge variant="success" className="flex gap-1 text-[9px] px-1.5 py-0.5 sm:text-xs sm:px-2.5">
            <Sparkles className="w-3 h-3" />
            Llama 3.3
          </Badge>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-[var(--color-text-secondary)]"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Language */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLangOpen(!langOpen)}
            className="text-[var(--color-text-secondary)]"
          >
            <Globe className="w-4 h-4" />
          </Button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] rounded-xl shadow-[var(--shadow-elevated)] py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setUILanguage(lang.code)
                      i18n.changeLanguage(lang.code)
                      setLangOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors hover:bg-[var(--color-hover-bg)]',
                      lang.code === uiLanguage
                        ? 'text-[var(--color-active-text)] font-medium bg-[var(--color-active-bg)]'
                        : 'text-[var(--color-text-primary)]'
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    {lang.code === uiLanguage && (
                      <span className="ml-auto text-[var(--color-active-text)]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>



        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-[var(--color-text-secondary)]"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
