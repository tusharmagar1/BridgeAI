import { useTranslation } from 'react-i18next'
import { Activity, ShieldCheck, Zap } from 'lucide-react'
import { AI_MODELS } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AIStatus() {
  const { t } = useTranslation()

  // Mock some realistic latencies for demonstration
  const modelLatencies: Record<string, string> = {
    'llama-3.3-70b-versatile': '820ms',
    'llama-3.1-8b-instant': '180ms',
    'mixtral-8x7b-32768': '450ms',
    'gemma2-9b-it': '310ms',
  }

  return (
    <Card className="h-full border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Activity className="w-5 h-5 text-bridge-500" />
              <span>{t('dashboard.status.heading', 'AI Engine Status')}</span>
            </h2>
            <Badge variant="success" className="flex items-center gap-1.5 px-2 py-0.5 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('dashboard.status.allOperational', 'Operational')}</span>
            </Badge>
          </div>

          <div className="space-y-3">
            {AI_MODELS.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-[var(--color-text-primary)] truncate block">
                      {model.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] block">
                      {model.provider}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right flex-shrink-0 text-[10px] font-medium text-[var(--color-text-secondary)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider block">
                      {t('dashboard.status.latency', 'Latency')}
                    </span>
                    <span className="flex items-center gap-0.5 justify-end font-semibold text-bridge-500">
                      <Zap className="w-2.5 h-2.5" />
                      {modelLatencies[model.id] || '350ms'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider block">
                      {t('dashboard.status.context', 'Context')}
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {model.contextWindow >= 1000
                        ? `${model.contextWindow / 1000}k`
                        : model.contextWindow}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
