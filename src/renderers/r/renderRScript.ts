import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
  SurveyVariable,
  VariableValue,
} from '../../core'
import type {
  RenderedScript,
  RenderOptions,
  UnsupportedRenderedStep,
} from '../types'
import {
  findStepVariables,
  flagName,
  formatGeneratedAt,
  formatRCharacterVector,
  formatRValue,
  formatRVector,
  indexVariables,
  isContinuousOutlierVariable,
  makeFilename,
  methodForMice,
  naLiteralForVariable,
  normalizeMethodName,
  numberOrStringParameter,
  numberParameter,
  quoteRString,
  rVariableReference,
  stringArrayParameter,
  unique,
  variableValueArrayParameter,
} from './helpers'
import {
  renderPackageSection,
  renderStepComment,
  renderTitleBlock,
  renderUnsupportedStepComment,
  renderWarningComment,
} from './templates'

const SUPPORTED_R_STEP_TYPES = new Set<CleaningStepType>([
  'variable_label',
  'value_label',
  'missing_value_declaration',
  'range_check',
  'domain_check',
  'outlier_flag',
  'missingness_diagnosis',
  'imputation',
])

interface RenderContext {
  dataFrameName: string
  variablesByName: Map<string, SurveyVariable>
  warnings: string[]
  unsupportedSteps: UnsupportedRenderedStep[]
}

export function renderRScript(
  cleaningPlan: CleaningPlan,
  options: RenderOptions = {},
): RenderedScript {
  const dataFrameName = options.dataFrameName ?? 'data'
  const context: RenderContext = {
    dataFrameName,
    variablesByName: indexVariables(cleaningPlan.variables),
    warnings: [],
    unsupportedSteps: [],
  }

  const sections = [
    renderTitleBlock(cleaningPlan, formatGeneratedAt(options.generatedAt)),
    renderPackageSection(dataFrameName),
    ...cleaningPlan.steps.map((step) => renderStep(step, context)),
  ]

  return {
    language: 'r',
    filename: options.filename ?? makeFilename(cleaningPlan),
    content: `${sections.filter(Boolean).join('\n\n')}\n`,
    warnings: context.warnings,
    unsupportedSteps: context.unsupportedSteps,
  }
}

function renderStep(step: CleaningStep, context: RenderContext): string {
  if (!SUPPORTED_R_STEP_TYPES.has(step.type)) {
    return renderUnsupportedStep(step, context)
  }

  switch (step.type) {
    case 'variable_label':
      return renderVariableLabels(step, context)
    case 'value_label':
      return renderValueLabels(step, context)
    case 'missing_value_declaration':
      return renderMissingValueDeclarations(step, context)
    case 'range_check':
      return renderRangeCheck(step, context)
    case 'domain_check':
      return renderDomainCheck(step, context)
    case 'outlier_flag':
      return renderOutlierFlag(step, context)
    case 'missingness_diagnosis':
      return renderMissingnessDiagnosis(step, context)
    case 'imputation':
      return renderImputation(step, context)
    default:
      return renderUnsupportedStep(step, context)
  }
}

function renderUnsupportedStep(
  step: CleaningStep,
  context: RenderContext,
): string {
  const unsupportedStep = {
    id: step.id,
    type: step.type,
    reason: `Step type "${step.type}" is not yet supported by the Phase 2 R renderer.`,
  } satisfies UnsupportedRenderedStep

  context.unsupportedSteps.push(unsupportedStep)
  context.warnings.push(`Step "${step.id}": ${unsupportedStep.reason}`)

  return renderUnsupportedStepComment(step, unsupportedStep)
}

function renderVariableLabels(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    lines.push(
      `# Variable label: ${variable.name}`,
      `var_label(${rVariableReference(context.dataFrameName, variable.name)}) <- ${quoteRString(variable.label)}`,
    )
  })

  return lines.join('\n')
}

function renderValueLabels(step: CleaningStep, context: RenderContext): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    if (!variable.valueLabels || variable.valueLabels.length === 0) {
      const message = `Variable "${variable.name}" has no value labels to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(renderWarningComment(message))
      return
    }

    const labelPairs = variable.valueLabels
      .map(
        (label) =>
          `${quoteRString(label.label)} = ${formatRValue(label.value)}`,
      )
      .join(', ')

    lines.push(
      `# Value labels: ${variable.name}`,
      `val_labels(${rVariableReference(context.dataFrameName, variable.name)}) <- c(${labelPairs})`,
    )
  })

  return lines.join('\n')
}

