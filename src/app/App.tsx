import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import './App.css'
import { CleaningPlanPreviewStep } from './components/CleaningPlanPreviewStep'
import { ExportStep } from './components/ExportStep'
import { Layout } from './components/Layout'
import { MetadataInputStep } from './components/MetadataInputStep'
import { ProjectInfoStep } from './components/ProjectInfoStep'
import { RuleReviewStep } from './components/RuleReviewStep'
import { SyntaxPreviewStep } from './components/SyntaxPreviewStep'
import { VariableReviewStep } from './components/VariableReviewStep'
import { WarningList } from './components/WarningList'
import {
  buildRuleEngineContext,
  createCleaningPlanFromSelectedRules,
  createDefaultSelectedRuleIds,
  createDownloadArtifacts,
  createInitialProjectMetadata,
  getRuleReviewItems,
  importCsvDictionaryText,
  importDemoDictionary,
  importExcelDictionaryBytes,
  renderScriptsForPlan,
  toggleSelectedRule,
  updateVariableTypeRole,
  validatePlanForPreview,
  workflowSteps,
} from './state/appState'
import type {
  ImportState,
  ProjectMetadata,
  WorkflowStepId,
} from './state/workflowTypes'
import type { SurveyVariable } from '../core'

function App() {
  const [activeStep, setActiveStep] = useState<WorkflowStepId>('project')
  const [project, setProject] = useState<ProjectMetadata>(
    createInitialProjectMetadata,
  )
  const [importState, setImportState] = useState<ImportState>({ csvText: '' })
  const [variables, setVariables] = useState<SurveyVariable[]>([])
  const [selectedRuleIds, setSelectedRuleIds] = useState<
    Record<string, string[]>
  >({})
  const [importError, setImportError] = useState('')
  const context = useMemo(() => buildRuleEngineContext(project), [project])
  const ruleReviews = useMemo(
    () => getRuleReviewItems(variables, context, selectedRuleIds),
    [context, selectedRuleIds, variables],
  )
  const cleaningPlan = useMemo(
    () =>
      variables.length > 0
        ? createCleaningPlanFromSelectedRules(
            project,
            variables,
            selectedRuleIds,
            context,
          )
        : undefined,
    [context, project, selectedRuleIds, variables],
  )
  const validation = useMemo(
    () => validatePlanForPreview(cleaningPlan),
    [cleaningPlan],
  )
  const renderedScripts = useMemo(
    () =>
      cleaningPlan && validation?.valid
        ? renderScriptsForPlan(cleaningPlan, project.targetLanguages)
        : {},
    [cleaningPlan, project.targetLanguages, validation?.valid],
  )
  const downloads = useMemo(
    () =>
      createDownloadArtifacts(
        project,
        variables,
        cleaningPlan,
        validation,
        renderedScripts,
      ),
    [cleaningPlan, project, renderedScripts, validation, variables],
  )
  const completedSteps = completedWorkflowSteps(
    variables,
    cleaningPlan,
    validation?.valid === true,
    downloads.length,
  )

  const acceptImportResult = (result: NonNullable<ImportState['result']>) => {
    setImportState((current) => ({ ...current, result }))
    setVariables(result.variables)
    setSelectedRuleIds(createDefaultSelectedRuleIds(result.variables, context))
    setImportError('')
  }

  const importPastedCsv = () => {
    try {
      acceptImportResult(importCsvDictionaryText(importState.csvText))
      setActiveStep('variables')
    } catch (error) {
      setImportError(readErrorMessage(error))
    }
  }

  const loadDemo = () => {
    const result = importDemoDictionary()

    setImportState({
      csvText: '',
      result,
    })
    setVariables(result.variables)
    setSelectedRuleIds(createDefaultSelectedRuleIds(result.variables, context))
    setImportError('')
    setActiveStep('variables')
  }

  const importFile = async (file: File) => {
    try {
      const isExcel = file.name.toLowerCase().endsWith('.xlsx')
      const result = isExcel
        ? importExcelDictionaryBytes(await file.arrayBuffer(), file.name)
        : importCsvDictionaryText(await file.text(), file.name)

      acceptImportResult(result)
      setActiveStep('variables')
    } catch (error) {
      setImportError(readErrorMessage(error))
    }
  }

  const correctVariable = (
    variableName: string,
    patch: Partial<Pick<SurveyVariable, 'type' | 'role'>>,
  ) => {
    const nextVariables = updateVariableTypeRole(variables, variableName, patch)

    setVariables(nextVariables)
    setSelectedRuleIds(createDefaultSelectedRuleIds(nextVariables, context))
  }

  const body = renderStepContent(activeStep, {
    project,
    setProject,
    importState,
    setImportState,
    importPastedCsv,
    importFile,
    loadDemo,
    importError,
    variables,
    correctVariable,
    ruleReviews,
    selectedRuleIds,
    setSelectedRuleIds,
    cleaningPlan,
    validation,
    renderedScripts,
    downloads,
  })

  return (
    <Layout
      activeStep={activeStep}
      completedSteps={completedSteps}
      steps={workflowSteps}
      onSelectStep={setActiveStep}
    >
      {body}
      <div className="step-navigation">
        <button
          className="secondary-button"
          type="button"
          onClick={() => setActiveStep(previousStep(activeStep))}
          disabled={activeStep === 'project'}
        >
          Back
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={() => setActiveStep(nextStep(activeStep))}
          disabled={activeStep === 'export'}
        >
          Continue
        </button>
      </div>
    </Layout>
  )
}

