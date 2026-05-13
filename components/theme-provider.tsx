"use client"

import * as React from "react"

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  disableTransitionOnChange = false,
  enableSystem = true,
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("light")

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (typeof window === "undefined") return

      const resolvedTheme =
        nextTheme === "system" && enableSystem ? getSystemTheme() : nextTheme

      if (resolvedTheme === "system") return

      const restoreTransitions = disableTransitionOnChange
        ? disableTransitions()
        : undefined
      const root = document.documentElement

      if (attribute === "class") {
        root.classList.remove("light", "dark")
        root.classList.add(resolvedTheme)
      } else {
        root.setAttribute(attribute, resolvedTheme)
      }

      root.style.colorScheme = resolvedTheme
      restoreTransitions?.()
    },
    [attribute, disableTransitionOnChange, enableSystem],
  )

  React.useEffect(() => {
    const storedTheme = getStoredTheme(storageKey)
    const nextTheme = storedTheme ?? defaultTheme

    setThemeState(nextTheme)
    setSystemTheme(getSystemTheme())
    applyTheme(nextTheme)
  }, [applyTheme, defaultTheme, storageKey])

  React.useEffect(() => {
    if (!enableSystem || typeof window === "undefined") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const syncSystemTheme = () => {
      const nextSystemTheme = getSystemTheme(media)
      setSystemTheme(nextSystemTheme)

      if (theme === "system") {
        applyTheme("system")
      }
    }

    media.addEventListener("change", syncSystemTheme)
    return () => media.removeEventListener("change", syncSystemTheme)
  }, [applyTheme, enableSystem, theme])

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== storageKey) return

      const nextTheme = getStoredTheme(storageKey) ?? defaultTheme
      setThemeState(nextTheme)
      applyTheme(nextTheme)
    }

    window.addEventListener("storage", syncStoredTheme)
    return () => window.removeEventListener("storage", syncStoredTheme)
  }, [applyTheme, defaultTheme, storageKey])

  const setTheme = React.useCallback(
    (value: Theme | ((theme: Theme) => Theme)) => {
      setThemeState((currentTheme) => {
        const nextTheme = typeof value === "function" ? value(currentTheme) : value

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(storageKey, nextTheme)
          } catch {}
        }

        applyTheme(nextTheme)
        return nextTheme
      })
    },
    [applyTheme, storageKey],
  )

  const contextValue = React.useMemo<ThemeProviderState>(
    () => ({
      forcedTheme: undefined,
      resolvedTheme: theme === "system" ? systemTheme : theme,
      setTheme,
      systemTheme,
      theme,
      themes: enableSystem ? ["light", "dark", "system"] : ["light", "dark"],
    }),
    [enableSystem, setTheme, systemTheme, theme],
  )

  return (
    <ThemeProviderContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: "class" | `data-${string}`
  defaultTheme?: Theme
  disableTransitionOnChange?: boolean
  enableSystem?: boolean
  storageKey?: string
}>

type ThemeProviderState = {
  forcedTheme?: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme | ((theme: Theme) => Theme)) => void
  systemTheme: ResolvedTheme
  theme: Theme
  themes: Theme[]
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined,
)

export function useTheme(): ThemeProviderState {
  const context = React.useContext(ThemeProviderContext)

  if (!context) {
    return {
      forcedTheme: undefined,
      resolvedTheme: "light" as const,
      setTheme: () => {},
      systemTheme: "light" as const,
      theme: "system" as const,
      themes: ["light", "dark", "system"] as Theme[],
    }
  }

  return context
}

function getStoredTheme(storageKey: string) {
  if (typeof window === "undefined") return null

  try {
    const theme = window.localStorage.getItem(storageKey)
    return theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : null
  } catch {
    return null
  }
}

function getSystemTheme(
  media = window.matchMedia("(prefers-color-scheme: dark)"),
): ResolvedTheme {
  return media.matches ? "dark" : "light"
}

function disableTransitions() {
  const css = document.createElement("style")
  css.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important}",
    ),
  )
  document.head.appendChild(css)

  return () => {
    window.getComputedStyle(document.body)
    setTimeout(() => {
      document.head.removeChild(css)
    }, 1)
  }
}
