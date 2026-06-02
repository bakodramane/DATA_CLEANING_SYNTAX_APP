import type { CleaningPlan, CleaningStep, SurveyVariable } from '../../core'
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
  isStataExtendedMissingValue,
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
  formatStataCommaList,
  formatStataList,
  formatStataValue,
  makeStataFilename,
  quoteStataString,
  renderStataStepComment,
  renderStataTitleBlock,
  stataComment,
  stataLabelName,
} from './helpers'

interface RenderContext {
  variablesByName: Map<string, SurveyVariable>
  warnings: string[]
  unsupportedSteps: UnsupportedRenderedStep[]
}

export function renderStataDoFile(
  cleaningPlan: CleaningPlan,
  options: RenderOptions = {},
): RenderedScript {
  const context: RenderContext = {
    variablesByName: indexVariables(cleaningPlan.variables),
    warnings: [],
    unsupportedSteps: [],
  }

  const sections = [
    renderStataTitleBlock(cleaningPlan, options.generatedAt),
    ...cleaningPlan.steps.map((step) => renderStep(step, context)),
  ]

  return {
    language: 'stata14',
    filename: options.filename ?? makeStataFilename(cleaningPlan),
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
  const unsupportedStep = createUnsupportedStep(step, 'Stata v14')
  context.unsupportedSteps.push(unsupportedStep)
  context.warnings.push(`Step "${step.id}": ${unsupportedStep.reason}`)

  return [
    renderStataStepComment(step),
    stataComment(`WARNING: ${unsupportedStep.reason}`),
  ].join('\n')
}

function renderVariableLabels(
  step: CleaningStep,
  context: RenderContext,
): string {
  return [
    renderStataStepComment(step),
    ...findStepVariables(step, context.variablesByName).map(
      (variable) =>
        `label variable ${variable.name} ${quoteStataString(variable.label)}`,
    ),
  ].join('\n')
}

function renderValueLabels(step: CleaningStep, context: RenderContext): string {
  const lines = [renderStataStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!variable.valueLabels || variable.valueLabels.length === 0) {
      const message = `Variable "${variable.name}" has no value labels to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(stataComment(`WARNING: ${message}`))
      return
    }

    const labelName = stataLabelName(variable)
    const labelPairs = variable.valueLabels
      .map(
        (label) =>
          `${formatStataValue(label.value)} ${quoteStataString(label.label)}`,
      )
      .join(' ')

    lines.push(
      `label define ${labelName} ${labelPairs}, replace`,
      `label values ${variable.name} ${labelName}`,
    )
  })

  return lines.join('\n')
}

function renderMissingValueDeclarations(
  step: CleaningStep,
  context: RenderContext,
): string {
  const lines = [renderStataStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const missingCodes = variable.declaredMissingCodes ?? []

    if (missingCodes.length === 0) {
      const message = `Variable "${variable.name}" has no declared missing codes to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(stataComment(`WARNING: ${message}`))
      return
    }

    const values = missingCodes.map((missingCode) => missingCode.value)
    const extendedMissingValues = values.filter(isStataExtendedMissingValue)

    if (extendedMissingValues.length > 0) {
      const message = `Stata extended missing values (${formatStataList(extendedMissingValues)}) were detected for "${variable.name}"; review them because mvdecode is intended for declared nonresponse codes.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(stataComment(`WARNING: ${message}`))
    }

    lines.push(
      stataComment(
        `Declared missing codes for ${variable.name}: ${formatStataList(values)}`,
      ),
      stataComment(
        'mvdecode converts declared nonresponse codes to Stata system missing; review before running',
      ),
      `mvdecode ${variable.name}, mv(${formatStataList(values)})`,
    )
  })

  return lines.join('\n')
}

function renderRangeCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderStataStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const min = numberOrStringParameter(step, 'min') ?? variable.validRange?.min
    const max = numberOrStringParameter(step, 'max') ?? variable.validRange?.max
    const conditions = [
      min !== undefined
        ? `${variable.name} < ${formatStataValue(min)}`
        : undefined,
      max !== undefined
        ? `${variable.name} > ${formatStataValue(max)}`
        : undefined,
    ].filter((condition): condition is string => Boolean(condition))

    if (conditions.length === 0) {
      const message = `Range check "${step.id}" has no min or max for "${variable.name}".`
      context.warnings.push(message)
      lines.push(stataComment(`WARNING: ${message}`))
      return
    }

    const flag = flagName(variable, 'range')
    lines.push(
      `generate byte ${flag} = !missing(${variable.name}) & (${conditions.join(' | ')})`,
      `label variable ${flag} ${quoteStataString(`Flag: ${variable.name} outside expected range`)}`,
    )
  })

  return lines.join('\n')
}

function renderDomainCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderStataStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const allowedValues = allowedDomainValues(step, variable)

    if (allowedValues.length === 0) {
      const message = `Domain check "${step.id}" has no allowed values for "${variable.name}".`
      context.warnings.push(message)
      lines.push(stataComment(`WARNING: ${message}`))
      return
    }

    const flag = flagName(variable, 'domain')
    lines.push(
      `generate byte ${flag} = !missing(${variable.name}) & !inlist(${variable.name}, ${formatStataCommaList(allowedValues)})`,
      `label variable ${flag} ${quoteStataString(`Flag: ${variable.name} outside allowed domain`)}`,
    )
  })

  return lines.join('\n')
}

function renderOutlierFlag(step: CleaningStep, context: RenderContext): string {
  const method = normalizeMethodName(step.parameters.method) ?? 'tukey'
  const lines = [renderStataStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!isContinuousOutlierVariable(variable)) {
      const message = `Outlier method "${method}" is only rendered for continuous or count variables; "${variable.name}" is ${variable.type}.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(stataComment(`WARNING: ${message}`))
      return
    }

    if (method === 'mad' || method === 'mad_robust') {
      lines.push(...renderMadOutlier(step, variable))
      return
    }

    if (method === 'tukey' || method === 'tukey_fences') {
      lines.push(...renderTukeyOutlier(step, variable))
      return
    }

    const message = `Outlier method "${method}" is not supported by the current Stata v14 renderer; no deletion, capping, or winsorisation syntax was generated.`
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(stataComment(`WARNING: ${message}`))
  })

  return lines.join('\n')
}

function renderStructuralMissingCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const targetVariable = variables[0]
  const lines = [renderStataStepComment(step)]
  const partialMessage =
    'Stata structural-missing checks are rendered as review flags only; values are not recoded or imputed.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(stataComment(`WARNING: ${partialMessage}`))

  if (!targetVariable) {
    const message = `Structural-missing step "${step.id}" has no target variable to flag.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const condition = structuralMissingCondition(step, targetVariable)

  if (!condition) {
    const message = `Structural-missing step "${step.id}" has no condition; review the Cleaning Plan notes manually.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const flag = flagName(targetVariable, 'structural_missing')
  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'stata14',
  )

  lines.push(
    stataComment(`Structural-missing condition: ${condition}`),
    `generate byte ${flag} = (${translatedCondition}) & !missing(${targetVariable.name})`,
    `label variable ${flag} ${quoteStataString(`Flag: ${targetVariable.name} present when structurally missing`)}`,
  )

  return lines.join('\n')
}

function renderSkipPatternCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const targetVariable = variables[0]
  const lines = [renderStataStepComment(step)]
  const partialMessage =
    'Stata skip-pattern checks use simple applicability conditions and only flag possible routing violations.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(stataComment(`WARNING: ${partialMessage}`))

  if (!targetVariable) {
    const message = `Skip-pattern step "${step.id}" has no target variable to flag.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const condition = skipPatternCondition(step, targetVariable)

  if (!condition) {
    const message = `Skip-pattern step "${step.id}" has no applicability condition; review the questionnaire routing manually.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const flag = flagName(targetVariable, 'skip_pattern')
  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'stata14',
  )

  lines.push(
    stataComment(`Applicable when: ${condition}`),
    `generate byte ${flag} = !(${translatedCondition}) & !missing(${targetVariable.name})`,
    `label variable ${flag} ${quoteStataString(`Flag: ${targetVariable.name} present outside skip pattern`)}`,
  )

  return lines.join('\n')
}

function renderConsistencyCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStataStepComment(step)]
  const condition = conditionParameter(step)
  const partialMessage =
    'Stata consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.'

  context.warnings.push(`Step "${step.id}": ${partialMessage}`)
  lines.push(stataComment(`WARNING: ${partialMessage}`))

  if (!condition) {
    const message = `Consistency check "${step.id}" has no condition; no executable flag was generated.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const flag = stepFlagName(step, 'consistency').slice(0, 32)
  const translatedCondition = translateConditionExpression(
    condition,
    variables,
    'stata14',
  )

  lines.push(
    stataComment(`Flag condition: ${condition}`),
    `generate byte ${flag} = (${translatedCondition})`,
    `label variable ${flag} ${quoteStataString(`Flag: consistency review for ${step.id}`)}`,
  )

  return lines.join('\n')
}

function renderDuplicateIdCheck(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStataStepComment(step)]

  if (variables.length === 0) {
    const message = `Duplicate ID check "${step.id}" has no identifier variables.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const byVariables = variables.map((variable) => variable.name).join(' ')
  const flag = duplicateFlagName(step).slice(0, 32)

  lines.push(
    stataComment(
      'Duplicate identifier checks tag records; no records are deleted.',
    ),
    `duplicates tag ${byVariables}, generate(${flag})`,
    `replace ${flag} = ${flag} > 0 if !missing(${variables[0].name})`,
    `label variable ${flag} ${quoteStataString(`Flag: duplicate identifier for ${byVariables}`)}`,
  )

  return lines.join('\n')
}

function renderMissingnessDiagnosis(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [
    renderStataStepComment(step),
    `misstable summarize ${variables.map((variable) => variable.name).join(' ')}`,
  ]

  variables.forEach((variable) => {
    lines.push(
      `generate byte missing_${variable.name} = missing(${variable.name})`,
      `label variable missing_${variable.name} ${quoteStataString(`Indicator: ${variable.name} is missing`)}`,
    )
  })

  return lines.join('\n')
}

