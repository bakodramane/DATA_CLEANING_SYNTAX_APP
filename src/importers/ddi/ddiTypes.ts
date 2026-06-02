import type { VariableValue } from '../../core'

export interface DdiImportOptions {
  sourceName?: string
  preferredLanguage?: string
  inferMissingCodes?: boolean
  preserveUnsupportedXml?: boolean
}

export interface XmlElementNode {
  tagName: string
  attributes: Record<string, string>
  children: Array<XmlElementNode | XmlTextNode>
}

export interface XmlTextNode {
  text: string
}

export interface DdiCategoryMetadata {
  value?: VariableValue
  label?: string
  explicitMissing: boolean
  inferredMissing: boolean
  rawText: string
}

export interface DdiVariableMetadata {
  ddiId?: string
  originalName?: string
  name: string
  label?: string
  description?: string
  questionText?: string
  universe?: string
  notes: string[]
  groupLabels: string[]
}
