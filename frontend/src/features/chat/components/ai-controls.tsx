import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Sliders, Settings, Sparkles, Globe, Shield, MessageSquare } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useSettingsStore } from '@/store/settings-store'
import { AI_MODELS } from '@/types'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export function AIControls() {
  const { t } = useTranslation()
  const { aiControlsOpen, setAIControlsOpen } = useUIStore()
  const { ai, updateAIConfig } = useSettingsStore()

  const handleModelChange = (modelId: string) => {
    updateAIConfig({ model: modelId })
  }

  const handleModeChange = (mode: 'creative' | 'balanced' | 'precise') => {
    const defaultParams = {
      creative: { temperature: 1.1, topP: 0.95, reasoningMode: false },
      balanced: { temperature: 0.7, topP: 0.9, reasoningMode: false },
      precise: { temperature: 0.2, topP: 0.8, reasoningMode: true },
    }
    updateAIConfig({ mode, ...defaultParams[mode] })
  }

  return (
    <AnimatePresence>
      {aiControlsOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setAIControlsOpen(false)}
            className="fixed inset-0 z-40 bg-black backdrop-blur-xs"
          />

          {/* Sliding Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--color-surface-primary)] border-l border-[var(--color-border-default)] shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-default)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-bridge-500" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  {t('chat.controls.heading', 'AI Engine Parameters')}
                </h2>
              </div>
              <button
                onClick={() => setAIControlsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Presets Mode Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {t('chat.controls.mode', 'Optimization Profile')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['precise', 'balanced', 'creative'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        ai.mode === m
                          ? 'border-bridge-500 bg-bridge-500/10 text-bridge-500 shadow-sm'
                          : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                      }`}
                    >
                      {t(`chat.controls.modeOption.${m}`, m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selector Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {t('chat.controls.model', 'Active Model')}
                </label>
                <div className="space-y-2">
                  {AI_MODELS.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        ai.model === model.id
                          ? 'border-bridge-500 bg-bridge-500/5 shadow-xs'
                          : 'border-[var(--color-border-default)] bg-transparent hover:border-[var(--color-border-default)]/80 hover:bg-[var(--color-surface-secondary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                          {model.name}
                        </span>
                        {ai.model === model.id && (
                          <span className="w-2 h-2 rounded-full bg-bridge-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders (Temperature, Max Tokens, Top P) */}
              <div className="space-y-5 border-t border-[var(--color-border-default)] pt-5">
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
                  <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)]">
                    <span>{t('chat.controls.tempLow', 'Precise (0.0)')}</span>
                    <span>{t('chat.controls.tempHigh', 'Creative (2.0)')}</span>
                  </div>
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
              </div>

              {/* Switches */}
              <div className="space-y-4 border-t border-[var(--color-border-default)] pt-5">
                {/* Web Search Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-primary)]">
                      <Globe className="w-4 h-4 text-sky-500" />
                      <span>{t('chat.controls.webSearch', 'Web Search')}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {t('chat.controls.webSearchDesc', 'Synthesize real-time information from the internet')}
                    </p>
                  </div>
                  <Switch
                    checked={ai.webSearch}
                    onCheckedChange={(checked) => updateAIConfig({ webSearch: checked })}
                  />
                </div>

                {/* Reasoning Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-primary)]">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span>{t('chat.controls.reasoning', 'Deep Reasoning')}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">
                      {t('chat.controls.reasoningDesc', 'Activate chain-of-thought processing for complex tasks')}
                    </p>
                  </div>
                  <Switch
                    checked={ai.reasoningMode}
                    onCheckedChange={(checked) => updateAIConfig({ reasoningMode: checked })}
                  />
                </div>
              </div>

              {/* System Prompt Editor */}
              <div className="space-y-2 border-t border-[var(--color-border-default)] pt-5">
                <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-pink-500" />
                  {t('chat.controls.systemPrompt', 'System Instructions')}
                </label>
                <textarea
                  value={ai.systemPrompt}
                  onChange={(e) => updateAIConfig({ systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full p-3 text-xs rounded-xl border border-[var(--color-border-default)] focus:outline-none focus:border-bridge-500 bg-[var(--color-surface-secondary)]/30 text-[var(--color-text-primary)] leading-relaxed resize-y font-sans shadow-inner"
                  placeholder={t('chat.controls.systemPromptPlaceholder', 'Define assistant behavior here...')}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/10 flex gap-3">
              <button
                onClick={() => {
                  updateAIConfig({
                    temperature: 0.7,
                    maxTokens: 4096,
                    topP: 0.9,
                    streaming: true,
                    mode: 'balanced',
                    reasoningMode: false,
                    webSearch: false,
                    systemPrompt: 'You are BridgeAI, a helpful multilingual assistant. Respond in the same language the user writes in.',
                  })
                }}
                className="flex-1 py-2 rounded-xl border border-[var(--color-border-default)] hover:bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-secondary)] cursor-pointer transition-colors"
              >
                {t('chat.controls.reset', 'Reset to Defaults')}
              </button>
              <button
                onClick={() => setAIControlsOpen(false)}
                className="flex-1 py-2 rounded-xl bg-bridge-500 hover:bg-bridge-600 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                {t('common.done', 'Done')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
