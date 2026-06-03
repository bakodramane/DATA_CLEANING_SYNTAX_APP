import type { CleaningPlan, CleaningStep, SurveyVariable } from '../../core'
import { rendererComment, rendererWarning, type LanguageCode } from '../../i18n'
import {
  allowedDomainValues,
  canImputeVariable,
  conditionParameter,
  createUnsupportedStep,
  defaultImputationPredictors,
  duplicateFlagName,
  findStepVariables,
  flagName,
  indexVariables,
  isContinuousOutlierVariable,
  isIdentifierVariable,
  missingIndicatorName,
  MVP_RENDERED_STEP_TYPES,
  normalizeMethodName,
  numberOrStringParameter,
  numberParameter,
  selectsStructuralMissing,
  skipPatternCondition,
  stepFlagName,
  structuralMissingCondition,
  translateConditionExpression,
  unique,
} from '../helpers'
import type {
  RenderedScript,
  RenderOptions,
  UnsupportedRenderedStep,
} from '../types'
import {
  formatPythonList,
  formatPythonValue,
  makePythonFilename,
  pythonComment,
  quotePythonString,
  renderPythonPackageSection,
  renderPythonStepComment,
  renderPythonTitleBlock,
} from './helpers'

interface RenderContext {
  dataFrameName: string
  variablesByName: Map<string, SurveyVariable>
  warnings: string[]
  unsupportedSteps: UnsupportedRenderedStep[]
  commentLanguage: LanguageCode
}

export function renderPythonScript(
  cleaningPlan: CleaningPlan,
  options: RenderOptions = {},
): RenderedScript {
  const dataFrameName = options.dataFrameName ?? 'data'
  const context: RenderContext = {
    dataFrameName,
    variablesByName: indexVariables(cleaningPlan.variables),
    warnings: [],
    unsupportedSteps: [],
    commentLanguage: options.language ?? 'en',
  }

  const sections = [
    renderPythonTitleBlock(
      cleaningPlan,
      options.generatedAt,
      context.commentLanguage,
    ),
    renderPythonPackageSection(dataFrameName, context.commentLanguage),
    ...cleaningPlan.steps.map((step) => renderStep(step, context)),
  ]

  return {
    language: 'python',
    filename: options.filename ?? makePythonFilename(cleaningPlan),
    content: `${sections.filter(Boolean).join('\n\n')}\n`,
    warnings: context.warnings,
    unsupportedSteps: context.unsupportedSteps,
  }
}

function renderStep(step: CleaningStep, context: RenderContext): string {
  if (!MVP_RENDERED_STEP_TYPES.has(step.type)) {
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
    case 'structural_missing_check':
      return renderStructuralMissingCheck(step, context)
    case 'skip_pattern_check':
      return renderSkipPatternCheck(step, context)
    case 'consistency_check':
      return renderConsistencyCheck(step, context)
    case 'duplicate_id_check':
      return renderDuplicateIdCheck(step, context)
    case 'outlier_flag':
      return renderOutlierFlag(step, context)
    case 'missingness_diagnosis':
      return renderMissingnessDiagnosis(step, context)
    case 'imputation':
      return renderImputation(step, context)
    case 'audit_log':
      return renderAuditLog(step, context)
    case 'summary_report':
      return renderSummaryReport(step, context)
    default:
      return renderUnsupportedStep(step, context)
  }
}

function renderUnsupportedStep(
  step: CleaningStep,
  context: RenderContext,
): string {
  const unsupportedStep = createUnsupportedStep(step, 'Python')
  context.unsupportedSteps.push(unsupportedStep)
  context.warnings.push(`Step "${step.id}": ${unsupportedStep.reason}`)

  return [
    renderPythonStepComment(step, context.commentLanguage),
    pythonComment(
      rendererWarning(context.commentLanguage, unsupportedStep.reason),
    ),
  ].join('\n')
}

function renderVariableLabels(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)

  return [
    renderPythonStepComment(step, context.commentLanguage),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonVariableLabels'),
    ),
    'variable_labels = globals().get("variable_labels", {})',
    'variable_labels.update({',
    ...variables.map(
      (variable) =>
        `    ${quotePythonString(variable.name)}: ${quotePythonString(variable.label)},`,
    ),
    '})',
  ].join('\n')
}

function renderValueLabels(step: CleaningStep, context: RenderContext): string {
  const lines = [
    renderPythonStepComment(step, context.commentLanguage),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonValueLabels'),
    ),
    'value_labels = globals().get("value_labels", {})',
    'value_labels.update({',
  ]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!variable.valueLabels || variable.valueLabels.length === 0) {
      const message = `Variable "${variable.name}" has no value labels to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(`    # ${rendererWarning(context.commentLanguage, message)}`)
      return
    }

    lines.push(`    ${quotePythonString(variable.name)}: {`)
    variable.valueLabels.forEach((label) => {
      lines.push(
        `        ${formatPythonValue(label.value)}: ${quotePythonString(label.label)},`,
      )
    })
    lines.push('    },')
  })

  lines.push('})')
  return lines.join('\n')
}

