import type { CleaningPlan, CleaningStep, SurveyVariable } from '../../core'
import {
  allowedDomainValues,
  canImputeVariable,
  createUnsupportedStep,
  defaultImputationPredictors,
  findStepVariables,
  flagName,
  indexVariables,
  isContinuousOutlierVariable,
  isIdentifierVariable,
  MVP_RENDERED_STEP_TYPES,
  normalizeMethodName,
  numberOrStringParameter,
  numberParameter,
  selectsStructuralMissing,
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

    const message = `Outlier method "${method}" is not supported by the current Stata renderer.`
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(stataComment(`WARNING: ${message}`))
  })

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
