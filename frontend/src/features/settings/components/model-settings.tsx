import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { AI_MODELS } from '@/types'
import { Brain, Sliders, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ModelSettings() {
  const { t } = useTranslation()
  const { ai, updateAIConfig } = useSettingsStore()

  const handleModelChange = (modelId: string) => {
    updateAIConfig({ model: modelId })
  }

  return (
    <div className="space-y-6">
      {/* Default Model */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Brain className="w-4 h-4 text-bridge-500" />
            <span>{t('settings.model.heading', 'Default AI Engine')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.model.desc', 'Select the default intelligence engine for all newly created chats')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AI_MODELS.map((model) => (
            <div
              key={model.id}
              onClick={() => handleModelChange(model.id)}
              className={cn(
                'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4',
                ai.model === model.id
                  ? 'border-bridge-500 bg-bridge-500/5 shadow-xs'
                  : 'border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-surface-secondary)]/50'
              )}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">{model.name}</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 rounded font-medium">
                    {model.provider}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {model.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center',
                  ai.model === model.id ? 'border-bridge-500' : 'border-[var(--color-border-default)]'
                )}>
                  {ai.model === model.id && <div className="w-2 h-2 rounded-full bg-bridge-500" />}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Default Sliders (Temperature, Tokens) */}
      <Card className="border border-[var(--color-border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>{t('settings.model.paramsHeading', 'Default Parameters')}</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('settings.model.paramsDesc', 'Fine-tune creative variance and length limits for your default responses')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-bridge-500" />
                {t('chat.controls.temperature', 'Temperature')}
              </span>
              <span className="text-bridge-500 tabular-nums bg-bridge-500/10 px-1.5 py-0.5 rounded">
                {ai.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[ai.temperature]}
              onValueChange={([val]) => updateAIConfig({ temperature: val })}
              min={0.0}
              max={2.0}
              step={0.1}
            />
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Settings className="w-3.5 h-3.5 text-emerald-500" />
                {t('chat.controls.maxTokens', 'Max Response Length')}
              </span>
              <span className="text-emerald-500 tabular-nums bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {ai.maxTokens}
              </span>
            </div>
            <Slider
              value={[ai.maxTokens]}
              onValueChange={([val]) => updateAIConfig({ maxTokens: val })}
              min={256}
              max={8192}
              step={128}
            />
          </div>

          {/* Streaming switch */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)]">
            <div className="space-y-0.5 max-w-[80%]">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {t('settings.model.streaming', 'Real-time Streaming')}
              </span>
              <p className="text-[10px] text-[var(--color-text-secondary)]">
                {t('settings.model.streamingDesc', 'Stream response words one by one as they are generated by the model.')}
              </p>
            </div>
            <Switch
              checked={ai.streaming}
              onCheckedChange={(checked) => updateAIConfig({ streaming: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
