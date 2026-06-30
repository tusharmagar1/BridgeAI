import { cn } from '@/lib/utils'

function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-bridge-100 text-bridge-700 dark:bg-bridge-900/30 dark:text-bridge-400': variant === 'default',
          'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]': variant === 'secondary',
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': variant === 'success',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': variant === 'destructive',
          'border border-[var(--color-border-default)] text-[var(--color-text-secondary)]': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
