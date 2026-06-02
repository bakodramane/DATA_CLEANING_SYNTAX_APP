import {
  DEFAULT_ACTIONS,
  TARGET_LANGUAGES,
  VARIABLE_ROLES,
  VARIABLE_TYPES,
  validateCleaningPlan,
  type CleaningPlan,
  type CleaningStep,
  type CleaningStepType,
  type RendererCapabilityMatrix,
  type SurveyVariable,
  type TargetLanguage,
  type ValidationResult,
} from '../../core'
import {
  parseCsvDictionary,
  parseDdiXmlDictionary,
  parseExcelDictionary,
  type DictionaryImportResult,
} from '../../importers'
import {
  renderPythonScript,
  renderRScript,
  renderSpssScript,
  renderStataDoFile,
  type RenderedScript,
} from '../../renderers'
import {
  createCleaningStepsFromRules,
  createPlanLevelCleaningStep,
  getBlockedRules,
  getRecommendedPlanRules,
  getRecommendedRules,
  loadDefaultCitations,
  loadDefaultRules,
  type CleaningRule,
  type RuleEngineContext,
} from '../../rules'
import { demoHouseholdDictionaryCsv } from './demoDictionary'
import type {
  DownloadArtifact,
  ProjectMetadata,
  RenderedScriptsByLanguage,
  RuleReviewItem,
  SelectedRuleIdsByVariable,
  WorkflowStep,
} from './workflowTypes'

export const workflowSteps: WorkflowStep[] = [
  { id: 'project', label: 'Project' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'variables', label: 'Variables' },
  { id: 'rules', label: 'Rules' },
  { id: 'plan', label: 'Cleaning Plan' },
  { id: 'syntax', label: 'Syntax' },
  { id: 'export', label: 'Export' },
]

export const languageLabels: Record<TargetLanguage, string> = {
  spss18: 'SPSS v18',
  stata14: 'Stata v14',
  r: 'R',
  python: 'Python',
}

export const scriptExtensions: Record<TargetLanguage, string> = {
  spss18: 'sps',
  stata14: 'do',
  r: 'R',
  python: 'py',
}

export const supportedVariableTypes = VARIABLE_TYPES
export const supportedVariableRoles = VARIABLE_ROLES
export const supportedDefaultActions = DEFAULT_ACTIONS

export function createInitialProjectMetadata(): ProjectMetadata {
  return {
    surveyName: 'Household survey cleaning project',
    countryOrOrganisation: '',
    surveyYear: '',
    notes: '',
    targetLanguages: [...TARGET_LANGUAGES],
  }
}

export function importDemoDictionary(): DictionaryImportResult {
  return importCsvDictionaryText(
    demoHouseholdDictionaryCsv,
    'demo household dictionary',
  )
}

export function importCsvDictionaryText(
  csvText: string,
  sourceName = 'pasted CSV dictionary',
): DictionaryImportResult {
  return parseCsvDictionary(csvText, { sourceName })
}

export function importExcelDictionaryBytes(
  bytes: ArrayBuffer | Uint8Array,
  sourceName = 'uploaded Excel dictionary',
): DictionaryImportResult {
  return parseExcelDictionary(bytes, { sourceName })
}

export function importDdiXmlDictionaryText(
  xmlText: string,
  sourceName = 'uploaded DDI XML dictionary',
): DictionaryImportResult {
  return parseDdiXmlDictionary(xmlText, { sourceName })
}

export function updateVariableTypeRole(
  variables: SurveyVariable[],
  variableName: string,
  patch: Partial<Pick<SurveyVariable, 'type' | 'role'>>,
): SurveyVariable[] {
  return variables.map((variable) =>
    variable.name === variableName
      ? {
          ...variable,
          type: patch.type ?? variable.type,
          role: patch.role ?? variable.role,
          sourceMetadata: {
            ...variable.sourceMetadata,
            notes: [
              ...(variable.sourceMetadata?.notes ?? []),
              `User correction: type=${patch.type ?? variable.type}; role=${patch.role ?? variable.role}`,
            ],
          },
        }
      : variable,
  )
}

export function buildRuleEngineContext(
  project: ProjectMetadata,
): RuleEngineContext {
  return {
    surveyName: project.surveyName,
    targetLanguages: project.targetLanguages,
    strictnessLevel: 'standard',
    imputationAllowed: true,
    availableAuxiliaryVariables: [],
  }
}

export function getRuleReviewItems(
  variables: SurveyVariable[],
  context: RuleEngineContext,
  selectedRuleIdsByVariable: SelectedRuleIdsByVariable = {},
): RuleReviewItem[] {
  return variables.map((variable) => {
    const recommendedRules = getRecommendedRules(variable, context)
    const selectedRuleIds =
      selectedRuleIdsByVariable[variable.name] ??
      recommendedRules.map((rule) => rule.id)

    return {
      variable,
      recommendedRules,
      selectedRuleIds,
      blockedRules: getBlockedRules(variable, context),
    }
  })
}

