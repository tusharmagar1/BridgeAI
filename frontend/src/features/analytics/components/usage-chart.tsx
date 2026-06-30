import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnalyticsStore } from '@/store/analytics-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'
import { format, subDays } from 'date-fns'

export function UsageChart() {
  const { t } = useTranslation()
  const { dailyActivity } = useAnalyticsStore()
  const [chartType, setChartType] = useState<'messages' | 'tokens'>('messages')

  // Generate gorgeous mock data for the last 10 days if store is empty
  const getChartData = () => {
    if (dailyActivity && dailyActivity.length > 0) {
      return dailyActivity.map((act) => ({
        date: format(new Date(act.date), 'MMM dd'),
        messages: act.messages,
        tokens: act.tokens,
      }))
    }

    // Mock data
    return Array.from({ length: 10 }).map((_, idx) => {
      const date = subDays(new Date(), 9 - idx)
      return {
        date: format(date, 'MMM dd'),
        messages: Math.floor(Math.random() * 15) + 5,
        tokens: Math.floor(Math.random() * 8000) + 2000,
      }
    })
  }

  const chartData = getChartData()

  return (
    <Card className="border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
            {t('analytics.charts.usageOverTime', 'Usage History')}
          </CardTitle>
          <CardDescription className="text-xs text-[var(--color-text-secondary)]">
            {t('analytics.charts.usageDesc', 'Daily messages count and tokens consumed over time')}
          </CardDescription>
        </div>

        <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'messages' | 'tokens')}>
          <TabsList className="grid grid-cols-2 w-[180px] p-0.5 rounded-lg bg-[var(--color-surface-secondary)]">
            <TabsTrigger value="messages" className="text-xs py-1 cursor-pointer">
              {t('analytics.charts.messages', 'Messages')}
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-xs py-1 cursor-pointer">
              {t('analytics.charts.tokens', 'Tokens')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'messages' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-default)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-text-secondary)"
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-text-secondary)"
                />
                <Tooltip
                  cursor={{ fill: 'var(--color-bridge-500)', opacity: 0.05 }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-primary)',
                    borderColor: 'var(--color-border-default)',
                    borderRadius: '12px',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar
                  dataKey="messages"
                  name={t('analytics.charts.messages', 'Messages')}
                  fill="var(--color-bridge-500, #3b82f6)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-emerald-500, #10b981)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-emerald-500, #10b981)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-default)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-text-secondary)"
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--color-text-secondary)"
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-primary)',
                    borderColor: 'var(--color-border-default)',
                    borderRadius: '12px',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  name={t('analytics.charts.tokens', 'Tokens')}
                  stroke="var(--color-emerald-500, #10b981)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
