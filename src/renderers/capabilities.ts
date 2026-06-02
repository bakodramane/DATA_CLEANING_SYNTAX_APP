import type { CleaningStepType } from '../core'
import type {
  RendererCapability,
  RendererCapabilityMatrix,
  TargetLanguage,
} from '../core/models'

type CapabilityByLanguage = Record<TargetLanguage, RendererCapability>

const supported = (note?: string): RendererCapability => ({
  status: 'supported',
  ...(note ? { note } : {}),
})

const partiallySupported = (note: string): RendererCapability => ({
  status: 'partially_supported',
  note,
})

const unsupported = (note: string): RendererCapability => ({
  status: 'unsupported',
  note,
})

const allLanguages = (
  capability: RendererCapability,
): CapabilityByLanguage => ({
  spss18: capability,
  stata14: capability,
  r: capability,
  python: capability,
})

export const RENDERER_CAPABILITY_MATRIX: RendererCapabilityMatrix<CleaningStepType> =
  {
    import_declaration: allLanguages(
      unsupported(
        'Import metadata is preserved in the Cleaning Plan, not rendered as executable syntax.',
      ),
    ),
    variable_label: {
      spss18: supported(),
      stata14: supported(),
      r: supported(),
      python: partiallySupported(
        'Python stores variable labels in metadata dictionaries because pandas has no native SPSS/Stata-style labels.',
      ),
    },
    value_label: {
      spss18: supported(),
      stata14: supported(),
      r: supported(),
      python: partiallySupported(
        'Python stores value labels in metadata dictionaries for analyst review.',
      ),
    },
    missing_value_declaration: {
      spss18: supported(),
      stata14: partiallySupported(
        'Numeric declared codes are rendered with mvdecode; Stata extended missing values require analyst review.',
      ),
      r: supported(),
      python: supported(),
    },
    range_check: allLanguages(supported()),
    domain_check: allLanguages(supported()),
    structural_missing_check: allLanguages(
      partiallySupported(
        'Rendered as review flags or comments; structural missing values are not imputed or recoded automatically.',
      ),
    ),
    skip_pattern_check: allLanguages(
      partiallySupported(
        'Rendered as routing-violation flags when a simple applicability condition is available.',
      ),
    ),
    consistency_check: allLanguages(
      partiallySupported(
        'Rendered as a review flag only when the Cleaning Plan supplies a simple condition.',
      ),
    ),
    duplicate_id_check: allLanguages(
      supported('Duplicate identifiers are flagged; records are not removed.'),
    ),
    recode: allLanguages(
      unsupported('General recoding is not part of the current renderer path.'),
    ),
    derived_variable: allLanguages(
      unsupported(
        'Derived-variable creation is not part of the current renderer path.',
      ),
    ),
    outlier_flag: {
      spss18: partiallySupported(
        'SPSS v18 output emits transparent review templates for Tukey and MAD flags; advanced methods remain warnings.',
      ),
      stata14: supported(
        'Tukey and MAD flags are supported; advanced methods remain warnings.',
      ),
      r: supported(
        'Tukey and MAD flags are supported; advanced methods remain warnings.',
      ),
      python: supported(
        'Tukey and MAD flags are supported; advanced methods remain warnings.',
      ),
    },
    outlier_treatment: allLanguages(
      unsupported(
        'Outlier treatment is never automatic; no renderer deletes, caps, or winsorises values.',
      ),
    ),
    missingness_diagnosis: allLanguages(supported()),
    imputation: {
      spss18: partiallySupported(
        'Multiple imputation syntax depends on SPSS module availability and analyst review.',
      ),
      stata14: supported('mi chained examples are rendered for review.'),
      r: supported('mice examples are rendered for review.'),
      python: partiallySupported(
        'Python renders an IterativeImputer example and does not automate Rubin-style pooled inference.',
      ),
    },
    audit_log: allLanguages(
      partiallySupported(
        'Rendered as audit guidance and flag summaries; no separate audit table is created automatically.',
      ),
    ),
    summary_report: allLanguages(
      partiallySupported(
        'Rendered as simple summary commands or comments; formal reports remain a reviewer task.',
      ),
    ),
  }

export const DOCUMENTED_RENDERER_STEP_TYPES: CleaningStepType[] = [
  'import_declaration',
  'variable_label',
  'value_label',
  'missing_value_declaration',
  'range_check',
  'domain_check',
  'structural_missing_check',
  'skip_pattern_check',
  'consistency_check',
  'duplicate_id_check',
  'recode',
  'derived_variable',
  'outlier_flag',
  'outlier_treatment',
  'missingness_diagnosis',
  'imputation',
  'audit_log',
  'summary_report',
]

export function getRendererCapability(
  stepType: CleaningStepType,
  language: TargetLanguage,
): RendererCapability {
  return (
    RENDERER_CAPABILITY_MATRIX[stepType]?.[language] ??
    unsupported(`Step type "${stepType}" is not documented for ${language}.`)
  )
}
