import type { CleaningStepType } from '../core'

export type RenderedLanguage = 'r'

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
}
