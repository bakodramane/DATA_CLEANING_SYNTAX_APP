import type { BlockedRule, CleaningRule } from '../../rules'
import type { DictionaryImportResult } from '../../importers'
import type { RenderedScript } from '../../renderers'
import type {
  CleaningPlan,
  TargetLanguage,
  ValidationResult,
  SurveyVariable,
} from '../../core'

export const WORKFLOW_STEPS = [
  'project',
  'metadata',
  'variables',
  'rules',
  'plan',
  'syntax',
  'export',
] as const

export type WorkflowStepId = (typeof WORKFLOW_STEPS)[number]

export interface WorkflowStep {
  id: WorkflowStepId
  label: string
}

export interface ProjectMetadata {
  surveyName: string
  countryOrOrganisation: string
  surveyYear: string
  notes: string
  targetLanguages: TargetLanguage[]
}

export interface RuleReviewItem {
  variable: SurveyVariable
  recommendedRules: CleaningRule[]
  blockedRules: BlockedRule[]
  selectedRuleIds: string[]
}

export type SelectedRuleIdsByVariable = Record<string, string[]>

export type RenderedScriptsByLanguage = Partial<
  Record<TargetLanguage, RenderedScript>
>

export interface WorkflowOutputs {
  ruleReviews: RuleReviewItem[]
  cleaningPlan?: CleaningPlan
  validation?: ValidationResult
  renderedScripts: RenderedScriptsByLanguage
  downloads: DownloadArtifact[]
}

export interface DownloadArtifact {
  id: string
  label: string
  filename: string
  mimeType: string
  content: string
}

export interface ImportState {
  csvText: string
  result?: DictionaryImportResult
}
