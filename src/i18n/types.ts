export const LANGUAGE_CODES = ['en', 'fr'] as const

export type LanguageCode = (typeof LANGUAGE_CODES)[number]

export interface LanguageOption {
  code: LanguageCode
  label: string
}

export type TranslationValues = Record<string, string | number>

export type TranslationDictionary = Record<string, string>

export type Translator = (key: string, values?: TranslationValues) => string
