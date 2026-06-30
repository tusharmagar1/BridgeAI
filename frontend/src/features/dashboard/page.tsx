import { motion } from 'framer-motion'
import { WelcomeScreen } from './components/welcome-screen'
import { QuickActions } from './components/quick-actions'
import { RecentChats } from './components/recent-chats'
import { UsageStats } from './components/usage-stats'
import { AIStatus } from './components/ai-status'

export default function DashboardPage() {
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
        className="max-w-6xl mx-auto p-4 md:p-8 space-y-8"
      >
        {/* Welcome Banner */}
        <motion.div variants={itemVariants}>
          <WelcomeScreen />
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>

        {/* Bottom Cockpit Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1">
            <RecentChats />
          </div>
          <div className="lg:col-span-1">
            <UsageStats />
          </div>
          <div className="lg:col-span-1 md:col-span-2">
            <AIStatus />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
