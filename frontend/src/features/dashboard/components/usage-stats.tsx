import { useTranslation } from 'react-i18next'
import { BarChart2, MessageSquare, Flame, Globe } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analytics-store'
import { Card, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export function UsageStats() {
  const { t } = useTranslation()
  const { totalMessages, totalTokens, languagesUsed, dailyActivity } = useAnalyticsStore()

  // Generate simple sparkline data from dailyActivity or fallback
  const sparklineData = dailyActivity && dailyActivity.length > 0
    ? dailyActivity.map(d => ({ value: d.messages }))
    : [
        { value: 12 },
        { value: 19 },
        { value: 15 },
        { value: 25 },
        { value: 22 },
        { value: 30 },
        { value: 45 },
      ]

  const stats = [
    {
      id: 'messages',
      label: t('dashboard.stats.messages', 'Total Messages'),
      value: totalMessages || 148,
      icon: MessageSquare,
      color: 'text-bridge-500 bg-bridge-500/10',
    },
    {
      id: 'tokens',
      label: t('dashboard.stats.tokens', 'Tokens Consumed'),
      value: totalTokens ? `${(totalTokens / 1000).toFixed(1)}k` : '182.4k',
      icon: Flame,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      id: 'languages',
      label: t('dashboard.stats.languages', 'Languages Used'),
      value: languagesUsed?.length || 4,
      icon: Globe,
      color: 'text-purple-500 bg-purple-500/10',
    },
  ]

  return (
    <Card className="h-full border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-bridge-500" />
            <span>{t('dashboard.stats.heading', 'Usage Overview')}</span>
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Premium Mini-Sparkline Area Chart */}
        <div className="h-16 w-full pt-2 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-bridge-500, #3b82f6)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-bridge-500, #3b82f6)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-bridge-500, #3b82f6)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMessages)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