function renderMissingValueDeclarations(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    const missingCodes = variable.declaredMissingCodes ?? []

    if (missingCodes.length === 0) {
      const message = `Variable "${variable.name}" has no declared missing codes to recode.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(renderWarningComment(message))
      return
    }

    const codes = missingCodes.map((missingCode) => missingCode.value)

    lines.push(
      `# Declared missing codes for ${variable.name}: ${codes.map(formatRValue).join(', ')}`,
      '# These are recoded to NA for R analysis. Review before running.',
      `${context.dataFrameName} <- ${context.dataFrameName} %>%`,
      '  mutate(',
      `    ${variable.name} = if_else(${variable.name} %in% ${formatRVector(codes)}, ${naLiteralForVariable(variable)}, ${variable.name})`,
      '  )',
    )
  })

  return lines.join('\n')
}

function renderRangeCheck(step: CleaningStep, context: RenderContext): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    const min = numberOrStringParameter(step, 'min') ?? variable.validRange?.min
    const max = numberOrStringParameter(step, 'max') ?? variable.validRange?.max
    const conditions = [
      min !== undefined ? `${variable.name} < ${formatRValue(min)}` : undefined,
      max !== undefined ? `${variable.name} > ${formatRValue(max)}` : undefined,
    ].filter((condition): condition is string => Boolean(condition))

    if (conditions.length === 0) {
      const message = `Range check "${step.id}" has no min or max for "${variable.name}".`
      context.warnings.push(message)
      lines.push(renderWarningComment(message))
      return
    }

    lines.push(
      `${context.dataFrameName} <- ${context.dataFrameName} %>%`,
      '  mutate(',
      `    ${flagName(variable, 'range')} = if_else(!is.na(${variable.name}) & (${conditions.join(' | ')}), 1L, 0L)`,
      '  )',
    )
  })

  return lines.join('\n')
}

function renderDomainCheck(step: CleaningStep, context: RenderContext): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    const allowedValues = allowedDomainValues(step, variable)

    if (allowedValues.length === 0) {
      const message = `Domain check "${step.id}" has no allowed values for "${variable.name}".`
      context.warnings.push(message)
      lines.push(renderWarningComment(message))
      return
    }

    lines.push(
      `${context.dataFrameName} <- ${context.dataFrameName} %>%`,
      '  mutate(',
      `    ${flagName(variable, 'domain')} = if_else(!is.na(${variable.name}) & !(${variable.name} %in% ${formatRVector(allowedValues)}), 1L, 0L)`,
      '  )',
    )
  })

  return lines.join('\n')
}

function renderOutlierFlag(step: CleaningStep, context: RenderContext): string {
  const variables = findStepVariables(step, context.variablesByName)
  const method = normalizeMethodName(step.parameters.method) ?? 'tukey'
  const lines = [renderStepComment(step)]

  variables.forEach((variable) => {
    if (!isContinuousOutlierVariable(variable)) {
      const message = `Outlier method "${method}" is only rendered for continuous or count variables; "${variable.name}" is ${variable.type}.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(renderWarningComment(message))
      return
    }

    if (method === 'mad' || method === 'mad_robust') {
      lines.push(...renderMadOutlierCode(step, variable, context.dataFrameName))
      return
    }

    if (method === 'tukey' || method === 'tukey_fences') {
      lines.push(
        ...renderTukeyOutlierCode(step, variable, context.dataFrameName),
      )
      return
    }

    const message = `Outlier method "${method}" is not supported by the Phase 2 R renderer.`
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(renderWarningComment(message))
  })

  return lines.join('\n')
}

function renderMissingnessDiagnosis(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const createIndicators =
    step.parameters.createIndicators === true ||
    step.parameters.createIndicatorVariables === true
  const lines = [renderStepComment(step)]

  const summaries = variables.map((variable) =>
    [
      '  data.frame(',
      `    variable = ${quoteRString(variable.name)},`,
      `    n_missing = sum(is.na(${rVariableReference(context.dataFrameName, variable.name)})),`,
      `    pct_missing = mean(is.na(${rVariableReference(context.dataFrameName, variable.name)})) * 100`,
      '  )',
    ].join('\n'),
  )

  lines.push(
    'missingness_summary <- bind_rows(',
    summaries.join(',\n'),
    ')',
    'print(missingness_summary)',
  )

  if (createIndicators) {
    lines.push(
      `${context.dataFrameName} <- ${context.dataFrameName} %>%`,
      '  mutate(',
      variables
        .map(
          (variable) =>
            `    missing_${variable.name} = if_else(is.na(${variable.name}), 1L, 0L)`,
        )
        .join(',\n'),
      '  )',
    )
  }

  return lines.join('\n')
}

function renderImputation(step: CleaningStep, context: RenderContext): string {
  const requestedVariables = findStepVariables(step, context.variablesByName)
  const lines = [
    renderStepComment(step),
    '# Multiple imputation requires careful methodological review.',
    '# This MVP uses mice() with simple default methods and does not automate model selection.',
    '# Structural missing values must be excluded before imputation.',
  ]

  if (step.parameters.includeStructuralMissing === true) {
    const message =
      'Structural missing values were requested for imputation and have been blocked.'
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(renderWarningComment(message))
  }

  const imputedVariables = requestedVariables.filter((variable) => {
    const isIdentifier =
      variable.type === 'identifier' || variable.role === 'identifier'

    if (isIdentifier) {
      const message = `Identifier variable "${variable.name}" was excluded from imputation.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(renderWarningComment(message))
    }

    return !isIdentifier && methodForMice(variable) !== ''
  })

  if (imputedVariables.length === 0) {
    const message = `Imputation step "${step.id}" has no variables that can be rendered for mice().`
    context.warnings.push(message)
    lines.push(renderWarningComment(message))
    return lines.join('\n')
  }

  const predictorVariables = defaultMicePredictors(
    context.variablesByName,
    step,
  )
  const imputationVariables = unique([
    ...imputedVariables.map((variable) => variable.name),
    ...predictorVariables,
  ])

  lines.push(
    `imputation_variables <- ${formatRCharacterVector(imputationVariables)}`,
    `imputation_data <- ${context.dataFrameName} %>% select(all_of(imputation_variables))`,
    '',
    'mice_methods <- mice::make.method(imputation_data)',
    'mice_methods[] <- ""',
    ...imputedVariables.map(
      (variable) =>
        `mice_methods[${quoteRString(variable.name)}] <- ${quoteRString(methodForMice(variable))}`,
    ),
    '',
    'set.seed(12345)',
    'mice_fit <- mice(imputation_data, m = 5, method = mice_methods, maxit = 10, seed = 12345)',
    'completed_data_example <- complete(mice_fit, action = 1)',
    '',
    '# Example analysis and pooling guidance, to be adapted by the analyst:',
    '# fit <- with(mice_fit, lm(outcome ~ income + age + sex))',
    '# pooled <- pool(fit)',
    '# summary(pooled)',
  )

  return lines.join('\n')
}

