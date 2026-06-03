import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'
import {
  LANGUAGE_CODES,
  type LanguageCode,
  type LanguageOption,
  type TranslationDictionary,
  type TranslationValues,
} from './types'

export const defaultLanguage: LanguageCode = 'en'

export const languageStorageKey = 'data-cleaning-syntax-app.language'

export const availableLanguages: LanguageOption[] = [
  { code: 'en', label: en['app.language.english'] },
  { code: 'fr', label: fr['app.language.french'] },
]

export const dictionaries: Record<LanguageCode, TranslationDictionary> = {
  en,
  fr,
}

export function isLanguageCode(value: string): value is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(value)
}

export function normaliseLanguage(value: string | null): LanguageCode {
  return value && isLanguageCode(value) ? value : defaultLanguage
}

export function translate(
  language: LanguageCode,
  key: string,
  values: TranslationValues = {},
): string {
  const template = dictionaries[language][key] ?? dictionaries.en[key] ?? key

  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  )
}

export function translateWithFallback(
  language: LanguageCode,
  key: string,
  fallback: string,
  values: TranslationValues = {},
): string {
  const dictionary = dictionaries[language]
  const template = dictionary[key] ?? dictionaries.en[key]

  if (!template) {
    return fallback
  }

  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  )
}

export function translateKnownMessage(
  language: LanguageCode,
  message: string,
): string {
  const knownMessages: Record<string, string> = {
    [en['message.manual.nameRequired']]: 'message.manual.nameRequired',
    [en['message.manual.invalidName']]: 'message.manual.invalidName',
    [en['message.manual.duplicateName']]: 'message.manual.duplicateName',
    [en['message.manual.typeRequired']]: 'message.manual.typeRequired',
    [en['message.manual.unsupportedType']]: 'message.manual.unsupportedType',
    [en['message.manual.unsupportedRole']]: 'message.manual.unsupportedRole',
    [en['message.manual.invalidRange']]: 'message.manual.invalidRange',
    [en['metadata.privacyWarning']]: 'metadata.privacyWarning',
    [en['message.packageFallback']]: 'message.packageFallback',
  }
  const key = knownMessages[message]

  return key ? translate(language, key) : message
}

export type {
  LanguageCode,
  LanguageOption,
  TranslationDictionary,
  TranslationValues,
  Translator,
} from './types'
export * from './ruleText'
