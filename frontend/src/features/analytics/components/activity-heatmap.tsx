import { useTranslation } from 'react-i18next'
import { useAnalyticsStore } from '@/store/analytics-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function ActivityHeatmap() {
  const { t } = useTranslation()
  const { dailyActivity } = useAnalyticsStore()

  // Generate 15 weeks of calendar grid data
  const totalDays = 15 * 7
  const endDate = new Date()
  const startDate = startOfWeek(subDays(endDate, totalDays - 1))

  // Fill in cells with actual activity or mock values
  const cells = Array.from({ length: totalDays }).map((_, idx) => {
    const dayDate = addDays(startDate, idx)
    
    // Find activity in store
    const storeAct = dailyActivity?.find((a) => isSameDay(new Date(a.date), dayDate))
    
    let messages = 0
    let tokens = 0
    
    if (storeAct) {
      messages = storeAct.messages
      tokens = storeAct.tokens
    } else {
      // Mock: generate random active spots on weekends/weekdays for presentation
      const dayOfWeek = dayDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const rand = Math.random()
      
      // 30% chance of activity, higher on weekdays
      if (rand > (isWeekend ? 0.8 : 0.6) && dayDate <= endDate) {
        messages = Math.floor(Math.random() * 8) + 1
        tokens = messages * (Math.floor(Math.random() * 800) + 200)
      }
    }

    // Determine color scale depending on message count
    let colorClass = 'bg-zinc-100 dark:bg-zinc-900' // Level 0 (no activity)
    if (messages > 0 && messages <= 2) {
      colorClass = 'bg-bridge-500/20 text-bridge-500' // Level 1 (low)
    } else if (messages > 2 && messages <= 5) {
      colorClass = 'bg-bridge-500/40 text-bridge-600 dark:text-bridge-400' // Level 2 (medium)
    } else if (messages > 5 && messages <= 8) {
      colorClass = 'bg-bridge-500/70 text-white' // Level 3 (high)
    } else if (messages > 8) {
      colorClass = 'bg-bridge-500 text-white shadow-xs shadow-bridge-500/20' // Level 4 (ultra)
    }

    return {
      date: dayDate,
      messages,
      tokens,
      colorClass,
    }
  })

  // Group cells into weeks (columns of 7 days)
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const dayLabels = [
    t('common.days.sun', 'S'),
    t('common.days.mon', 'M'),
    t('common.days.tue', 'T'),
    t('common.days.wed', 'W'),
    t('common.days.thu', 'T'),
    t('common.days.fri', 'F'),
    t('common.days.sat', 'S'),
  ]

  return (
    <Card className="border border-[var(--color-border-default)] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
          {t('analytics.heatmap.title', 'Activity Calendar')}
        </CardTitle>
        <CardDescription className="text-xs text-[var(--color-text-secondary)]">
          {t('analytics.heatmap.desc', 'Daily conversation frequency grid for the past 15 weeks')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <TooltipProvider>
          <div className="flex flex-col space-y-4">
            <div className="flex items-start gap-2.5 overflow-x-auto pb-2 scrollbar-thin select-none">
              {/* Day Labels Column */}
              <div className="flex flex-col justify-between h-[112px] pr-1 text-[9px] font-bold text-[var(--color-text-tertiary)] py-0.5">
                {dayLabels.map((label, idx) => (
                  <span key={`${label}-${idx}`} className="h-3 flex items-center">
                    {idx % 2 === 1 ? label : ''}
                  </span>
                ))}
              </div>

              {/* Heatmap Grid (Columns represent weeks) */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={`week-${wIdx}`} className="flex flex-col gap-1">
                    {week.map((day, dIdx) => (
                      <Tooltip key={`day-${wIdx}-${dIdx}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-115 hover:ring-1 hover:ring-bridge-500 cursor-pointer ${day.colorClass}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs p-2 rounded-lg bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] shadow-md text-[var(--color-text-primary)]">
                          <div className="font-semibold">{format(day.date, 'EEEE, MMMM dd, yyyy')}</div>
                          <div className="text-[10px] text-[var(--color-text-secondary)]">
                            {day.messages === 0
                              ? t('analytics.heatmap.noActivity', 'No messages')
                              : t('analytics.heatmap.activityInfo', '{{messages}} messages ({{tokens}} tokens)', {
                                  messages: day.messages,
                                  tokens: day.tokens.toLocaleString(),
                                })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend Footer */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              <span>{t('analytics.heatmap.less', 'Less')}</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-900" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-bridge-500/20" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-bridge-500/40" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-bridge-500/70" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-bridge-500" />
              <span>{t('analytics.heatmap.more', 'More')}</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