interface RenderStepArgs {
  project: ProjectMetadata
  setProject: (project: ProjectMetadata) => void
  importState: ImportState
  setImportState: Dispatch<SetStateAction<ImportState>>
  importPastedCsv: () => void
  importFile: (file: File) => Promise<void>
  loadDemo: () => void
  importError: string
  variables: SurveyVariable[]
  correctVariable: (
    variableName: string,
    patch: Partial<Pick<SurveyVariable, 'type' | 'role'>>,
  ) => void
  ruleReviews: ReturnType<typeof getRuleReviewItems>
  selectedRuleIds: Record<string, string[]>
  setSelectedRuleIds: Dispatch<SetStateAction<Record<string, string[]>>>
  cleaningPlan:
    | ReturnType<typeof createCleaningPlanFromSelectedRules>
    | undefined
  validation: ReturnType<typeof validatePlanForPreview>
  renderedScripts: ReturnType<typeof renderScriptsForPlan>
  downloads: ReturnType<typeof createDownloadArtifacts>
}

function renderStepContent(step: WorkflowStepId, args: RenderStepArgs) {
  switch (step) {
    case 'project':
      return (
        <ProjectInfoStep project={args.project} onChange={args.setProject} />
      )
    case 'metadata':
      return (
        <>
          <MetadataInputStep
            csvText={args.importState.csvText}
            importResult={args.importState.result}
            onCsvTextChange={(csvText) =>
              args.setImportState((current) => ({ ...current, csvText }))
            }
            onImportCsv={args.importPastedCsv}
            onImportFile={args.importFile}
            onLoadDemo={args.loadDemo}
          />
          <WarningList
            title="Import error"
            messages={args.importError ? [args.importError] : []}
          />
        </>
      )
    case 'variables':
      return (
        <VariableReviewStep
          variables={args.variables}
          onCorrectVariable={args.correctVariable}
        />
      )
    case 'rules':
      return (
        <RuleReviewStep
          items={args.ruleReviews}
          onToggleRule={(variableName, ruleId, selected) =>
            args.setSelectedRuleIds((current) =>
              toggleSelectedRule(current, variableName, ruleId, selected),
            )
          }
        />
      )
    case 'plan':
      return (
        <CleaningPlanPreviewStep
          plan={args.cleaningPlan}
          validation={args.validation}
        />
      )
    case 'syntax':
      return (
        <SyntaxPreviewStep
          targetLanguages={args.project.targetLanguages}
          renderedScripts={args.renderedScripts}
          validation={args.validation}
          downloads={args.downloads}
        />
      )
    case 'export':
      return (
        <ExportStep downloads={args.downloads} validation={args.validation} />
      )
    default:
      return null
  }
}

function completedWorkflowSteps(
  variables: SurveyVariable[],
  cleaningPlan: unknown,
  hasValidPlan: boolean,
  downloadCount: number,
): WorkflowStepId[] {
  return [
    'project',
    ...(variables.length > 0
      ? (['metadata', 'variables', 'rules'] as const)
      : []),
    ...(cleaningPlan ? (['plan'] as const) : []),
    ...(hasValidPlan ? (['syntax'] as const) : []),
    ...(downloadCount > 0 ? (['export'] as const) : []),
  ]
}

function nextStep(step: WorkflowStepId): WorkflowStepId {
  const index = workflowSteps.findIndex((candidate) => candidate.id === step)
  return workflowSteps[Math.min(index + 1, workflowSteps.length - 1)].id
}

function previousStep(step: WorkflowStepId): WorkflowStepId {
  const index = workflowSteps.findIndex((candidate) => candidate.id === step)
  return workflowSteps[Math.max(index - 1, 0)].id
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The metadata file could not be imported.'
}

export default App
