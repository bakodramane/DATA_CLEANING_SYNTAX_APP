import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
} from '../cleaning-plan'
import type {
  RendererCapabilityMatrix,
  RendererSupportByLanguage,
} from '../models'

const supportedEverywhere = (): RendererSupportByLanguage => ({
  spss18: { status: 'supported' },
  stata14: { status: 'supported' },
  r: { status: 'supported' },
  python: { status: 'supported' },
})

const sampleCapabilityMatrix: RendererCapabilityMatrix<CleaningStepType> = {
  range_check: supportedEverywhere(),
  domain_check: supportedEverywhere(),
  outlier_flag: {
    spss18: {
      status: 'partially_supported',
      note: 'Generate transparent flag syntax; no dedicated robust outlier package is assumed.',
    },
    stata14: { status: 'supported' },
    r: { status: 'supported' },
    python: { status: 'supported' },
  },
  missingness_diagnosis: supportedEverywhere(),
  imputation: {
    spss18: {
      status: 'partially_supported',
      note: 'Multiple imputation depends on module availability in SPSS v18.',
    },
    stata14: { status: 'supported' },
    r: { status: 'supported' },
    python: {
      status: 'partially_supported',
      note: 'Python examples must distinguish practical imputation from pooled MI inference.',
    },
  },
  audit_log: supportedEverywhere(),
  summary_report: supportedEverywhere(),
}

const commonStepFields: Pick<
  CleaningStep,
  | 'citationKeys'
  | 'severity'
  | 'isAutomatic'
  | 'requiresReview'
  | 'rendererSupport'
> = {
  citationKeys: ['de-waal-2011'],
  severity: 'warning',
  isAutomatic: true,
  requiresReview: true,
  rendererSupport: supportedEverywhere(),
}

