export const TARGET_LANGUAGES = ['spss18', 'stata14', 'r', 'python'] as const

export type TargetLanguage = (typeof TARGET_LANGUAGES)[number]

export const SUPPORT_STATUSES = [
  'supported',
  'partially_supported',
  'unsupported',
] as const

export type SupportStatus = (typeof SUPPORT_STATUSES)[number]

export interface RendererCapability {
  status: SupportStatus
  note?: string
}

export type RendererSupportByLanguage = Partial<
  Record<TargetLanguage, RendererCapability>
>

export type RendererCapabilityMatrix<TStepType extends string = string> =
  Partial<Record<TStepType, RendererSupportByLanguage>>

export function getRendererSupport<TStepType extends string>(
  matrix: RendererCapabilityMatrix<TStepType> | undefined,
  stepType: TStepType,
  language: TargetLanguage,
): RendererCapability | undefined {
  return matrix?.[stepType]?.[language]
}

export function recordsRendererSupport<TStepType extends string>(
  matrix: RendererCapabilityMatrix<TStepType> | undefined,
  stepType: TStepType,
  language: TargetLanguage,
): boolean {
  return getRendererSupport(matrix, stepType, language) !== undefined
}