function renderImputation(step: CleaningStep, context: RenderContext): string {
  const lines = [
    renderStataStepComment(step),
    stataComment('Multiple imputation model choices require analyst review'),
    stataComment(
      'Structural missing values must be excluded before imputation',
    ),
    stataComment(
      'Identifier variables are excluded from mi register imputed lists',
    ),
  ]

  if (selectsStructuralMissing(step.parameters)) {
    const message =
      'Structural missing values were requested for imputation and have been blocked.'
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(stataComment(`WARNING: ${message}`))
  }

  const imputedVariables = findStepVariables(
    step,
    context.variablesByName,
  ).filter((variable) => {
    if (isIdentifierVariable(variable)) {
      const message = `Identifier variable "${variable.name}" was excluded from imputation.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(stataComment(`WARNING: ${message}`))
      return false
    }

    return canImputeVariable(variable)
  })

  if (imputedVariables.length === 0) {
    const message = `Imputation step "${step.id}" has no variables suitable for Stata mi imputation.`
    context.warnings.push(message)
    lines.push(stataComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  const predictors = unique(
    defaultImputationPredictors(context.variablesByName, step).filter(
      (name) => !imputedVariables.some((variable) => variable.name === name),
    ),
  )
  const imputationTerms = imputedVariables
    .map((variable) => `(${stataMiMethod(variable)}) ${variable.name}`)
    .join(' ')

  lines.push(
    'mi set mlong',
    `mi register imputed ${imputedVariables.map((variable) => variable.name).join(' ')}`,
    `mi register regular ${predictors.join(' ')}`,
    `mi impute chained ${imputationTerms} = ${predictors.join(' ')}, add(20) rseed(12345)`,
    stataComment('Example pooling guidance, to be adapted by the analyst:'),
    stataComment('mi estimate: regress outcome income age sex'),
  )

  return lines.join('\n')
}

function renderAuditLog(step: CleaningStep, context: RenderContext): string {
  const lines = [renderStataStepComment(step)]
  const message =
    'Stata audit-log support is partial: this section documents review guidance but does not create a separate audit table.'

  context.warnings.push(`Step "${step.id}": ${message}`)
  lines.push(
    stataComment(`WARNING: ${message}`),
    stataComment(
      'Review generated flag_* variables and preserve reviewer decisions outside the source variables.',
    ),
  )

  return lines.join('\n')
}

function renderSummaryReport(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [renderStataStepComment(step)]
  const message =
    'Stata summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.'

  context.warnings.push(`Step "${step.id}": ${message}`)
  lines.push(stataComment(`WARNING: ${message}`))

  if (variables.length > 0) {
    lines.push(
      `summarize ${variables.map((variable) => variable.name).join(' ')}`,
      `misstable summarize ${variables.map((variable) => variable.name).join(' ')}`,
    )
  } else {
    lines.push(
      stataComment('No variables were listed for the summary report step.'),
    )
  }

  return lines.join('\n')
}

function renderTukeyOutlier(
  step: CleaningStep,
  variable: SurveyVariable,
): string[] {
  const multiplier = numberParameter(step, 'multiplier') ?? 1.5
  const flag = flagName(variable, 'outlier', 'tukey')

  return [
    `quietly summarize ${variable.name}, detail`,
    `scalar ${variable.name}_q1 = r(p25)`,
    `scalar ${variable.name}_q3 = r(p75)`,
    `scalar ${variable.name}_iqr = ${variable.name}_q3 - ${variable.name}_q1`,
    `scalar ${variable.name}_lower_tukey = ${variable.name}_q1 - ${multiplier} * ${variable.name}_iqr`,
    `scalar ${variable.name}_upper_tukey = ${variable.name}_q3 + ${multiplier} * ${variable.name}_iqr`,
    `generate byte ${flag} = !missing(${variable.name}) & (${variable.name} < ${variable.name}_lower_tukey | ${variable.name} > ${variable.name}_upper_tukey)`,
    `label variable ${flag} ${quoteStataString(`Flag: ${variable.name} possible Tukey outlier`)}`,
  ]
}

function renderMadOutlier(
  step: CleaningStep,
  variable: SurveyVariable,
): string[] {
  const threshold = numberParameter(step, 'threshold') ?? 3.5
  const flag = flagName(variable, 'outlier', 'mad')
  const tempVariable = `absdev_${variable.name}`.slice(0, 28)

  return [
    `quietly summarize ${variable.name}, detail`,
    `scalar ${variable.name}_median = r(p50)`,
    `tempvar ${tempVariable}`,
    `generate double \`${tempVariable}' = abs(${variable.name} - ${variable.name}_median)`,
    `quietly summarize \`${tempVariable}', detail`,
    `scalar ${variable.name}_mad = r(p50) * 1.4826`,
    `generate byte ${flag} = !missing(${variable.name}) & ${variable.name}_mad > 0 & abs(${variable.name} - ${variable.name}_median) / ${variable.name}_mad > ${threshold}`,
    `label variable ${flag} ${quoteStataString(`Flag: ${variable.name} possible MAD outlier`)}`,
  ]
}

function stataMiMethod(variable: SurveyVariable): string {
  switch (variable.type) {
    case 'binary':
      return 'logit'
    case 'nominal':
      return 'mlogit'
    case 'ordinal':
      return 'ologit'
    default:
      return 'pmm'
  }
}