function allowedDomainValues(
  step: CleaningStep,
  variable: SurveyVariable,
): VariableValue[] {
  const explicitValues = variableValueArrayParameter(step, 'allowedValues')

  if (explicitValues.length > 0) {
    return explicitValues
  }

  return [
    ...(variable.valueLabels?.map((label) => label.value) ?? []),
    ...(variable.declaredMissingCodes?.map(
      (missingCode) => missingCode.value,
    ) ?? []),
  ]
}

function renderTukeyOutlierCode(
  step: CleaningStep,
  variable: SurveyVariable,
  dataFrameName: string,
): string[] {
  const multiplier = numberParameter(step, 'multiplier') ?? 1.5
  const reference = rVariableReference(dataFrameName, variable.name)

  return [
    `${variable.name}_q1 <- quantile(${reference}, 0.25, na.rm = TRUE)`,
    `${variable.name}_q3 <- quantile(${reference}, 0.75, na.rm = TRUE)`,
    `${variable.name}_iqr <- ${variable.name}_q3 - ${variable.name}_q1`,
    `${variable.name}_lower_tukey <- ${variable.name}_q1 - ${multiplier} * ${variable.name}_iqr`,
    `${variable.name}_upper_tukey <- ${variable.name}_q3 + ${multiplier} * ${variable.name}_iqr`,
    `${dataFrameName} <- ${dataFrameName} %>%`,
    '  mutate(',
    `    ${flagName(variable, 'outlier', 'tukey')} = if_else(!is.na(${variable.name}) & (${variable.name} < ${variable.name}_lower_tukey | ${variable.name} > ${variable.name}_upper_tukey), 1L, 0L)`,
    '  )',
  ]
}

function renderMadOutlierCode(
  step: CleaningStep,
  variable: SurveyVariable,
  dataFrameName: string,
): string[] {
  const threshold = numberParameter(step, 'threshold') ?? 3.5
  const reference = rVariableReference(dataFrameName, variable.name)

  return [
    `${variable.name}_median <- median(${reference}, na.rm = TRUE)`,
    `${variable.name}_mad <- mad(${reference}, constant = 1.4826, na.rm = TRUE)`,
    `${dataFrameName} <- ${dataFrameName} %>%`,
    '  mutate(',
    `    ${flagName(variable, 'outlier', 'mad')} = if_else(!is.na(${variable.name}) & ${variable.name}_mad > 0 & abs(${variable.name} - ${variable.name}_median) / ${variable.name}_mad > ${threshold}, 1L, 0L)`,
    '  )',
  ]
}

function defaultMicePredictors(
  variablesByName: Map<string, SurveyVariable>,
  step: CleaningStep,
): string[] {
  const explicitPredictors = stringArrayParameter(step, 'predictorVariables')

  if (explicitPredictors.length > 0) {
    return explicitPredictors
  }

  return [...variablesByName.values()]
    .filter(
      (variable) =>
        !['identifier', 'psu', 'stratum', 'metadata'].includes(variable.role) &&
        methodForMice(variable) !== '',
    )
    .map((variable) => variable.name)
}
