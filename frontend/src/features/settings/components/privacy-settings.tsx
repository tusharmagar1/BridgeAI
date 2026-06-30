import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'
import { useChatStore } from '@/store/chat-store'
import { useAnalyticsStore } from '@/store/analytics-store'
import { useUIStore } from '@/store/ui-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Shield, Eye, Trash2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PrivacySettings() {
  const { t } = useTranslation()
  const { privacy, updatePrivacy } = useSettingsStore()
  const { clearMessages, setConversations } = useChatStore()
  const { resetAnalytics } = useAnalyticsStore()
  const { addToast } = useUIStore()

  const handleClearAll = () => {
    if (confirm(t('settings.privacy.clearConfirm', 'Are you absolutely sure you want to delete all chat history and analytics? This action is irreversible.'))) {
      // Clear stores
      clearMessages()
      setConversations([])
      resetAnalytics()
      
      // Clear localStorage keys if any
      localStorage.removeItem('bridgeai-settings')
      
      addToast({
        type: 'success',
        title: t('settings.privacy.clearSuccessTitle', 'Data wiped'),
        description: t('settings.privacy.clearSuccessDesc', 'All personal conversations, analytics, and session stores have been deleted.'),
      })
    }
  }

  const retentionOptions = [
    { value: 'forever', label: t('settings.privacy.retention.forever', 'Indefinitely') },
    { value: '30days', label: t('settings.privacy.retention.30days', '30 Days') },
    { value: '90days', label: t('settings.privacy.retention.90days', '90 Days') },
    { value: '1year', label: t('settings.privacy.retention.1year', '1 Year') },
  ] as const

  return (
    <div className="space-y-6">
      {/* Privacy settings */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-bridge-500" />
            <span>{t('settings.privacy.heading', 'Data & Privacy Settings')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.privacy.desc', 'Manage how your conversation transcripts and usage statistics are handled')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Save Chat History */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {t('settings.privacy.saveHistory', 'Save Chat History')}
              </span>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                {t('settings.privacy.saveHistoryDesc', 'Store conversation logs locally to let you search and continue chats later.')}
              </p>
            </div>
            <Switch
              checked={privacy.saveChatHistory}
              onCheckedChange={(checked) => updatePrivacy({ saveChatHistory: checked })}
            />
          </div>

          {/* Share Analytics */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)]">
            <div className="space-y-0.5 max-w-[80%]">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {t('settings.privacy.shareAnalytics', 'Anonymous Telemetry')}
              </span>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                {t('settings.privacy.shareAnalyticsDesc', 'Share anonymous engine logs to help improve response generation accuracy.')}
              </p>
            </div>
            <Switch
              checked={privacy.shareAnalytics}
              onCheckedChange={(checked) => updatePrivacy({ shareAnalytics: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Retention Period selector */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>{t('settings.privacy.retentionHeading', 'Data Retention Period')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.privacy.retentionDesc', 'Configure the duration for which chat logs are saved before automatic deletion')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2.5">
          {retentionOptions.map((item) => (
            <button
              key={item.value}
              onClick={() => updatePrivacy({ dataRetention: item.value })}
              className={cn(
                'px-4 py-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer',
                privacy.dataRetention === item.value
                  ? 'border-bridge-500 bg-bridge-500/10 text-bridge-500 shadow-sm'
                  : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
              )}
            >
              {item.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Dangerous Wipe */}
      <Card className="border border-rose-500/20 bg-rose-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-rose-500 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>{t('settings.privacy.dangerHeading', 'Danger Zone')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.privacy.dangerDesc', 'Permanently delete all of your conversation history, stored settings, and analytics')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            {t('settings.privacy.clearBtn', 'Wipe All Local Data')}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
