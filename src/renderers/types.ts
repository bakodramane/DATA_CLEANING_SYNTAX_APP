import type { CleaningStepType } from '../core'
import type { LanguageCode } from '../i18n/types'

export type RenderedLanguage = 'r' | 'spss18' | 'stata14' | 'python'

export interface UnsupportedRenderedStep {
  id: string
  type: CleaningStepType
  reason: string
}

export interface RenderedScript {
  language: RenderedLanguage
  filename: string
  content: string
  warnings: string[]
  unsupportedSteps: UnsupportedRenderedStep[]
}

export interface RenderOptions {
  dataFrameName?: string
  filename?: string
  generatedAt?: Date | string
  language?: LanguageCode
}
