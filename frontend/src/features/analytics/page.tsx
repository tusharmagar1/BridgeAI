import { motion } from 'framer-motion'
import { StatsCards } from './components/stats-cards'
import { UsageChart } from './components/usage-chart'
import { ActivityHeatmap } from './components/activity-heatmap'
import { PerformanceMetrics } from './components/performance-metrics'
import { BarChart3, Presentation } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/store/chat-store'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/empty-state'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { conversations } = useChatStore()
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 bg-[var(--color-surface-secondary)]/10 scrollbar-thin">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto p-4 md:p-8 space-y-6"
      >
        {/* Page Title Header */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] pb-4">
          <BarChart3 className="w-6 h-6 text-bridge-500" />
          <div>
            <h1 className="text-xl font-extrabold text-[var(--color-text-primary)]">
              {t('analytics.title', 'Usage & Analytics cockpit')}
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('analytics.subtitle', 'Real-time telemetry of your conversations, token consumption, and engine performance.')}
            </p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <motion.div variants={itemVariants} className="py-12">
            <EmptyState
              icon={Presentation}
              title={t('analytics.empty.title', 'No Analytics Telemetry Available')}
              description={t('analytics.empty.desc', 'We compile detailed telemetry charts regarding your token usage, daily message frequencies, and response latency as soon as you begin conversing.')}
              actionLabel={t('analytics.empty.action', 'Initiate First Conversation')}
              onAction={() => navigate('/chat')}
            />
          </motion.div>
        ) : (
          <>
            {/* 1. Stat Cards Row */}
            <motion.div variants={itemVariants}>
              <StatsCards />
            </motion.div>

            {/* 2. Usage Chart (Tabbed) */}
            <motion.div variants={itemVariants}>
              <UsageChart />
            </motion.div>

            {/* 3. Heatmap Calendar */}
            <motion.div variants={itemVariants}>
              <ActivityHeatmap />
            </motion.div>

            {/* 4. Pie/Breakdowns Grid */}
            <motion.div variants={itemVariants}>
              <PerformanceMetrics />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}
