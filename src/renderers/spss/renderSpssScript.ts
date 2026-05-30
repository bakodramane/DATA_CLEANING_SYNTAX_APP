import type { CleaningPlan, CleaningStep, SurveyVariable } from '../../core'
import {
  allowedDomainValues,
  canImputeVariable,
  createUnsupportedStep,
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
} from '../helpers'
import type {
  RenderedScript,
  RenderOptions,
  UnsupportedRenderedStep,
} from '../types'
import {
  formatSpssList,
  formatSpssValue,
  makeSpssFilename,
  quoteSpssString,
  renderSpssStepComment,
  renderSpssTitleBlock,
  spssComment,
  spssFlagLabel,
  spssVariableLabel,
} from './helpers'

interface RenderContext {
  variablesByName: Map<string, SurveyVariable>
  warnings: string[]
  unsupportedSteps: UnsupportedRenderedStep[]
}

export function renderSpssScript(
  cleaningPlan: CleaningPlan,
  options: RenderOptions = {},
): RenderedScript {
  const context: RenderContext = {
    variablesByName: indexVariables(cleaningPlan.variables),
    warnings: [],
    unsupportedSteps: [],
  }

  const sections = [
    renderSpssTitleBlock(cleaningPlan, options.generatedAt),
    ...cleaningPlan.steps.map((step) => renderStep(step, context)),
  ]

  return {
    language: 'spss18',
    filename: options.filename ?? makeSpssFilename(cleaningPlan),
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
  const unsupportedStep = createUnsupportedStep(step, 'SPSS v18')
  context.unsupportedSteps.push(unsupportedStep)
  context.warnings.push(`Step "${step.id}": ${unsupportedStep.reason}`)

  return [
    renderSpssStepComment(step),
    spssComment(`WARNING: ${unsupportedStep.reason}`),
  ].join('\n')
}

function renderVariableLabels(
  step: CleaningStep,
  context: RenderContext,
): string {
  return [
    renderSpssStepComment(step),
    ...findStepVariables(step, context.variablesByName).map(spssVariableLabel),
  ].join('\n')
}

function renderValueLabels(step: CleaningStep, context: RenderContext): string {
  const lines = [renderSpssStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!variable.valueLabels || variable.valueLabels.length === 0) {
      const message = `Variable "${variable.name}" has no value labels to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(spssComment(`WARNING: ${message}`))
      return
    }

    lines.push(
      `VALUE LABELS ${variable.name}`,
      ...variable.valueLabels.map(
        (label) =>
          `  ${formatSpssValue(label.value)} ${quoteSpssString(label.label)}`,
      ),
      '.',
    )
  })

  return lines.join('\n')
}

function renderMissingValueDeclarations(
  step: CleaningStep,
  context: RenderContext,
): string {
  const lines = [renderSpssStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const missingCodes = variable.declaredMissingCodes ?? []

    if (missingCodes.length === 0) {
      const message = `Variable "${variable.name}" has no declared missing codes to render.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(spssComment(`WARNING: ${message}`))
      return
    }

    const values = missingCodes.map((missingCode) => missingCode.value)
    lines.push(
      spssComment(
        `Declared missing codes for ${variable.name}: ${formatSpssList(values)}`,
      ),
      spssComment(
        'SPSS user-missing declarations preserve original values; no source variable is overwritten',
      ),
      `MISSING VALUES ${variable.name} (${formatSpssList(values)}).`,
    )
  })

  return lines.join('\n')
}

function renderRangeCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderSpssStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const min = numberOrStringParameter(step, 'min') ?? variable.validRange?.min
    const max = numberOrStringParameter(step, 'max') ?? variable.validRange?.max
    const conditions = [
      min !== undefined
        ? `${variable.name} < ${formatSpssValue(min)}`
        : undefined,
      max !== undefined
        ? `${variable.name} > ${formatSpssValue(max)}`
        : undefined,
    ].filter((condition): condition is string => Boolean(condition))

    if (conditions.length === 0) {
      const message = `Range check "${step.id}" has no min or max for "${variable.name}".`
      context.warnings.push(message)
      lines.push(spssComment(`WARNING: ${message}`))
      return
    }

    const flag = flagName(variable, 'range')
    lines.push(
      `NUMERIC ${flag} (F1.0).`,
      `COMPUTE ${flag} = 0.`,
      `IF (NOT MISSING(${variable.name}) AND (${conditions.join(' OR ')})) ${flag} = 1.`,
      spssFlagLabel(flag, `Flag: ${variable.name} outside expected range`),
      'EXECUTE.',
    )
  })

  return lines.join('\n')
}

function renderDomainCheck(step: CleaningStep, context: RenderContext): string {
  const lines = [renderSpssStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    const allowedValues = allowedDomainValues(step, variable)

    if (allowedValues.length === 0) {
      const message = `Domain check "${step.id}" has no allowed values for "${variable.name}".`
      context.warnings.push(message)
      lines.push(spssComment(`WARNING: ${message}`))
      return
    }

    const flag = flagName(variable, 'domain')
    lines.push(
      `NUMERIC ${flag} (F1.0).`,
      `COMPUTE ${flag} = 0.`,
      `IF (NOT MISSING(${variable.name}) AND NOT ANY(${variable.name}, ${formatSpssList(allowedValues)})) ${flag} = 1.`,
      spssFlagLabel(flag, `Flag: ${variable.name} outside allowed domain`),
      'EXECUTE.',
    )
  })

  return lines.join('\n')
}