function renderMissingValueDeclarations(
  step: CleaningStep,
  context: RenderContext,
): string {
  const lines = [renderPythonStepComment(step, context.commentLanguage)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const missingCodes = variable.declaredMissingCodes ?? []

    if (missingCodes.length === 0) {
      const message = `Variable "${variable.name}" has no declared missing codes to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
      return
    }

    const values = missingCodes.map((missingCode) => missingCode.value)
    lines.push(
      pythonComment(
        rendererComment(
          context.commentLanguage,
          'comment.declaredMissingCodes',
          {
            variable: variable.name,
            values: values.map(formatPythonValue).join(', '),
          },
        ),
      ),
      pythonComment(
        rendererComment(
          context.commentLanguage,
          'comment.pythonRecodedMissing',
        ),
      ),
      `${context.dataFrameName}[${quotePythonString(variable.name)}] = ${context.dataFrameName}[${quotePythonString(variable.name)}].replace(${formatPythonList(values)}, np.nan)`,
    )
  })

  return lines.join('\n')
}

function renderRangeCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderPythonStepComment(step, context.commentLanguage)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const min = numberOrStringParameter(step, 'min') ?? variable.validRange?.min
    const max = numberOrStringParameter(step, 'max') ?? variable.validRange?.max
    const conditions = [
      min !== undefined
        ? `(${context.dataFrameName}[${quotePythonString(variable.name)}] < ${formatPythonValue(min)})`
        : undefined,
      max !== undefined
        ? `(${context.dataFrameName}[${quotePythonString(variable.name)}] > ${formatPythonValue(max)})`
        : undefined,
    ].filter((condition): condition is string => Boolean(condition))

    if (conditions.length === 0) {
      const message = `Range check "${step.id}" has no min or max for "${variable.name}".`
      context.warnings.push(message)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
      return
    }

    const series = `${context.dataFrameName}[${quotePythonString(variable.name)}]`
    lines.push(
      `${context.dataFrameName}[${quotePythonString(flagName(variable, 'range'))}] = np.where(`,
      `    ${series}.notna() & (${conditions.join(' | ')}),`,
      '    1,',
      '    0,',
      ')',
    )
  })

  return lines.join('\n')
}

function renderDomainCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderPythonStepComment(step, context.commentLanguage)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const allowedValues = allowedDomainValues(step, variable)

    if (allowedValues.length === 0) {
      const message = `Domain check "${step.id}" has no allowed values for "${variable.name}".`
      context.warnings.push(message)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
      return
    }

    const series = `${context.dataFrameName}[${quotePythonString(variable.name)}]`
    lines.push(
      `${context.dataFrameName}[${quotePythonString(flagName(variable, 'domain'))}] = np.where(`,
      `    ${series}.notna() & ~${series}.isin(${formatPythonList(allowedValues)}),`,
      '    1,',
      '    0,',
      ')',
    )
  })

  return lines.join('\n')
}

function renderOutlierFlag(step: CleaningStep, context: RenderContext): string {
  const method = normalizeMethodName(step.parameters.method) ?? 'tukey'
  const lines = [renderPythonStepComment(step, context.commentLanguage)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!isContinuousOutlierVariable(variable)) {
      const message = `Outlier method "${method}" is only rendered for continuous or count variables; "${variable.name}" is ${variable.type}.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
      return
    }

    if (method === 'mad' || method === 'mad_robust') {
      lines.push(...renderMadOutlier(step, variable, context.dataFrameName))
      return
    }

    if (method === 'tukey' || method === 'tukey_fences') {
      lines.push(...renderTukeyOutlier(step, variable, context.dataFrameName))
      return
    }

    const message = `Outlier method "${method}" is not supported by the current Python renderer; no deletion, capping, or winsorisation code was generated.`
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
  })

  return lines.join('\n')
}

function renderStructuralMissingCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const targetVariable = variables[0]
  const lines = [renderPythonStepComment(step, context.commentLanguage)]
  const partialMessage =
    'Python structural-missing checks are rendered as review flags only; values are not recoded or imputed.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(
    pythonComment(rendererWarning(context.commentLanguage, partialMessage)),
  )

  if (!targetVariable) {
    const message = `Structural-missing step "${step.id}" has no target variable to flag.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const condition = structuralMissingCondition(step, targetVariable)

  if (!condition) {
    const message = `Structural-missing step "${step.id}" has no condition; review the Cleaning Plan notes manually.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'python',
    context.dataFrameName,
  )

  lines.push(
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.structuralCondition', {
        condition,
      }),
    ),
    `${context.dataFrameName}[${quotePythonString(flagName(targetVariable, 'structural_missing'))}] = np.where(`,
    `    (${translatedCondition}) & ${context.dataFrameName}[${quotePythonString(targetVariable.name)}].notna(),`,
    '    1,',
    '    0,',
    ')',
  )

  return lines.join('\n')
}

function renderSkipPatternCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const targetVariable = variables[0]
  const lines = [renderPythonStepComment(step, context.commentLanguage)]
  const partialMessage =
    'Python skip-pattern checks use simple applicability conditions and only flag possible routing violations.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(
    pythonComment(rendererWarning(context.commentLanguage, partialMessage)),
  )

  if (!targetVariable) {
    const message = `Skip-pattern step "${step.id}" has no target variable to flag.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const condition = skipPatternCondition(step, targetVariable)

  if (!condition) {
    const message = `Skip-pattern step "${step.id}" has no applicability condition; review the questionnaire routing manually.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'python',
    context.dataFrameName,
  )

  lines.push(
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.applicableWhen', {
        condition,
      }),
    ),
    `${context.dataFrameName}[${quotePythonString(flagName(targetVariable, 'skip_pattern'))}] = np.where(`,
    `    ~(${translatedCondition}) & ${context.dataFrameName}[${quotePythonString(targetVariable.name)}].notna(),`,
    '    1,',
    '    0,',
    ')',
  )

  return lines.join('\n')
}

function renderConsistencyCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderPythonStepComment(step, context.commentLanguage)]
  const condition = conditionParameter(step)
  const partialMessage =
    'Python consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(
    pythonComment(rendererWarning(context.commentLanguage, partialMessage)),
  )

  if (!condition) {
    const message = `Consistency check "${step.id}" has no condition; no executable flag was generated.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'python',
    context.dataFrameName,
  )

  lines.push(
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.flagCondition', {
        condition,
      }),
    ),
    `${context.dataFrameName}[${quotePythonString(stepFlagName(step, 'consistency'))}] = np.where(`,
    `    ${translatedCondition},`,
    '    1,',
    '    0,',
    ')',
  )

  return lines.join('\n')
}

function renderDuplicateIdCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderPythonStepComment(step, context.commentLanguage)]

  if (variables.length === 0) {
    const message = `Duplicate ID check "${step.id}" has no identifier variables.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const variableNames = variables.map((variable) => variable.name)
  const flag = duplicateFlagName(step)

  lines.push(
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.duplicateNoDelete'),
    ),
    `duplicate_key_${flag} = [${variableNames.map(quotePythonString).join(', ')}]`,
    `${context.dataFrameName}[${quotePythonString(flag)}] = np.where(`,
    `    ${context.dataFrameName}[duplicate_key_${flag}].notna().all(axis=1) & ${context.dataFrameName}.duplicated(subset=duplicate_key_${flag}, keep=False),`,
    '    1,',
    '    0,',
    ')',
  )

  return lines.join('\n')
}

function renderMissingnessDiagnosis(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const variableNames = variables.map((variable) => variable.name)
  const lines = [
    renderPythonStepComment(step, context.commentLanguage),
    `missing_summary = ${context.dataFrameName}[${JSON.stringify(variableNames)}].isna().sum().to_frame("n_missing")`,
    `missing_summary["pct_missing"] = missing_summary["n_missing"] / len(${context.dataFrameName}) * 100`,
    'print(missing_summary)',
  ]

  variables.forEach((variable) => {
    lines.push(
      `${context.dataFrameName}[${quotePythonString(missingIndicatorName(variable))}] = np.where(${context.dataFrameName}[${quotePythonString(variable.name)}].isna(), 1, 0)`,
    )
  })

  return lines.join('\n')
}

