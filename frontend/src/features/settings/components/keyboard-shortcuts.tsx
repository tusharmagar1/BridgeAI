import { useTranslation } from 'react-i18next'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Keyboard, Command } from 'lucide-react'

export function KeyboardShortcuts() {
  const { t } = useTranslation()

  const shortcutList = Object.values(KEYBOARD_SHORTCUTS)

  return (
    <Card className="border border-[var(--color-border-default)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-bridge-500" />
          <span>{t('settings.shortcuts.heading', 'Keyboard Shortcuts')}</span>
        </CardTitle>
        <CardDescription className="text-xs text-[var(--color-text-secondary)]">
          {t('settings.shortcuts.desc', 'Increase your productivity by executing commands instantly using keyboard combinations')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortcutList.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 text-xs"
            >
              <span className="font-semibold text-[var(--color-text-secondary)]">{item.label}</span>
              <div className="flex items-center gap-1">
                {item.modifier !== 'none' && (
                  <>
                    <kbd className="px-2 py-1 rounded bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] shadow-xs font-mono font-bold text-[10px] uppercase text-[var(--color-text-primary)] flex items-center gap-0.5 select-none">
                      {item.modifier === 'ctrl' ? (
                        <>
                          <Command className="w-2.5 h-2.5" />
                          <span>Ctrl</span>
                        </>
                      ) : (
                        item.modifier
                      )}
                    </kbd>
                    <span className="text-[var(--color-text-tertiary)] font-bold">+</span>
                  </>
                )}
                <kbd className="px-2 py-1 rounded bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] shadow-xs font-mono font-bold text-[10px] uppercase text-[var(--color-text-primary)] select-none">
                  {item.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