function renderOutlierFlag(step: CleaningStep, context: RenderContext): string {
  const method = normalizeMethodName(step.parameters.method) ?? 'tukey'
  const lines = [renderSpssStepComment(step)]

  findStepVariables(step, context.variablesByName).forEach((variable) => {
    if (!isContinuousOutlierVariable(variable)) {
      const message = `Outlier method "${method}" is only rendered for continuous or count variables; "${variable.name}" is ${variable.type}.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(spssComment(`WARNING: ${message}`))
      return
    }

    const message = `SPSS v18 ${method} outlier thresholds are emitted as a review template; verify thresholds before running production syntax.`
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(spssComment(`WARNING: ${message}`))

    if (method === 'mad' || method === 'mad_robust') {
      lines.push(...renderMadOutlierTemplate(step, variable))
      return
    }

    lines.push(...renderTukeyOutlierTemplate(step, variable))
  })

  return lines.join('\n')
}

function renderMissingnessDiagnosis(
  step: CleaningStep,
  context: RenderContext,
): string {
  const variables = findStepVariables(step, context.variablesByName)
  const lines = [
    renderSpssStepComment(step),
    `FREQUENCIES VARIABLES=${variables.map((variable) => variable.name).join(' ')} /FORMAT=NOTABLE /MISSING=INCLUDE.`,
  ]

  variables.forEach((variable) => {
    const flag = `missing_${variable.name}`
    lines.push(
      `NUMERIC ${flag} (F1.0).`,
      `COMPUTE ${flag} = MISSING(${variable.name}).`,
      spssFlagLabel(flag, `Indicator: ${variable.name} is missing`),
      'EXECUTE.',
    )
  })

  return lines.join('\n')
}

function renderImputation(step: CleaningStep, context: RenderContext): string {
  const lines = [
    renderSpssStepComment(step),
    spssComment(
      'WARNING: SPSS multiple imputation requires the relevant SPSS functionality and analyst review',
    ),
    spssComment(
      'Review imputation models and structural missingness before running this syntax',
    ),
  ]
  context.warnings.push(
    `Step "${step.id}": SPSS v18 multiple imputation syntax requires module availability and analyst review.`,
  )

  if (selectsStructuralMissing(step.parameters)) {
    const message =
      'Structural missing values were requested for imputation and have been blocked.'
    context.warnings.push(`Step "${step.id}": ${message}`)
    lines.push(spssComment(`WARNING: ${message}`))
  }

  const imputedVariables = findStepVariables(
    step,
    context.variablesByName,
  ).filter((variable) => {
    if (isIdentifierVariable(variable)) {
      const message = `Identifier variable "${variable.name}" was excluded from imputation.`
      context.warnings.push(`Step "${step.id}": ${message}`)
      lines.push(spssComment(`WARNING: ${message}`))
      return false
    }

    return canImputeVariable(variable)
  })

  if (imputedVariables.length === 0) {
    const message = `Imputation step "${step.id}" has no variables suitable for SPSS imputation.`
    context.warnings.push(message)
    lines.push(spssComment(`WARNING: ${message}`))
    return lines.join('\n')
  }

  lines.push(
    `MULTIPLE IMPUTATION ${imputedVariables.map((variable) => variable.name).join(' ')}`,
    '  /IMPUTE METHOD=AUTO NIMPUTATIONS=5 MAXPCTMISSING=NONE',
    `  /MISSINGSUMMARIES VARIABLES=${imputedVariables.map((variable) => variable.name).join(' ')}`,
    '  /IMPUTATIONSUMMARIES MODELS DESCRIPTIVES.',
    spssComment(
      'After imputation, inspect generated imputed datasets before analysis',
    ),
  )

  return lines.join('\n')
}

function renderMadOutlierTemplate(
  step: CleaningStep,
  variable: SurveyVariable,
): string[] {
  const threshold = numberParameter(step, 'threshold') ?? 3.5
  const flag = flagName(variable, 'outlier', 'mad')

  return [
    spssComment(
      `Replace the placeholder median and MAD values for ${variable.name} after review`,
    ),
    spssComment(
      `Example threshold: absolute robust z-score greater than ${threshold}`,
    ),
    `NUMERIC ${flag} (F1.0).`,
    `COMPUTE ${flag} = 0.`,
    spssComment(
      `IF (NOT MISSING(${variable.name}) AND <${variable.name}_mad> > 0 AND ABS(${variable.name} - <${variable.name}_median>) / <${variable.name}_mad> > ${threshold}) ${flag} = 1`,
    ),
    spssFlagLabel(flag, `Flag: ${variable.name} possible MAD outlier`),
    'EXECUTE.',
  ]
}

function renderTukeyOutlierTemplate(
  step: CleaningStep,
  variable: SurveyVariable,
): string[] {
  const multiplier = numberParameter(step, 'multiplier') ?? 1.5
  const flag = flagName(variable, 'outlier', 'tukey')

  return [
    spssComment(
      `Review quartiles for ${variable.name}; replace placeholders before running the IF command`,
    ),
    spssComment(`Tukey multiplier: ${multiplier}`),
    `NUMERIC ${flag} (F1.0).`,
    `COMPUTE ${flag} = 0.`,
    spssComment(
      `IF (NOT MISSING(${variable.name}) AND (${variable.name} < <${variable.name}_lower_tukey> OR ${variable.name} > <${variable.name}_upper_tukey>)) ${flag} = 1`,
    ),
    spssFlagLabel(flag, `Flag: ${variable.name} possible Tukey outlier`),
    'EXECUTE.',
  ]
}