function renderImputation(step: CleaningStep, context: RenderContext): string {
  const lines = [
    renderPythonStepComment(step, context.commentLanguage),
    pythonComment(
      rendererWarning(
        context.commentLanguage,
        'IterativeImputer is experimental in scikit-learn and must be reviewed before production use.',
      ),
    ),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonSingleDataset'),
    ),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonPoolingWorkflow'),
    ),
    pythonComment(
      rendererComment(
        context.commentLanguage,
        'comment.pythonImputationExclusions',
      ),
    ),
  ]
  context.warnings.push(
    `Step "${step.id}": Python imputation uses an experimental IterativeImputer example and does not automate Rubin-style pooling.`,
  )

  if (selectsStructuralMissing(step.parameters)) {
    const message =
      'Structural missing values were requested for imputation and have been blocked.'
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
  }

  const imputedVariables = findStepVariables(
    step,
    context.variablesByName,
  ).filter((variable) => {
    if (isIdentifierVariable(variable)) {
      const message = `Identifier variable "${variable.name}" was excluded from imputation.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
      return false
    }

    if (['binary', 'nominal', 'ordinal'].includes(variable.type)) {
      const message = `Categorical variable "${variable.name}" is included in a numeric IterativeImputer example; review encoding and model fit before production use.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(
        pythonComment(rendererWarning(context.commentLanguage, message)),
      )
    }

    return canImputeVariable(variable)
  })

  if (imputedVariables.length === 0) {
    const message = `Imputation step "${step.id}" has no variables suitable for Python imputation.`
    context.warnings.push(message)
    lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))
    return lines.join('\n')
  }

  const imputationVariables = unique([
    ...imputedVariables.map((variable) => variable.name),
    ...defaultImputationPredictors(context.variablesByName, step),
  ])

  lines.push(
    `imputation_variables = [${imputationVariables.map(quotePythonString).join(', ')}]`,
    `${context.dataFrameName}_for_imputation = ${context.dataFrameName}[imputation_variables].copy()`,
    'imputer = IterativeImputer(random_state=12345, max_iter=10, sample_posterior=True)',
    `imputed_array = imputer.fit_transform(${context.dataFrameName}_for_imputation)`,
    `completed_data_example = ${context.dataFrameName}.copy()`,
    'completed_data_example[imputation_variables] = imputed_array',
    '',
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonPoolingGuidance'),
    ),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.pythonNotFullMi'),
    ),
  )

  return lines.join('\n')
}

function renderAuditLog(step: CleaningStep, context: RenderContext): string {
  const lines = [renderPythonStepComment(step, context.commentLanguage)]
  const message =
    'Python audit-log support is partial: this section documents review guidance but does not create a separate audit table.'

  context.warnings.push(`Step "${step.id}": ${message}`)
  lines.push(
    pythonComment(rendererWarning(context.commentLanguage, message)),
    pythonComment(
      rendererComment(context.commentLanguage, 'comment.reviewGeneratedFlags'),
    ),
  )

  return lines.join('\n')
}

function renderSummaryReport(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderPythonStepComment(step, context.commentLanguage)]
  const message =
    'Python summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.'

  context.warnings.push(`Step "${step.id}": ${message}`)
  lines.push(pythonComment(rendererWarning(context.commentLanguage, message)))

  if (variables.length > 0) {
    const variableNames = variables.map((variable) => variable.name)
    lines.push(
      `summary_report_variables = [${variableNames.map(quotePythonString).join(', ')}]`,
      `print(${context.dataFrameName}[summary_report_variables].describe(include="all"))`,
      `print(${context.dataFrameName}[summary_report_variables].isna().sum())`,
    )
  } else {
    lines.push(
      pythonComment(
        rendererComment(context.commentLanguage, 'comment.noSummaryVariables'),
      ),
    )
  }

  return lines.join('\n')
}

function renderTukeyOutlier(
  step: CleaningStep,
  variable: SurveyVariable,
  dataFrameName: string,
): string[] {
  const multiplier = numberParameter(step, 'multiplier') ?? 1.5
  const series = `${dataFrameName}[${quotePythonString(variable.name)}]`
  const flag = `${dataFrameName}[${quotePythonString(flagName(variable, 'outlier', 'tukey'))}]`

  return [
    `${variable.name}_q1 = ${series}.quantile(0.25)`,
    `${variable.name}_q3 = ${series}.quantile(0.75)`,
    `${variable.name}_iqr = ${variable.name}_q3 - ${variable.name}_q1`,
    `${variable.name}_lower_tukey = ${variable.name}_q1 - ${multiplier} * ${variable.name}_iqr`,
    `${variable.name}_upper_tukey = ${variable.name}_q3 + ${multiplier} * ${variable.name}_iqr`,
    `${flag} = np.where(`,
    `    ${series}.notna() & ((${series} < ${variable.name}_lower_tukey) | (${series} > ${variable.name}_upper_tukey)),`,
    '    1,',
    '    0,',
    ')',
  ]
}

function renderMadOutlier(
  step: CleaningStep,
  variable: SurveyVariable,
  dataFrameName: string,
): string[] {
  const threshold = numberParameter(step, 'threshold') ?? 3.5
  const series = `${dataFrameName}[${quotePythonString(variable.name)}]`
  const flag = `${dataFrameName}[${quotePythonString(flagName(variable, 'outlier', 'mad'))}]`

  return [
    `${variable.name}_median = ${series}.median(skipna=True)`,
    `${variable.name}_mad = (${series} - ${variable.name}_median).abs().median(skipna=True) * 1.4826`,
    `${flag} = np.where(`,
    `    ${series}.notna() & (${variable.name}_mad > 0) & ((${series} - ${variable.name}_median).abs() / ${variable.name}_mad > ${threshold}),`,
    '    1,',
    '    0,',
    ')',
  ]
}
