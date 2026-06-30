import { cn } from '@/lib/utils'

interface BridgeLogoProps {
  className?: string
  animated?: boolean
}

export function BridgeLogo({ className, animated = false }: BridgeLogoProps) {
  return (
    <div className={cn('relative flex items-center justify-center select-none w-[88px] h-[88px] logo-interactive', className)}>
      <img
        src="/logo.png"
        alt="BridgeAI Logo"
        className={cn(
          'w-full h-full object-contain transition-all duration-300 ease-out',
          animated && 'animate-pulse-glow rounded-xl'
        )}
        style={{
          filter: 'var(--logo-filter, drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15)))',
        }}
      />
    </div>
  )
}
