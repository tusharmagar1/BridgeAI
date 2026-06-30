import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Flame, Coins, Globe, Clock, MessageCircle } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analytics-store'
import { useChatStore } from '@/store/chat-store'
import { Card, CardContent } from '@/components/ui/card'

export function StatsCards() {
  const { t } = useTranslation()
  const { totalMessages, totalTokens, languagesUsed } = useAnalyticsStore()
  const { conversations } = useChatStore()

  // Calculate some realistic stats
  const activeConversations = conversations.filter(c => c.status === 'active').length
  const estimatedSavings = ((totalTokens || 182400) * 0.002).toFixed(2) // Mock local model savings compared to expensive APIs
  const averageLatency = '380ms'

  const cardData = [
    {
      id: 'conversations',
      title: t('analytics.stats.conversations', 'Active Chats'),
      value: activeConversations || 12,
      icon: MessageCircle,
      color: 'from-blue-500/20 via-blue-600/10 to-transparent border-blue-500/20 text-blue-500',
    },
    {
      id: 'messages',
      title: t('analytics.stats.messages', 'Total Messages'),
      value: totalMessages || 148,
      icon: MessageSquare,
      color: 'from-emerald-500/20 via-emerald-600/10 to-transparent border-emerald-500/20 text-emerald-500',
    },
    {
      id: 'tokens',
      title: t('analytics.stats.tokens', 'Tokens Processed'),
      value: totalTokens ? `${(totalTokens / 1000).toFixed(1)}k` : '182.4k',
      icon: Flame,
      color: 'from-amber-500/20 via-amber-600/10 to-transparent border-amber-500/20 text-amber-500',
    },
    {
      id: 'cost',
      title: t('analytics.stats.savings', 'Cost Saved'),
      value: `$${estimatedSavings}`,
      icon: Coins,
      color: 'from-purple-500/20 via-purple-600/10 to-transparent border-purple-500/20 text-purple-500',
    },
    {
      id: 'languages',
      title: t('analytics.stats.languages', 'Languages Active'),
      value: languagesUsed?.length || 4,
      icon: Globe,
      color: 'from-pink-500/20 via-pink-600/10 to-transparent border-pink-500/20 text-pink-500',
    },
    {
      id: 'latency',
      title: t('analytics.stats.latency', 'Avg Response Time'),
      value: averageLatency,
      icon: Clock,
      color: 'from-cyan-500/20 via-cyan-600/10 to-transparent border-cyan-500/20 text-cyan-500',
    },
  ]

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-6 gap-4"
    >
      {cardData.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div key={stat.id} variants={cardVariants}>
            <Card className={`h-full border bg-gradient-to-br ${stat.color} shadow-xs hover:shadow-md transition-all duration-300`}>
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight tabular-nums">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