export function createDefaultSelectedRuleIds(
  variables: SurveyVariable[],
  context: RuleEngineContext,
): SelectedRuleIdsByVariable {
  return Object.fromEntries(
    getRuleReviewItems(variables, context).map((item) => [
      item.variable.name,
      item.recommendedRules.map((rule) => rule.id),
    ]),
  )
}

export function toggleSelectedRule(
  selectedRuleIdsByVariable: SelectedRuleIdsByVariable,
  variableName: string,
  ruleId: string,
  selected: boolean,
): SelectedRuleIdsByVariable {
  const currentRuleIds = selectedRuleIdsByVariable[variableName] ?? []
  const nextRuleIds = selected
    ? unique([...currentRuleIds, ruleId])
    : currentRuleIds.filter((currentRuleId) => currentRuleId !== ruleId)

  return {
    ...selectedRuleIdsByVariable,
    [variableName]: nextRuleIds,
  }
}

export function createCleaningPlanFromSelectedRules(
  project: ProjectMetadata,
  variables: SurveyVariable[],
  selectedRuleIdsByVariable: SelectedRuleIdsByVariable,
  context: RuleEngineContext,
): CleaningPlan {
  const rules = loadDefaultRules()
  const ruleById = new Map(rules.map((rule) => [rule.id, rule]))
  const variableSteps = variables.flatMap((variable) => {
    const selectedRules = (selectedRuleIdsByVariable[variable.name] ?? [])
      .map((ruleId) => ruleById.get(ruleId))
      .filter((rule): rule is CleaningRule => Boolean(rule))

    return createCleaningStepsFromRules(variable, selectedRules, context)
  })
  const planRules = getRecommendedPlanRules(rules, context)
  const planSteps = planRules.map((rule) =>
    createPlanLevelCleaningStep(rule, variables),
  )
  const steps = dedupeSteps([...variableSteps, ...planSteps])
  const citationKeys = unique(steps.flatMap((step) => step.citationKeys))
  const usedRuleIds = new Set(
    steps
      .map((step) => step.parameters.ruleId)
      .filter((ruleId): ruleId is string => typeof ruleId === 'string'),
  )
  const usedRules = rules.filter((rule) => usedRuleIds.has(rule.id))

  return {
    id: `${slugify(project.surveyName || 'cleaning-plan')}-wizard-plan`,
    metadata: {
      title: project.surveyName || 'Draft survey cleaning plan',
      description: buildPlanDescription(project),
      createdAt: new Date().toISOString(),
      version: '0.1.0',
      assumptions: [
        'This plan was generated from imported metadata and selected rule-library recommendations.',
        'Generated syntax should be reviewed before production use.',
        'The application proposes checks and syntax only; it does not execute cleaning.',
      ],
    },
    variables,
    steps,
    citations: loadDefaultCitations().filter((citation) =>
      citationKeys.includes(citation.key),
    ),
    capabilityMatrix: buildCapabilityMatrix(usedRules),
    notes: project.notes ? [project.notes] : [],
  }
}

export function validatePlanForPreview(
  plan: CleaningPlan | undefined,
): ValidationResult | undefined {
  return plan ? validateCleaningPlan(plan) : undefined
}

export function renderScriptsForPlan(
  plan: CleaningPlan,
  targetLanguages: TargetLanguage[],
): RenderedScriptsByLanguage {
  return Object.fromEntries(
    targetLanguages.map((language) => [language, renderScript(plan, language)]),
  )
}

export function createDownloadArtifacts(
  project: ProjectMetadata,
  variables: SurveyVariable[],
  plan: CleaningPlan | undefined,
  validation: ValidationResult | undefined,
  renderedScripts: RenderedScriptsByLanguage,
): DownloadArtifact[] {
  const artifacts: DownloadArtifact[] = []
  const projectSlug = slugify(project.surveyName || 'cleaning-plan')

  if (!plan) {
    return artifacts
  }

  artifacts.push({
    id: 'cleaning-plan-json',
    label: 'Cleaning Plan JSON',
    filename: `${projectSlug}-cleaning-plan.json`,
    mimeType: 'application/json',
    content: `${JSON.stringify(plan, null, 2)}\n`,
  })

  artifacts.push({
    id: 'summary-report',
    label: 'Plain-language summary report',
    filename: `${projectSlug}-summary.md`,
    mimeType: 'text/markdown',
    content: createSummaryReport(project, variables, plan, validation),
  })

  if (validation?.valid) {
    Object.entries(renderedScripts).forEach(([language, script]) => {
      if (!script) {
        return
      }

      artifacts.push({
        id: `${language}-script`,
        label: `${languageLabels[language as TargetLanguage]} script`,
        filename: script.filename,
        mimeType: 'text/plain',
        content: script.content,
      })
    })
  }

  return artifacts
}

