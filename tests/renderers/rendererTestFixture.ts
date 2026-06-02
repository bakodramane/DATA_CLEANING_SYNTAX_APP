import {
  sampleCleaningPlan,
  type Citation,
  type CleaningPlan,
  type CleaningStep,
  type RendererSupportByLanguage,
  type SurveyVariable,
} from '../../src/core'

export const fixedGeneratedAt = '2026-05-30T12:00:00.000Z'

export function cloneSamplePlan(): CleaningPlan {
  return structuredClone(sampleCleaningPlan)
}

function rendererSupportedStep(
  overrides: Pick<CleaningStep, 'id' | 'type' | 'variables' | 'rationale'> &
    Partial<CleaningStep>,
): CleaningStep {
  return {
    parameters: {},
    citationKeys: ['IHSN_DDI'],
    severity: 'info',
    defaultAction: 'no_action',
    isAutomatic: true,
    requiresReview: false,
    rendererSupport: {
      r: { status: 'supported' },
      spss18: { status: 'supported' },
      stata14: { status: 'supported' },
      python: { status: 'supported' },
    },
    ...overrides,
  }
}

export function createRendererTestPlan(): CleaningPlan {
  const plan = cloneSamplePlan()
  const ihsnDdiCitation: Citation = {
    key: 'IHSN_DDI',
    title: 'DDI metadata guidance',
    authorOrOrganisation: 'IHSN',
    year: 'NEEDS_VERIFICATION',
    sourceType: 'official_guidance',
    note: 'Placeholder citation for renderer tests.',
  }

  const missingnessStep = plan.steps.find(
    (step) => step.id === 'step_income_missingness',
  )

  if (missingnessStep) {
    missingnessStep.parameters = {
      ...missingnessStep.parameters,
      createIndicators: true,
    }
  }

  plan.citations.push(ihsnDdiCitation)
  plan.steps = [
    rendererSupportedStep({
      id: 'step_variable_labels',
      type: 'variable_label',
      variables: ['age', 'income'],
      rationale: 'Preserve survey codebook labels in the analysis dataset.',
    }),
    rendererSupportedStep({
      id: 'step_value_labels',
      type: 'value_label',
      variables: ['sex', 'education_level', 'employment_status'],
      rationale:
        'Preserve categorical code labels so analysts can review labelled values.',
    }),
    rendererSupportedStep({
      id: 'step_missing_value_declarations',
      type: 'missing_value_declaration',
      variables: ['age', 'sex', 'education_level', 'income'],
      rationale:
        'Convert declared nonresponse codes to missing values while documenting the original codes.',
      defaultAction: 'set_missing',
      requiresReview: true,
    }),
    ...plan.steps,
  ]

  return plan
}

const supportedEverywhere = (): RendererSupportByLanguage => ({
  r: { status: 'supported' },
  spss18: { status: 'supported' },
  stata14: { status: 'supported' },
  python: { status: 'supported' },
})

const partiallySupportedEverywhere = (
  note: string,
): RendererSupportByLanguage => ({
  r: { status: 'partially_supported', note },
  spss18: { status: 'partially_supported', note },
  stata14: { status: 'partially_supported', note },
  python: { status: 'partially_supported', note },
})

function fixtureStep(
  overrides: Pick<CleaningStep, 'id' | 'type' | 'variables' | 'rationale'> &
    Partial<CleaningStep>,
): CleaningStep {
  return {
    parameters: {},
    citationKeys: ['DE_WAAL_2011'],
    severity: 'warning',
    defaultAction: 'flag',
    isAutomatic: true,
    requiresReview: true,
    rendererSupport: supportedEverywhere(),
    ...overrides,
  }
}

const rendererFixtureCitations: Citation[] = [
  {
    key: 'DE_WAAL_2011',
    title: 'Handbook of Statistical Data Editing and Imputation',
    authorOrOrganisation: 'De Waal, Pannekoek and Scholtus',
    year: 2011,
    sourceType: 'book',
    note: 'Renderer golden fixture citation.',
  },
  {
    key: 'RUBIN_1987',
    title: 'Multiple Imputation for Nonresponse in Surveys',
    authorOrOrganisation: 'Rubin',
    year: 1987,
    sourceType: 'book',
    note: 'Renderer golden fixture citation.',
  },
  {
    key: 'IHSN_DDI',
    title: 'DDI metadata guidance',
    authorOrOrganisation: 'IHSN',
    year: 'NEEDS_VERIFICATION',
    sourceType: 'official_guidance',
    note: 'Renderer golden fixture citation.',
  },
]

