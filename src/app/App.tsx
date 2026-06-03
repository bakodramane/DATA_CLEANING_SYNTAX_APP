import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import './App.css'
import type { Translator } from '../i18n'
import { useI18n } from '../i18n/useI18n'
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
  importDdiXmlDictionaryText,
  importDemoDictionary,
  importExcelDictionaryBytes,
  importSpssSavMetadataBytes,
  importStataDtaMetadataBytes,
  renderScriptsForPlan,
  toggleSelectedRule,
  updateVariableTypeRole,
  validatePlanForPreview,
  workflowSteps,
} from './state/appState'
import type {
  ManualVariableFormValues,
  ManualVariableSaveResult,
} from './state/manualEntry'
import { removeManualVariable, saveManualVariable } from './state/manualEntry'
import type {
  ImportState,
  ProjectMetadata,
  WorkflowStepId,
} from './state/workflowTypes'
import type { SurveyVariable } from '../core'

function App() {
  const { language, t } = useI18n()
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
        language,
      ),
    [cleaningPlan, language, project, renderedScripts, validation, variables],
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
      const fileName = file.name.toLowerCase()
      const result = fileName.endsWith('.xlsx')
        ? importExcelDictionaryBytes(await file.arrayBuffer(), file.name)
        : fileName.endsWith('.xml')
          ? importDdiXmlDictionaryText(await file.text(), file.name)
          : fileName.endsWith('.dta')
            ? importStataDtaMetadataBytes(await file.arrayBuffer(), file.name)
            : fileName.endsWith('.sav')
              ? importSpssSavMetadataBytes(await file.arrayBuffer(), file.name)
              : importCsvDictionaryText(await file.text(), file.name)

      acceptImportResult(result)
      if (result.variables.length > 0) {
        setActiveStep('variables')
      }
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

  const saveManualVariableInWorkflow = (
    formValues: ManualVariableFormValues,
    editingName?: string,
  ): ManualVariableSaveResult => {
    const result = saveManualVariable(variables, formValues, editingName)

    if (result.messages.length === 0) {
      setVariables(result.variables)
      setSelectedRuleIds(
        createDefaultSelectedRuleIds(result.variables, context),
      )
      setImportError('')
    }

    return result
  }

  const removeManualVariableFromWorkflow = (variableName: string) => {
    const nextVariables = removeManualVariable(variables, variableName)

    setVariables(nextVariables)
    setSelectedRuleIds(createDefaultSelectedRuleIds(nextVariables, context))
    setImportError('')
  }

  const continueWorkflow = () => {
    if (activeStep === 'metadata' && variables.length === 0) {
      setImportError(t('metadata.continueWithoutVariables'))
      return
    }

    setActiveStep(nextStep(activeStep))
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
    saveManualVariable: saveManualVariableInWorkflow,
    removeManualVariable: removeManualVariableFromWorkflow,
    ruleReviews,
    selectedRuleIds,
    setSelectedRuleIds,
    cleaningPlan,
    validation,
    renderedScripts,
    downloads,
    t,
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
          {t('common.back')}
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={continueWorkflow}
          disabled={activeStep === 'export'}
        >
          {t('common.continue')}
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
  saveManualVariable: (
    formValues: ManualVariableFormValues,
    editingName?: string,
  ) => ManualVariableSaveResult
  removeManualVariable: (variableName: string) => void
  ruleReviews: ReturnType<typeof getRuleReviewItems>
  selectedRuleIds: Record<string, string[]>
  setSelectedRuleIds: Dispatch<SetStateAction<Record<string, string[]>>>
  cleaningPlan:
    | ReturnType<typeof createCleaningPlanFromSelectedRules>
    | undefined
  validation: ReturnType<typeof validatePlanForPreview>
  renderedScripts: ReturnType<typeof renderScriptsForPlan>
  downloads: ReturnType<typeof createDownloadArtifacts>
  t: Translator
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
            variables={args.variables}
            onCsvTextChange={(csvText) =>
              args.setImportState((current) => ({ ...current, csvText }))
            }
            onImportCsv={args.importPastedCsv}
            onImportFile={args.importFile}
            onLoadDemo={args.loadDemo}
            onSaveManualVariable={args.saveManualVariable}
            onRemoveManualVariable={args.removeManualVariable}
          />
          <WarningList
            title={args.t('metadata.importError')}
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