export const sampleCleaningPlan: CleaningPlan = {
  id: 'sample-household-survey-plan',
  metadata: {
    title: 'Sample household survey cleaning plan',
    description:
      'Small household survey-style fixture used to test the core Cleaning Plan model.',
    createdAt: '2026-05-30T00:00:00.000Z',
    version: '0.1.0',
    assumptions: [
      'The plan describes metadata and rules only; it does not contain survey microdata.',
      'Structural missing income values for people outside employment are protected from imputation.',
    ],
  },
  variables: [
    {
      name: 'household_id',
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
      sourceMetadata: {
        sourceName: 'sample household dictionary',
        sourceType: 'manual',
        columnName: 'household_id',
      },
      userNotes: 'Primary household-level identifier.',
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
      label: 'Final household survey weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: {
        min: 0,
        inclusiveMin: false,
      },
    },
    {
      name: 'age',
      label: 'Age in completed years',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: {
        min: 0,
        max: 120,
        inclusiveMin: true,
        inclusiveMax: true,
        unit: 'years',
      },
      declaredMissingCodes: [
        { value: 98, label: "Don't know", category: 'dont_know' },
        { value: 99, label: 'Refusal', category: 'refusal' },
      ],
    },
    {
      name: 'sex',
      label: 'Sex of household member',
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
      name: 'education_level',
      label: 'Highest education level completed',
      type: 'ordinal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No schooling' },
        { value: 1, label: 'Primary' },
        { value: 2, label: 'Lower secondary' },
        { value: 3, label: 'Upper secondary' },
        { value: 4, label: 'Tertiary' },
      ],
      declaredMissingCodes: [
        { value: 98, label: "Don't know", category: 'dont_know' },
        { value: 99, label: 'Refusal', category: 'refusal' },
      ],
    },
    {
      name: 'income',
      label: 'Monthly employment income',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: {
        min: 0,
        inclusiveMin: true,
      },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refusal', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'income_not_applicable_not_employed',
          description:
            'Income is structurally missing for respondents who are not employed.',
          condition: 'employment_status != 1',
          dependsOn: ['employment_status'],
        },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'employment_status',
          condition: 'employment_status == 1',
          expectedValues: [1],
          description:
            'Income should only be asked for currently employed respondents.',
        },
      ],
    },
    {
      name: 'employment_status',
      label: 'Current employment status',
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
  ],
  steps: [
    {
      ...commonStepFields,
      id: 'step_age_range',
      type: 'range_check',
      variables: ['age'],
      parameters: { min: 0, max: 120 },
      rationale:
        'Age values outside 0 to 120 years should be flagged for review before any treatment.',
      defaultAction: 'flag',
    },
    {
      ...commonStepFields,
      id: 'step_sex_domain',
      type: 'domain_check',
      variables: ['sex'],
      parameters: { allowedValues: [1, 2, 9] },
      rationale:
        'Sex codes should match the declared value labels and missing-value code.',
      defaultAction: 'flag',
    },
    {
      ...commonStepFields,
      id: 'step_income_structural_missing',
      type: 'structural_missing_check',
      variables: ['income', 'employment_status'],
      parameters: {
        ruleId: 'income_not_applicable_not_employed',
        condition: 'employment_status != 1',
      },
      rationale:
        'Income is not applicable for people who are not employed and should be distinguished from item nonresponse.',
      defaultAction: 'flag',
    },
    {
      ...commonStepFields,
      id: 'step_income_outlier_mad',
      type: 'outlier_flag',
      variables: ['income'],
      parameters: { method: 'mad', threshold: 3.5 },
      rationale:
        'Robust outlier flags help reviewers inspect extreme income values without deleting them.',
      citationKeys: ['rousseeuw-croux-1993'],
      defaultAction: 'flag',
      rendererSupport:
        sampleCapabilityMatrix.outlier_flag ?? supportedEverywhere(),
    },
    {
      ...commonStepFields,
      id: 'step_income_missingness',
      type: 'missingness_diagnosis',
      variables: ['income'],
      parameters: { distinguishStructuralMissing: true },
      rationale:
        'Missingness diagnosis should separate item nonresponse from legitimate structural missingness.',
      citationKeys: ['little-rubin-2019'],
      defaultAction: 'no_action',
    },
    {
      ...commonStepFields,
      id: 'step_income_imputation_review',
      type: 'imputation',
      variables: ['income'],
      parameters: {
        method: 'mice',
        targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
        includeStructuralMissing: false,
      },
      rationale:
        'Imputation may be reviewed for item nonresponse income values, while structural missing values remain protected.',
      citationKeys: ['rubin-1987', 'van-buuren-2018'],
      defaultAction: 'impute',
      isAutomatic: false,
      rendererSupport:
        sampleCapabilityMatrix.imputation ?? supportedEverywhere(),
    },
    {
      ...commonStepFields,
      id: 'step_audit_log',
      type: 'audit_log',
      variables: [
        'household_id',
        'age',
        'sex',
        'education_level',
        'income',
        'employment_status',
      ],
      parameters: { createFlagSummary: true },
      rationale:
        'Audit fields document generated flags and reviewer decisions without overwriting source values.',
      defaultAction: 'derive',
    },
    {
      ...commonStepFields,
      id: 'step_summary_report',
      type: 'summary_report',
      variables: [
        'age',
        'sex',
        'education_level',
        'income',
        'employment_status',
      ],
      parameters: { includeAssumptions: true, includeWarnings: true },
      rationale:
        'A plain-language summary report supports official survey documentation.',
      defaultAction: 'no_action',
    },
  ] satisfies CleaningStep[],
  citations: [
    {
      key: 'de-waal-2011',
      title: 'Handbook of Statistical Data Editing and Imputation',
      authorOrOrganisation: 'De Waal, Pannekoek and Scholtus',
      year: 2011,
      sourceType: 'book',
      note: 'Bibliographic details to be verified in docs/references.md.',
    },
    {
      key: 'little-rubin-2019',
      title: 'Statistical Analysis with Missing Data',
      authorOrOrganisation: 'Little and Rubin',
      year: 2019,
      sourceType: 'book',
      note: 'Bibliographic details to be verified in docs/references.md.',
    },
    {
      key: 'rousseeuw-croux-1993',
      title: 'Alternatives to the Median Absolute Deviation',
      authorOrOrganisation: 'Rousseeuw and Croux',
      year: 1993,
      sourceType: 'journal_article',
      note: 'Bibliographic details to be verified in docs/references.md.',
    },
    {
      key: 'rubin-1987',
      title: 'Multiple Imputation for Nonresponse in Surveys',
      authorOrOrganisation: 'Rubin',
      year: 1987,
      sourceType: 'book',
      note: 'Bibliographic details to be verified in docs/references.md.',
    },
    {
      key: 'van-buuren-2018',
      title: 'Flexible Imputation of Missing Data',
      authorOrOrganisation: 'Van Buuren',
      year: 2018,
      sourceType: 'book',
      note: 'Bibliographic details to be verified in docs/references.md.',
    },
  ],
  capabilityMatrix: sampleCapabilityMatrix,
  notes: ['Sample fixture for unit tests and future renderer golden tests.'],
}
