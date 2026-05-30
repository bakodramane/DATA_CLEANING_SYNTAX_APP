import type { CleaningStep, CleaningStepType } from './cleaning-step'
import type {
  Citation,
  RendererCapabilityMatrix,
  SurveyVariable,
} from '../models'

export interface CleaningPlanMetadata {
  title: string
  description?: string
  createdAt: string
  updatedAt?: string
  version: string
  assumptions: string[]
}

export interface CleaningPlan {
  id: string
  metadata: CleaningPlanMetadata
  variables: SurveyVariable[]
  steps: CleaningStep[]
  citations: Citation[]
  capabilityMatrix: RendererCapabilityMatrix<CleaningStepType>
  notes?: string[]
}