export function createSummaryReport(
  project: ProjectMetadata,
  variables: SurveyVariable[],
  plan: CleaningPlan | undefined,
  validation: ValidationResult | undefined,
): string {
  const stepLines =
    plan?.steps.map(
      (step, index) =>
        `${index + 1}. ${step.id} (${step.type}) - ${step.variables.join(', ')}`,
    ) ?? []
  const warningLines = [
    ...(validation?.issues.map((issue) => `- ${issue.message}`) ?? []),
    ...(plan?.steps.flatMap((step) =>
      ruleWarningsFromStep(step).map(
        (warning) => `- ${step.id}: ${warning.message}`,
      ),
    ) ?? []),
  ]
  const citationKeys = unique(
    plan?.citations.map((citation) => citation.key) ?? [],
  )

  return [
    `# ${project.surveyName || 'Cleaning Plan Summary'}`,
    '',
    `Country or organisation: ${project.countryOrOrganisation || 'Not provided'}`,
    `Survey year: ${project.surveyYear || 'Not provided'}`,
    `Imported variables: ${variables.length}`,
    `Selected cleaning steps: ${plan?.steps.length ?? 0}`,
    '',
    '## Generated Cleaning Steps',
    ...(stepLines.length > 0
      ? stepLines
      : ['No cleaning steps generated yet.']),
    '',
    '## Warnings',
    ...(warningLines.length > 0
      ? warningLines
      : ['No validation warnings were reported.']),
    '',
    '## Citation Keys',
    citationKeys.length > 0 ? citationKeys.join(', ') : 'None',
    '',
    'Generated syntax must be reviewed before production use.',
    '',
  ].join('\n')
}

export function formatValidationMessages(
  validation: ValidationResult | undefined,
): string[] {
  if (!validation) {
    return []
  }

  return validation.issues.map((issue) => issue.message)
}

export function summarizeValueLabels(variable: SurveyVariable): string {
  const labels = variable.valueLabels ?? []

  if (labels.length === 0) {
    return 'None'
  }

  return labels
    .slice(0, 3)
    .map((label) => `${String(label.value)} = ${label.label}`)
    .concat(labels.length > 3 ? [`${labels.length - 3} more`] : [])
    .join('; ')
}

export function summarizeMissingCodes(variable: SurveyVariable): string {
  const codes = variable.declaredMissingCodes ?? []

  if (codes.length === 0) {
    return 'None'
  }

  return codes.map((code) => `${String(code.value)} = ${code.label}`).join('; ')
}

export function summarizeValidRange(variable: SurveyVariable): string {
  if (!variable.validRange) {
    return 'None'
  }

  const min = variable.validRange.min ?? 'no minimum'
  const max = variable.validRange.max ?? 'no maximum'
  return `${String(min)} to ${String(max)}`
}

export function detectionNotes(variable: SurveyVariable): string {
  return (
    variable.sourceMetadata?.notes?.join(' ') ?? 'No detection notes recorded.'
  )
}

function renderScript(
  plan: CleaningPlan,
  language: TargetLanguage,
): RenderedScript {
  switch (language) {
    case 'spss18':
      return renderSpssScript(plan)
    case 'stata14':
      return renderStataDoFile(plan)
    case 'r':
      return renderRScript(plan)
    case 'python':
      return renderPythonScript(plan)
    default:
      return renderRScript(plan)
  }
}

function buildPlanDescription(project: ProjectMetadata): string {
  const detail = [project.countryOrOrganisation, project.surveyYear].filter(
    Boolean,
  )

  return detail.length > 0
    ? `Draft metadata-driven Cleaning Plan for ${detail.join(', ')}.`
    : 'Draft metadata-driven Cleaning Plan.'
}

function buildCapabilityMatrix(
  rules: CleaningRule[],
): RendererCapabilityMatrix<CleaningStepType> {
  const matrix: RendererCapabilityMatrix<CleaningStepType> = {}

  rules.forEach((rule) => {
    if (!rule.rendererSupport) {
      return
    }

    matrix[rule.generatedStepType] = {
      ...(matrix[rule.generatedStepType] ?? {}),
      ...rule.rendererSupport,
    }
  })

  return matrix
}

function ruleWarningsFromStep(step: CleaningStep): Array<{ message: string }> {
  const ruleWarnings = step.parameters.ruleWarnings

  return Array.isArray(ruleWarnings)
    ? ruleWarnings.filter(
        (warning): warning is { message: string } =>
          typeof warning === 'object' &&
          warning !== null &&
          'message' in warning &&
          typeof warning.message === 'string',
      )
    : []
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cleaning-plan'
  )
}

function dedupeSteps(steps: CleaningStep[]): CleaningStep[] {
  const seenIds = new Set<string>()

  return steps.filter((step) => {
    if (seenIds.has(step.id)) {
      return false
    }

    seenIds.add(step.id)
    return true
  })
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
