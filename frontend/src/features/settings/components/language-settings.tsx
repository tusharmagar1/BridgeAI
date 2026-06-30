import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SUPPORTED_LANGUAGES } from '@/types'
import { Globe, Languages, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESPONSE_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Mirror Input Language', flag: '✨' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
]

const OTHER_LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
]

export function LanguageSettings() {
  const { t, i18n } = useTranslation()
  const {
    uiLanguage,
    setUILanguage,
    chatLanguage,
    setChatLanguage,
    autoDetectLanguage,
    setAutoDetectLanguage,
  } = useSettingsStore()

  const [showOtherLangs, setShowOtherLangs] = useState(false)

  const handleUILanguageChange = (code: string) => {
    setUILanguage(code)
    i18n.changeLanguage(code)
  }

  const handleResponseLanguageChange = (code: string) => {
    setChatLanguage(code)
    setAutoDetectLanguage(code === 'auto')
  }

  // Determine if the currently active chat language is in the "Other" list
  const isOtherActive = OTHER_LANGUAGES.some(l => l.code === chatLanguage)

  return (
    <div className="space-y-6">
      {/* UI Translation Language */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Globe className="w-4 h-4 text-bridge-500" />
            <span>{t('settings.language.uiHeading', 'Interface Language')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.language.uiDesc', 'Select the language used for the buttons, menus, and dashboard controls')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleUILanguageChange(lang.code)}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-left',
                uiLanguage === lang.code
                  ? 'border-bridge-500 bg-bridge-500/10 text-bridge-500 shadow-sm'
                  : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="min-w-0">
                <span className="block truncate text-[var(--color-text-primary)] font-bold">{lang.name}</span>
                <span className="block text-[10px] text-[var(--color-text-tertiary)] font-normal">{lang.nativeName}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* AI Response Language */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-500" />
            <span>{t('settings.language.chatHeading', 'AI Response Language')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.language.chatDesc', 'Set the target language for AI responses. When "Auto Detect" is enabled, the AI will automatically reply in the same language as your input message.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Main Response Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RESPONSE_LANGUAGES.map((lang) => {
              const isSelected = (lang.code === 'auto' && autoDetectLanguage) || (lang.code === chatLanguage && !autoDetectLanguage)
              return (
                <button
                  key={`chat-${lang.code}`}
                  onClick={() => handleResponseLanguageChange(lang.code)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-left',
                    isSelected
                      ? 'border-bridge-500 bg-bridge-500/10 text-bridge-500 shadow-sm'
                      : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="min-w-0">
                    <span className="block truncate text-[var(--color-text-primary)] font-bold">{lang.name}</span>
                    <span className="block text-[9px] text-[var(--color-text-tertiary)] font-normal">{lang.nativeName}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Expandable Other Languages Option */}
          <div className="pt-2 border-t border-[var(--color-border-default)]">
            <button
              onClick={() => setShowOtherLangs(!showOtherLangs)}
              className="flex items-center justify-between w-full py-2 text-xs font-bold text-bridge-500 hover:text-bridge-600 transition-colors cursor-pointer"
            >
              <span>Other supported languages {isOtherActive && `(${OTHER_LANGUAGES.find(l => l.code === chatLanguage)?.name})`}</span>
              {showOtherLangs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOtherLangs && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {OTHER_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === chatLanguage && !autoDetectLanguage
                  return (
                    <button
                      key={`chat-${lang.code}`}
                      onClick={() => handleResponseLanguageChange(lang.code)}
                      className={cn(
                        'flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-left',
                        isSelected
                          ? 'border-bridge-500 bg-bridge-500/10 text-bridge-500 shadow-sm'
                          : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                      )}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="min-w-0">
                        <span className="block truncate text-[var(--color-text-primary)] font-bold">{lang.name}</span>
                        <span className="block text-[9px] text-[var(--color-text-tertiary)] font-normal">{lang.nativeName}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
