import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from '@/app/router'
import { useTheme } from '@/hooks/use-theme'
import { useSettingsStore } from '@/store/settings-store'
import { useFontLoader } from '@/hooks/use-font-loader'
import { SUPPORTED_LANGUAGES } from '@/types'
import { FloatingAudioPlayer } from '@/components/audio/FloatingAudioPlayer'
import { CanvasWallpaper } from '@/components/ui/canvas-wallpaper'
import { generateColorTheme } from '@/lib/color-generator'
import '@/features/i18n/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    const customizer = settings.themeCustomizer

    // Generate and apply dynamic theme variables
    const isDarkTheme = settings.theme === 'dark'
    const primary = customizer?.primaryColor || (isDarkTheme ? '#ffffff' : '#000000')
    const secondary = customizer?.secondaryColor || (isDarkTheme ? '#a1a1aa' : '#52525b')

    const themeVariables = generateColorTheme(primary, secondary, isDarkTheme)
    Object.entries(themeVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val)
    })

    // Apply Border Radius
    root.setAttribute('data-radius', customizer?.borderRadius || 'organic')

    // Apply Spacing/Density Padding
    const densityMap: Record<string, string> = {
      comfortable: '16px',
      compact: '8px',
    }
    const customDensity = customizer?.density || 'comfortable'
    root.style.setProperty('--density-padding', densityMap[customDensity] || '16px')

    // Apply Glass Intensity Blur
    const blurMap: Record<string, string> = {
      none: '0px',
      low: '4px',
      medium: '12px',
      high: '24px',
      ultra: '48px',
    }
    const customBlur = customizer?.backgroundBlur || 'medium'
    root.style.setProperty('--glass-blur', blurMap[customBlur] || '12px')

    // Apply Glass Opacity (Glass Effect Intensity)
    const glassOpacityMap: Record<string, string> = {
      none: '1.0',
      low: '0.95',
      medium: '0.8',
      high: '0.55',
    }
    const customGlassOpacity = customizer?.glassIntensity || 'medium'
    root.style.setProperty('--glass-opacity', glassOpacityMap[customGlassOpacity] || '0.8')

    // Apply Sidebar Width
    const sidebarWidthMap: Record<string, string> = {
      narrow: '220px',
      standard: '260px',
      wide: '300px',
    }
    const customSidebarWidth = customizer?.sidebarWidth || 'standard'
    root.style.setProperty('--sidebar-width', sidebarWidthMap[customSidebarWidth] || '260px')

    // Apply Animation Speed
    const speedMap: Record<string, string> = {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      relaxed: '800ms',
    }
    const factorMap: Record<string, string> = {
      instant: '0',
      fast: '0.5',
      normal: '1.0',
      slow: '1.65',
      relaxed: '2.65',
    }
    const customSpeed = customizer?.animationSpeed || 'normal'
    root.style.setProperty('--transition-speed', speedMap[customSpeed] || '300ms')
    root.style.setProperty('--animation-factor', factorMap[customSpeed] || '1.0')

    // Set Custom Attributes
    root.setAttribute('data-pattern', customizer?.backgroundPattern || 'none')
    root.setAttribute('data-wallpaper', customizer?.customWallpaper || 'solar-flare')
    root.setAttribute('data-preset', 'custom')
  }, [settings])

  useFontLoader()
  useTheme()
  return <>{children}</>
}

function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { uiLanguage } = useSettingsStore()

  useEffect(() => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === uiLanguage)
    const direction = lang?.direction || 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = uiLanguage
  }, [uiLanguage])

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DirectionProvider>
          <CanvasWallpaper />
          <RouterProvider router={router} />
          <FloatingAudioPlayer />
        </DirectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