function makePlan(
  id: string,
  title: string,
  variables: SurveyVariable[],
  steps: CleaningStep[],
): CleaningPlan {
  return {
    id,
    metadata: {
      title,
      description: `${title} renderer golden fixture.`,
      createdAt: fixedGeneratedAt,
      version: '0.4.1-renderer-fixture',
      assumptions: [
        'Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.',
        'Generated syntax must be reviewed before production use and is never executed by the app.',
      ],
    },
    variables,
    steps,
    citations: rendererFixtureCitations,
    capabilityMatrix: {},
  }
}

export function createHouseholdGoldenPlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'household_id',
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'strata',
      label: 'Sampling stratum',
      type: 'geographic_code',
      role: 'stratum',
      storageType: 'string',
    },
    {
      name: 'psu',
      label: 'Primary sampling unit',
      type: 'identifier',
      role: 'psu',
      storageType: 'string',
    },
    {
      name: 'weight',
      label: 'Household survey weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: { min: 0 },
    },
    {
      name: 'age',
      label: 'Age in completed years',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 120 },
      declaredMissingCodes: [
        { value: 98, label: "Don't know", category: 'dont_know' },
        { value: 99, label: 'Refusal', category: 'refusal' },
      ],
    },
    {
      name: 'sex',
      label: 'Sex',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Male' },
        { value: 2, label: 'Female' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'education',
      label: 'Highest education completed',
      type: 'ordinal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Primary' },
        { value: 2, label: 'Secondary' },
        { value: 3, label: 'Tertiary' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'income',
      label: 'Monthly household income',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refusal', category: 'refusal' },
      ],
    },
  ]

  return makePlan(
    'household-golden-plan',
    'Household renderer golden plan',
    variables,
    [
      fixtureStep({
        id: 'household_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale: 'Preserve household survey labels in the analysis dataset.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'household_value_labels',
        type: 'value_label',
        variables: ['sex', 'education'],
        rationale: 'Preserve labelled household categorical codes.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'household_missing_codes',
        type: 'missing_value_declaration',
        variables: ['age', 'sex', 'education', 'income'],
        rationale:
          'Declare nonresponse codes before diagnostics or imputation.',
        defaultAction: 'set_missing',
      }),
      fixtureStep({
        id: 'household_age_range',
        type: 'range_check',
        variables: ['age'],
        parameters: { min: 0, max: 120 },
        rationale: 'Flag impossible age values.',
      }),
      fixtureStep({
        id: 'household_income_range',
        type: 'range_check',
        variables: ['income', 'weight'],
        parameters: { min: 0 },
        rationale: 'Flag negative income or weight values.',
      }),
      fixtureStep({
        id: 'household_sex_domain',
        type: 'domain_check',
        variables: ['sex', 'education'],
        rationale: 'Flag categorical values outside documented labels.',
      }),
      fixtureStep({
        id: 'household_duplicate_id',
        type: 'duplicate_id_check',
        variables: ['household_id'],
        rationale:
          'Flag duplicate household identifiers without deleting records.',
        severity: 'error',
      }),
      fixtureStep({
        id: 'household_income_outlier',
        type: 'outlier_flag',
        variables: ['income'],
        parameters: { method: 'tukey', multiplier: 1.5 },
        rationale: 'Flag unusual income values for review without treatment.',
      }),
      fixtureStep({
        id: 'household_missingness',
        type: 'missingness_diagnosis',
        variables: ['age', 'sex', 'education', 'income'],
        parameters: { createIndicators: true },
        rationale: 'Summarise missingness before any treatment decision.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'household_income_imputation',
        type: 'imputation',
        variables: ['household_id', 'income'],
        parameters: {
          method: 'mice_pmm',
          targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
          predictorVariables: ['age', 'sex', 'education', 'weight'],
          includeStructuralMissing: false,
        },
        rationale: 'Review income imputation while protecting identifiers.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      fixtureStep({
        id: 'household_audit_log',
        type: 'audit_log',
        variables: ['household_id', 'age', 'sex', 'education', 'income'],
        rationale: 'Document generated flags and reviewer decisions.',
        rendererSupport: partiallySupportedEverywhere('Audit guidance only.'),
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'household_summary_report',
        type: 'summary_report',
        variables: ['age', 'sex', 'education', 'income'],
        rationale: 'Produce a basic summary section for reviewer handoff.',
        rendererSupport: partiallySupportedEverywhere('Basic summaries only.'),
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export function createAgricultureGoldenPlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'holding_id',
      label: 'Agricultural holding identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'parcel_area',
      label: 'Parcel area in hectares',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
    },
    {
      name: 'crop_code',
      label: 'Main crop code',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Maize' },
        { value: 2, label: 'Rice' },
        { value: 3, label: 'Sorghum' },
      ],
      declaredMissingCodes: [
        { value: 99, label: 'Unknown crop', category: 'dont_know' },
      ],
    },
    {
      name: 'livestock_count',
      label: 'Number of livestock owned',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0 },
    },
    {
      name: 'irrigation_status',
      label: 'Parcel uses irrigation',
      type: 'binary',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
    },
    {
      name: 'production_qty',
      label: 'Production quantity harvested',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -99, label: 'Not reported', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'sales_value',
      label: 'Value of crop sales',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -99, label: 'Not reported', category: 'item_nonresponse' },
      ],
    },
  ]

  return makePlan(
    'agriculture-golden-plan',
    'Agriculture renderer golden plan',
    variables,
    [
      fixtureStep({
        id: 'ag_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale: 'Preserve agricultural survey labels.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'ag_value_labels',
        type: 'value_label',
        variables: ['crop_code', 'irrigation_status'],
        rationale: 'Preserve categorical agricultural codes.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'ag_missing_codes',
        type: 'missing_value_declaration',
        variables: ['crop_code', 'production_qty', 'sales_value'],
        rationale: 'Declare agricultural nonresponse codes.',
        defaultAction: 'set_missing',
      }),
      fixtureStep({
        id: 'ag_non_negative_ranges',
        type: 'range_check',
        variables: [
          'parcel_area',
          'livestock_count',
          'production_qty',
          'sales_value',
        ],
        parameters: { min: 0 },
        rationale: 'Flag negative agricultural quantities or values.',
      }),
      fixtureStep({
        id: 'ag_categorical_domains',
        type: 'domain_check',
        variables: ['crop_code', 'irrigation_status'],
        rationale: 'Flag crop and irrigation codes outside documented domains.',
      }),
      fixtureStep({
        id: 'ag_duplicate_holding',
        type: 'duplicate_id_check',
        variables: ['holding_id'],
        rationale: 'Flag duplicate holding identifiers.',
        severity: 'error',
      }),
      fixtureStep({
        id: 'ag_sales_consistency',
        type: 'consistency_check',
        variables: ['sales_value', 'production_qty'],
        parameters: { condition: 'sales_value > 0 && production_qty <= 0' },
        rationale:
          'Flag positive sales when no production quantity is reported.',
        rendererSupport: partiallySupportedEverywhere('Simple condition flag.'),
      }),
      fixtureStep({
        id: 'ag_production_outlier',
        type: 'outlier_flag',
        variables: ['production_qty', 'sales_value'],
        parameters: { method: 'mad', threshold: 3.5 },
        rationale: 'Flag unusual production and sales values for review.',
      }),
      fixtureStep({
        id: 'ag_missingness',
        type: 'missingness_diagnosis',
        variables: [
          'parcel_area',
          'crop_code',
          'production_qty',
          'sales_value',
        ],
        parameters: { createIndicators: true },
        rationale: 'Summarise missing agricultural metadata before treatment.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'ag_production_imputation',
        type: 'imputation',
        variables: ['production_qty', 'crop_code'],
        parameters: {
          method: 'mice',
          predictorVariables: [
            'parcel_area',
            'livestock_count',
            'irrigation_status',
          ],
          includeStructuralMissing: false,
        },
        rationale:
          'Review production and crop-code imputation with method warnings.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      fixtureStep({
        id: 'ag_audit_log',
        type: 'audit_log',
        variables: ['holding_id', 'parcel_area', 'crop_code', 'production_qty'],
        rationale: 'Document agricultural flag review.',
        rendererSupport: partiallySupportedEverywhere('Audit guidance only.'),
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'ag_summary_report',
        type: 'summary_report',
        variables: [
          'parcel_area',
          'crop_code',
          'production_qty',
          'sales_value',
        ],
        rationale: 'Produce a basic agricultural summary section.',
        rendererSupport: partiallySupportedEverywhere('Basic summaries only.'),
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export function createStructuralMissingGoldenPlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'person_id',
      label: 'Person identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'age',
      label: 'Age in completed years',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 120 },
    },
    {
      name: 'employment_status',
      label: 'Employment status',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Employed' },
        { value: 2, label: 'Unemployed' },
        { value: 3, label: 'Outside labour force' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'wage_income',
      label: 'Wage income for employed persons',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -99, label: 'Not reported', category: 'item_nonresponse' },
      ],
      structuralMissingRules: [
        {
          id: 'wage_not_employed',
          description: 'Wage income is structurally missing when not employed.',
          condition: 'employment_status != 1',
          dependsOn: ['employment_status'],
        },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'employment_status',
          condition: 'employment_status == 1',
          expectedValues: [1],
          description: 'Wage income is asked only for employed persons.',
        },
      ],
    },
    {
      name: 'school_attendance',
      label: 'Currently attending school',
      type: 'binary',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'age',
          condition: '(age >= 6) && (age <= 24)',
          description: 'School attendance is asked for the relevant age group.',
        },
      ],
    },
    {
      name: 'reason_not_working',
      label: 'Reason not working',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Seeking work' },
        { value: 2, label: 'Student' },
        { value: 3, label: 'Family care' },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'employment_status',
          condition: 'employment_status != 1',
          description: 'Reason not working is asked only if not employed.',
        },
      ],
    },
  ]

  return makePlan(
    'structural-missing-golden-plan',
    'Structural missing renderer golden plan',
    variables,
    [
      fixtureStep({
        id: 'struct_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale: 'Preserve labels for skip-pattern review.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'struct_value_labels',
        type: 'value_label',
        variables: [
          'employment_status',
          'school_attendance',
          'reason_not_working',
        ],
        rationale: 'Preserve routing-category labels.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'struct_missing_codes',
        type: 'missing_value_declaration',
        variables: ['employment_status', 'wage_income'],
        rationale: 'Declare nonresponse before routing checks.',
        defaultAction: 'set_missing',
      }),
      fixtureStep({
        id: 'struct_age_range',
        type: 'range_check',
        variables: ['age'],
        parameters: { min: 0, max: 120 },
        rationale: 'Flag impossible ages before age-based routing checks.',
      }),
      fixtureStep({
        id: 'struct_employment_domain',
        type: 'domain_check',
        variables: [
          'employment_status',
          'school_attendance',
          'reason_not_working',
        ],
        rationale:
          'Flag categorical routing variables outside documented domains.',
      }),
      fixtureStep({
        id: 'struct_duplicate_person',
        type: 'duplicate_id_check',
        variables: ['person_id'],
        rationale: 'Flag duplicate person identifiers.',
        severity: 'error',
      }),
      fixtureStep({
        id: 'struct_wage_structural_missing',
        type: 'structural_missing_check',
        variables: ['wage_income', 'employment_status'],
        parameters: { condition: 'employment_status != 1' },
        rationale:
          'Protect wage income structural missingness for non-employed persons.',
        rendererSupport: partiallySupportedEverywhere('Simple condition flag.'),
      }),
      fixtureStep({
        id: 'struct_wage_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['wage_income', 'employment_status'],
        parameters: { condition: 'employment_status == 1' },
        rationale: 'Flag wage income present outside the employed route.',
        rendererSupport: partiallySupportedEverywhere('Simple routing flag.'),
      }),
      fixtureStep({
        id: 'struct_school_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['school_attendance', 'age'],
        parameters: { condition: '(age >= 6) && (age <= 24)' },
        rationale:
          'Flag school attendance values outside the relevant age group.',
        rendererSupport: partiallySupportedEverywhere('Simple routing flag.'),
      }),
      fixtureStep({
        id: 'struct_reason_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['reason_not_working', 'employment_status'],
        parameters: { condition: 'employment_status != 1' },
        rationale: 'Flag reason-not-working values for employed persons.',
        rendererSupport: partiallySupportedEverywhere('Simple routing flag.'),
      }),
      fixtureStep({
        id: 'struct_missingness',
        type: 'missingness_diagnosis',
        variables: [
          'employment_status',
          'wage_income',
          'school_attendance',
          'reason_not_working',
        ],
        parameters: { createIndicators: true },
        rationale:
          'Summarise item and structural missingness before treatment.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'struct_wage_imputation',
        type: 'imputation',
        variables: ['person_id', 'wage_income', 'school_attendance'],
        parameters: {
          method: 'mice',
          predictorVariables: ['age', 'employment_status'],
          targetMissingness: ['item_nonresponse', 'structural'],
          includeStructuralMissing: true,
        },
        rationale:
          'Show that identifiers and structural missingness are blocked from imputation examples.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      fixtureStep({
        id: 'struct_audit_log',
        type: 'audit_log',
        variables: [
          'person_id',
          'wage_income',
          'school_attendance',
          'reason_not_working',
        ],
        rationale: 'Document routing flags and reviewer decisions.',
        rendererSupport: partiallySupportedEverywhere('Audit guidance only.'),
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      fixtureStep({
        id: 'struct_summary_report',
        type: 'summary_report',
        variables: [
          'employment_status',
          'wage_income',
          'school_attendance',
          'reason_not_working',
        ],
        rationale: 'Produce a basic structural-missing summary section.',
        rendererSupport: partiallySupportedEverywhere('Basic summaries only.'),
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}
