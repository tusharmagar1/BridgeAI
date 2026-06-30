import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AppearanceSettings } from './components/appearance-settings'
import { LanguageSettings } from './components/language-settings'
import { ModelSettings } from './components/model-settings'
import { VoiceSettings } from './components/voice-settings'
import { PrivacySettings } from './components/privacy-settings'
import { KeyboardShortcuts } from './components/keyboard-shortcuts'
import { CreditsSettings } from './components/credits-settings'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Settings, Palette, Globe, Sliders, Volume2, Shield, Keyboard, Info, Search } from 'lucide-react'

export default function SettingsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'appearance'
  const [globalSearch, setGlobalSearch] = useState('')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  }

  const menuItems = [
    { value: 'appearance', label: t('settings.menu.appearance', 'Appearance'), icon: Palette, component: AppearanceSettings },
    { value: 'language', label: t('settings.menu.language', 'Language'), icon: Globe, component: LanguageSettings },
    { value: 'model', label: t('settings.menu.model', 'AI Model'), icon: Sliders, component: ModelSettings },
    { value: 'voice', label: t('settings.menu.voice', 'Voice Synthesis'), icon: Volume2, component: VoiceSettings },
    { value: 'privacy', label: t('settings.menu.privacy', 'Privacy & Security'), icon: Shield, component: PrivacySettings },
    { value: 'shortcuts', label: t('settings.menu.shortcuts', 'Keyboard Shortcuts'), icon: Keyboard, component: KeyboardShortcuts },
    { value: 'credits', label: t('settings.menu.credits', 'Credits'), icon: Info, component: CreditsSettings },
  ]

  const searchTargets = [
    { keys: ['theme', 'appearance', 'color', 'dark', 'light', 'accent', 'preset'], tab: 'appearance' },
    { keys: ['wallpaper', 'background', 'canvas'], tab: 'appearance' },
    { keys: ['font', 'typography', 'text', 'size'], tab: 'appearance' },
    { keys: ['motion', 'animation', 'speed', 'blur', 'radius', 'corner'], tab: 'appearance' },
    { keys: ['accessibility', 'contrast', 'reduced motion'], tab: 'appearance' },
    { keys: ['language', 'translate', 'locale', 'hindi', 'english'], tab: 'language' },
    { keys: ['model', 'ai', 'llm', 'llama', 'gemini', 'gpt'], tab: 'model' },
    { keys: ['voice', 'speech', 'synthesis', 'volume', 'pitch', 'speed'], tab: 'voice' },
    { keys: ['privacy', 'security', 'data', 'history', 'retention'], tab: 'privacy' },
    { keys: ['shortcut', 'keyboard', 'keybind'], tab: 'shortcuts' },
    { keys: ['credit', 'info', 'version', 'about'], tab: 'credits' },
  ]

  const handleGlobalSearch = (val: string) => {
    setGlobalSearch(val)
    if (!val) return

    const query = val.toLowerCase().trim()
    // Find the first target that has a keyword matching the query
    const match = searchTargets.find(target =>
      target.keys.some(key => key.includes(query) || query.includes(key))
    )

    if (match && match.tab !== activeTab) {
      setSearchParams({ tab: match.tab })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 bg-[var(--color-surface-secondary)]/10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[94%] mx-auto p-4 md:p-6 space-y-4"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-default)] pb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-bridge-500 animate-[spin_10s_linear_infinite]" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">
                {t('settings.title', 'Settings Console')}
              </h1>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                {t('settings.subtitle', 'Configure preferences, language models, voice parameters, and security policies.')}
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={t('settings.search.placeholder', 'Search settings...')}
              value={globalSearch}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 pl-9 bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] rounded-xl focus:outline-none focus:border-bridge-500 placeholder:text-[var(--color-text-tertiary)] text-[var(--color-text-primary)] shadow-xs transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          </div>
        </div>

        {/* Tab Layout (Vertical Sidebar on Desktop, Top Tabs on Mobile) */}
        <motion.div variants={itemVariants} className="w-full">
          <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="flex flex-col md:flex-row gap-5 items-start">
            {/* Sidebar Navigation */}
            <TabsList className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible w-full md:w-56 p-1 rounded-2xl bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] space-y-0 md:space-y-1 select-none flex-shrink-0 scrollbar-none shadow-xs">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="flex flex-1 w-full justify-start items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-active-text)] hover:bg-[var(--color-hover-bg)] data-[state=active]:bg-[var(--color-active-bg)] data-[state=active]:text-[var(--color-active-text)] border-l-2 border-transparent data-[state=active]:border-[var(--color-active-border)] transition-all text-left truncate"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Active Setting Panel Content (Removed card styling to avoid nesting and utilize space) */}
            <div className="flex-1 w-full min-w-0">
              {menuItems.map((item) => {
                const Component = item.component
                return (
                  <TabsContent
                    key={item.value}
                    value={item.value}
                    className="mt-0 outline-none focus-visible:outline-none"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Component />
                    </motion.div>
                  </TabsContent>
                )
              })}
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}

