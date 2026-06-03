import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultLanguage,
  languageStorageKey,
  normaliseLanguage,
  translate,
  translateWithFallback,
  type LanguageCode,
  type TranslationValues,
  type Translator,
} from './index'

interface I18nContextValue {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: Translator
  tf: (key: string, fallback: string, values?: TranslationValues) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(() =>
    typeof window === 'undefined'
      ? defaultLanguage
      : normaliseLanguage(window.localStorage.getItem(languageStorageKey)),
  )

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language)
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string, values?: TranslationValues) =>
        translate(language, key, values),
      tf: (key: string, fallback: string, values?: TranslationValues) =>
        translateWithFallback(language, key, fallback, values),
    }),
    [language],
  )

  return createElement(I18nContext.Provider, { value }, children)
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    return {
      language: defaultLanguage,
      setLanguage: () => undefined,
      t: (key: string, values?: TranslationValues) =>
        translate(defaultLanguage, key, values),
      tf: (key: string, fallback: string, values?: TranslationValues) =>
        translateWithFallback(defaultLanguage, key, fallback, values),
    }
  }

  return context
}
