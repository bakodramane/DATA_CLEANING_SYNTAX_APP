import type {
  CleaningPlan,
  CleaningStep,
  CleaningStepType,
} from '../cleaning-plan'
import type {
  Citation,
  RendererCapabilityMatrix,
  RendererSupportByLanguage,
  SurveyVariable,
} from '../models'

export type OfficialStatisticsDemoDictionaryId =
  | 'householdLabourSurvey'
  | 'agriculturalHoldingSurvey'
  | 'livestockCropModule'
  | 'incomeExpenditureModule'

export interface OfficialStatisticsDemoDictionary {
  id: OfficialStatisticsDemoDictionaryId
  label: string
  description: string
  csv: string
}

export const householdLabourSurveyDictionaryCsv = [
  'variable_name,variable_label,data_type,role,value_labels,missing_codes,valid_min,valid_max,skip_pattern,notes,module',
  'household_id,Household identifier,identifier,identifier,,,,,,Synthetic ID; not from real microdata,Cover sheet',
  'person_id,Person roster identifier,identifier,identifier,,,,,,Unique within synthetic household roster,Person roster',
  'strata,Sampling stratum,geographic_code,stratum,,,,,,Synthetic stratum code,Sample design',
  'psu,Primary sampling unit,identifier,psu,,,,,,Synthetic PSU code,Sample design',
  'person_weight,Final person weight,weight,weight,,,0,,,Do not edit without survey sampling review,Weights',
  "age,Age in completed years,count,analysis,,-98=Don't know; -99=Refused,0,120,,Roster age,Person roster",
  'sex,Sex of household member,nominal,analysis,1=Male; 2=Female,9=Not stated,,,,Roster sex,Person roster',
  'labour_force_status,Labour force status,nominal,analysis,1=Employed; 2=Unemployed; 3=Outside labour force; 4=Below working age,9=Not stated,,,,Derived from labour module,Labour',
  'employment_status,Current employment status,nominal,analysis,1=Employee; 2=Own-account worker; 3=Employer; 4=Contributing family worker; 5=Not employed,9=Not stated,,,,Asked for working-age persons,Labour',
  "hours_worked_week,Hours worked last week,count,analysis,,-98=Don't know; -99=Refused,0,168,employment_status in 1..4,Structurally missing when not employed,Labour",
  "wage_income_month,Monthly wage income,numeric,analysis,,-98=Don't know; -99=Refused,0,,employment_status == 1,Structurally missing unless employee,Labour",
].join('\n')

export const agriculturalHoldingSurveyDictionaryCsv = [
  'variable_name,variable_label,data_type,role,value_labels,missing_codes,valid_min,valid_max,skip_pattern,notes,module',
  'holding_id,Agricultural holding identifier,identifier,identifier,,,,,,Synthetic holding ID,Holding roster',
  'region_code,Administrative region code,geographic_code,analysis,1=North; 2=Central; 3=South,99=Not stated,,,,Synthetic region classification,Geography',
  'holding_stratum,Survey holding stratum,geographic_code,stratum,,,,,,Design stratum,Sample design',
  'holding_weight,Final holding weight,weight,weight,,,0,,,Do not edit without sampling review,Weights',
  'holder_sex,Sex of holder,nominal,analysis,1=Male; 2=Female; 3=Joint holders,9=Not stated,,,,Holder characteristics,Holding roster',
  "total_area_ha,Total holding area in hectares,numeric,analysis,,-98=Don't know; -99=Refused,0,,,Includes operated agricultural land,Land",
  'parcel_count,Number of parcels operated,count,analysis,,-99=Not reported,0,200,,Synthetic upper bound for review,Land',
  'irrigation_used,Any irrigation used,nominal,analysis,0=No; 1=Yes,9=Not stated,,,,Holding-level irrigation indicator,Land',
  'main_crop_code,Main crop code,nominal,analysis,1=Maize; 2=Rice; 3=Sorghum; 4=Vegetables; 5=Fruit,99=Unknown crop,,,,Crop reported by area,Crops',
  "production_kg,Harvested production quantity kilograms,numeric,analysis,,-98=Don't know; -99=Refused,0,,main_crop_code not missing,Structurally missing when no crop is reported,Crops",
  "sales_value_lcu,Value of crop sales in local currency,numeric,analysis,,-98=Don't know; -99=Refused,0,,production_kg > 0,Applicable only when production was harvested,Crops",
].join('\n')

export const livestockCropModuleDictionaryCsv = [
  'variable_name,variable_label,data_type,role,value_labels,missing_codes,valid_min,valid_max,skip_pattern,notes,module',
  'holding_id,Agricultural holding identifier,identifier,identifier,,,,,,Synthetic holding ID,Holding roster',
  'module_weight,Final module analysis weight,weight,weight,,,0,,,Do not edit without sampling review,Weights',
  'livestock_module_applicable,Livestock module applicable,nominal,analysis,0=No livestock; 1=Livestock keeper,9=Not stated,,,,Routing variable,Livestock',
  "cattle_count,Number of cattle owned,count,analysis,,-98=Don't know; -99=Refused,0,500,livestock_module_applicable == 1,Structurally missing for non-keepers,Livestock",
  "small_ruminant_count,Number of sheep and goats,count,analysis,,-98=Don't know; -99=Refused,0,1000,livestock_module_applicable == 1,Structurally missing for non-keepers,Livestock",
  "poultry_count,Number of poultry owned,count,analysis,,-98=Don't know; -99=Refused,0,5000,livestock_module_applicable == 1,Structurally missing for non-keepers,Livestock",
  'cultivated_maize,Cultivated maize during reference season,nominal,analysis,0=No; 1=Yes,9=Not stated,,,,Routing variable,Crops',
  "maize_area_ha,Maize area planted in hectares,numeric,analysis,,-98=Don't know; -99=Refused,0,,cultivated_maize == 1,Structurally missing when maize not cultivated,Crops",
  "maize_harvest_kg,Maize harvest quantity kilograms,numeric,analysis,,-98=Don't know; -99=Refused,0,,cultivated_maize == 1,Applicable only for maize growers,Crops",
  'fertilizer_used_maize,Fertilizer used on maize,nominal,analysis,0=No; 1=Yes,9=Not stated,,,cultivated_maize == 1,Applicable only for maize growers,Crops',
  'crop_sales_channel,Main sales channel for crop output,nominal,analysis,1=Farm gate; 2=Local market; 3=Cooperative; 4=Processor; 5=No sales,9=Not stated,,,maize_harvest_kg > 0,Review if sales channel is present with no harvest,Crops',
].join('\n')

export const incomeExpenditureModuleDictionaryCsv = [
  'variable_name,variable_label,data_type,role,value_labels,missing_codes,valid_min,valid_max,skip_pattern,notes,module',
  'household_id,Household identifier,identifier,identifier,,,,,,Synthetic household ID,Cover sheet',
  'hh_weight,Final household weight,weight,weight,,,0,,,Do not edit without sampling review,Weights',
  'received_wage_income,Any wage income received,nominal,analysis,0=No; 1=Yes,9=Not stated,,,,Routing variable,Income',
  "wage_income_month,Monthly household wage income,numeric,analysis,,-98=Don't know; -99=Refused,0,,received_wage_income == 1,Structural missing when no wage income,Income",
  'received_remittances,Any remittances received,nominal,analysis,0=No; 1=Yes,9=Not stated,,,,Routing variable,Income',
  "remittance_value_month,Monthly remittance value,numeric,analysis,,-98=Don't know; -99=Refused,0,,received_remittances == 1,Structural missing when no remittances,Income",
  'own_dwelling,Household owns dwelling,nominal,analysis,0=No; 1=Yes; 2=Occupied free,9=Not stated,,,,Routing variable,Housing',
  "rent_paid_month,Monthly rent paid,numeric,analysis,,-98=Don't know; -99=Refused,0,,own_dwelling == 0,Structural missing for owners and free occupants,Housing",
  "food_expenditure_week,Food expenditure last 7 days,numeric,analysis,,-98=Don't know; -99=Refused; -97=Not purchased,0,,,Declared not-purchased code must be reviewed before treatment,Expenditure",
  "health_expenditure_month,Health expenditure last month,numeric,analysis,,-98=Don't know; -99=Refused; -97=No expenditure,0,,,No-expenditure code is analytically different from nonresponse,Expenditure",
  "total_expenditure_month,Total household expenditure last month,numeric,analysis,,-98=Don't know; -99=Refused,0,,,Should be checked against component expenditures,Expenditure",
].join('\n')

export const officialStatisticsDemoDictionaries: OfficialStatisticsDemoDictionary[] =
  [
    {
      id: 'householdLabourSurvey',
      label: 'Household and labour survey',
      description:
        'Person-level household/labour metadata with design variables, routing, wages, and nonresponse codes.',
      csv: householdLabourSurveyDictionaryCsv,
    },
    {
      id: 'agriculturalHoldingSurvey',
      label: 'Agricultural holding survey',
      description:
        'Holding-level metadata with land, crop, production, sales, design variables, and review ranges.',
      csv: agriculturalHoldingSurveyDictionaryCsv,
    },
    {
      id: 'livestockCropModule',
      label: 'Livestock and crop module',
      description:
        'Module-level crop and livestock metadata with applicability routes and structural missingness.',
      csv: livestockCropModuleDictionaryCsv,
    },
    {
      id: 'incomeExpenditureModule',
      label: 'Income and expenditure module',
      description:
        'Household income/expenditure metadata with declared missing codes and skip-pattern examples.',
      csv: incomeExpenditureModuleDictionaryCsv,
    },
  ]

const supportedEverywhere = (): RendererSupportByLanguage => ({
  spss18: { status: 'supported' },
  stata14: { status: 'supported' },
  r: { status: 'supported' },
  python: { status: 'supported' },
})

const partialEverywhere = (note: string): RendererSupportByLanguage => ({
  spss18: { status: 'partially_supported', note },
  stata14: { status: 'partially_supported', note },
  r: { status: 'partially_supported', note },
  python: { status: 'partially_supported', note },
})

const capabilityMatrix: RendererCapabilityMatrix<CleaningStepType> = {
  variable_label: supportedEverywhere(),
  value_label: supportedEverywhere(),
  missing_value_declaration: supportedEverywhere(),
  range_check: supportedEverywhere(),
  domain_check: supportedEverywhere(),
  structural_missing_check: partialEverywhere(
    'Rendered as reviewer-facing flags; routing decisions remain statistical review tasks.',
  ),
  skip_pattern_check: partialEverywhere(
    'Rendered as simple routing flags when the example supplies an explicit condition.',
  ),
  consistency_check: partialEverywhere(
    'Rendered as a simple reviewer flag; the app does not reconcile records automatically.',
  ),
  duplicate_id_check: supportedEverywhere(),
  outlier_flag: {
    spss18: {
      status: 'partially_supported',
      note: 'SPSS v18 output uses transparent review templates for robust flags.',
    },
    stata14: { status: 'supported' },
    r: { status: 'supported' },
    python: { status: 'supported' },
  },
  missingness_diagnosis: supportedEverywhere(),
  imputation: {
    spss18: {
      status: 'partially_supported',
      note: 'SPSS multiple imputation requires licensed functionality and analyst review.',
    },
    stata14: { status: 'supported' },
    r: { status: 'supported' },
    python: {
      status: 'partially_supported',
      note: 'Python examples are practical imputation templates, not pooled MI inference.',
    },
  },
  audit_log: partialEverywhere('Audit guidance only.'),
  summary_report: partialEverywhere('Basic summaries only.'),
}

const citations: Citation[] = [
  {
    key: 'DE_WAAL_2011',
    title: 'Handbook of Statistical Data Editing and Imputation',
    authorOrOrganisation: 'De Waal, Pannekoek and Scholtus',
    year: 2011,
    sourceType: 'book',
    note: 'Official-statistics example citation.',
  },
  {
    key: 'RUBIN_1987',
    title: 'Multiple Imputation for Nonresponse in Surveys',
    authorOrOrganisation: 'Rubin',
    year: 1987,
    sourceType: 'book',
    note: 'Official-statistics example citation.',
  },
  {
    key: 'LITTLE_RUBIN_2019',
    title: 'Statistical Analysis with Missing Data',
    authorOrOrganisation: 'Little and Rubin',
    year: 2019,
    sourceType: 'book',
    note: 'Official-statistics example citation.',
  },
]

function exampleStep(
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
    rendererSupport: capabilityMatrix[overrides.type] ?? supportedEverywhere(),
    ...overrides,
  }
}

function makeExamplePlan(
  id: string,
  title: string,
  description: string,
  variables: SurveyVariable[],
  steps: CleaningStep[],
): CleaningPlan {
  return {
    id,
    metadata: {
      title,
      description,
      createdAt: '2026-06-03T00:00:00.000Z',
      version: '0.4.2-phase-16-example',
      assumptions: [
        'The example is synthetic and contains metadata only; it is not based on real survey microdata.',
        'Generated syntax is a review draft and must be checked by survey statisticians before production use.',
        'Structural missingness, identifiers, weights, strata, and PSUs are protected from imputation-style treatment.',
      ],
    },
    variables,
    steps,
    citations,
    capabilityMatrix,
    notes: [
      'Official-statistics demonstration fixture for methodology review and renderer regression tests.',
    ],
  }
}

export function createHouseholdLabourExamplePlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'household_id',
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'person_id',
      label: 'Person roster identifier',
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
      name: 'person_weight',
      label: 'Final person weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: { min: 0, inclusiveMin: false },
    },
    {
      name: 'age',
      label: 'Age in completed years',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 120, inclusiveMin: true, inclusiveMax: true },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'production_no_crop_reported',
          description:
            'Production is structurally missing when no valid main crop is reported.',
          condition: 'main_crop_code == 99',
          dependsOn: ['main_crop_code'],
        },
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
      name: 'labour_force_status',
      label: 'Labour force status',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Employed' },
        { value: 2, label: 'Unemployed' },
        { value: 3, label: 'Outside labour force' },
        { value: 4, label: 'Below working age' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'employment_status',
      label: 'Current employment status',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Employee' },
        { value: 2, label: 'Own-account worker' },
        { value: 3, label: 'Employer' },
        { value: 4, label: 'Contributing family worker' },
        { value: 5, label: 'Not employed' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'hours_worked_week',
      label: 'Hours worked last week',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 168 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'hours_not_employed',
          description:
            'Hours worked is structurally missing when not employed.',
          condition: 'employment_status == 5',
          dependsOn: ['employment_status'],
        },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'employment_status',
          condition:
            'employment_status == 1 || employment_status == 2 || employment_status == 3 || employment_status == 4',
          expectedValues: [1, 2, 3, 4],
          description: 'Hours worked is asked only for employed respondents.',
        },
      ],
    },
    {
      name: 'wage_income_month',
      label: 'Monthly wage income',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'wage_not_employee',
          description:
            'Wage income is structurally missing unless the person is an employee.',
          condition: 'employment_status != 1',
          dependsOn: ['employment_status'],
        },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'employment_status',
          condition: 'employment_status == 1',
          expectedValues: [1],
          description: 'Wage income is asked only for employees.',
        },
      ],
    },
  ]

  return makeExamplePlan(
    'phase16-household-labour-plan',
    'Synthetic household and labour survey Cleaning Plan',
    'Review-oriented example for household roster, labour routing, wage income, and survey design variables.',
    variables,
    [
      exampleStep({
        id: 'hh_labour_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale:
          'Preserve labels from the synthetic household/labour codebook.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'hh_labour_value_labels',
        type: 'value_label',
        variables: ['sex', 'labour_force_status', 'employment_status'],
        rationale: 'Preserve categorical labels used in labour routing review.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'hh_labour_missing_codes',
        type: 'missing_value_declaration',
        variables: [
          'age',
          'sex',
          'labour_force_status',
          'employment_status',
          'hours_worked_week',
          'wage_income_month',
        ],
        rationale:
          'Declare nonresponse codes before diagnostics and imputation review.',
        defaultAction: 'set_missing',
      }),
      exampleStep({
        id: 'hh_labour_range_checks',
        type: 'range_check',
        variables: [
          'person_weight',
          'age',
          'hours_worked_week',
          'wage_income_month',
        ],
        parameters: { min: 0 },
        rationale:
          'Flag impossible negative values and values outside documented limits.',
      }),
      exampleStep({
        id: 'hh_labour_domain_checks',
        type: 'domain_check',
        variables: ['sex', 'labour_force_status', 'employment_status'],
        rationale: 'Flag codes outside documented labour-module domains.',
      }),
      exampleStep({
        id: 'hh_labour_duplicate_person',
        type: 'duplicate_id_check',
        variables: ['person_id'],
        rationale:
          'Flag duplicate person identifiers without deleting records.',
        severity: 'error',
      }),
      exampleStep({
        id: 'hh_labour_wage_structural_missing',
        type: 'structural_missing_check',
        variables: ['wage_income_month', 'employment_status'],
        parameters: { condition: 'employment_status != 1' },
        rationale:
          'Protect wage-income structural missingness for non-employees.',
      }),
      exampleStep({
        id: 'hh_labour_hours_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['hours_worked_week', 'employment_status'],
        parameters: {
          condition:
            'employment_status == 1 || employment_status == 2 || employment_status == 3 || employment_status == 4',
        },
        rationale:
          'Flag hours-worked values outside the employed-person route.',
      }),
      exampleStep({
        id: 'hh_labour_wage_outlier',
        type: 'outlier_flag',
        variables: ['wage_income_month'],
        parameters: { method: 'mad', threshold: 3.5 },
        rationale:
          'Flag unusually high wage income values for review, without deletion or capping.',
      }),
      exampleStep({
        id: 'hh_labour_missingness',
        type: 'missingness_diagnosis',
        variables: ['age', 'hours_worked_week', 'wage_income_month'],
        parameters: {
          createIndicators: true,
          distinguishStructuralMissing: true,
        },
        rationale: 'Summarise nonresponse separately from valid routing skips.',
        citationKeys: ['LITTLE_RUBIN_2019'],
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'hh_labour_wage_imputation_review',
        type: 'imputation',
        variables: ['wage_income_month'],
        parameters: {
          method: 'mice_pmm',
          predictorVariables: [
            'age',
            'sex',
            'hours_worked_week',
            'person_weight',
          ],
          targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
          includeStructuralMissing: false,
        },
        rationale:
          'Provide review syntax for item nonresponse only; structural missing wages remain protected.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      exampleStep({
        id: 'hh_labour_audit_log',
        type: 'audit_log',
        variables: [
          'person_id',
          'age',
          'employment_status',
          'wage_income_month',
        ],
        rationale:
          'Document flags and reviewer decisions for survey processing records.',
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      exampleStep({
        id: 'hh_labour_summary_report',
        type: 'summary_report',
        variables: [
          'age',
          'employment_status',
          'hours_worked_week',
          'wage_income_month',
        ],
        rationale: 'Produce summary evidence for reviewer handoff.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export function createAgriculturalHoldingExamplePlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'holding_id',
      label: 'Agricultural holding identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'region_code',
      label: 'Administrative region code',
      type: 'geographic_code',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'North' },
        { value: 2, label: 'Central' },
        { value: 3, label: 'South' },
      ],
      declaredMissingCodes: [
        { value: 99, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'holding_stratum',
      label: 'Survey holding stratum',
      type: 'geographic_code',
      role: 'stratum',
      storageType: 'string',
    },
    {
      name: 'holding_weight',
      label: 'Final holding weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: { min: 0 },
    },
    {
      name: 'holder_sex',
      label: 'Sex of holder',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Male' },
        { value: 2, label: 'Female' },
        { value: 3, label: 'Joint holders' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'total_area_ha',
      label: 'Total holding area in hectares',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
    {
      name: 'parcel_count',
      label: 'Number of parcels operated',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 200 },
      declaredMissingCodes: [
        { value: -99, label: 'Not reported', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'irrigation_used',
      label: 'Any irrigation used',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'main_crop_code',
      label: 'Main crop code',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Maize' },
        { value: 2, label: 'Rice' },
        { value: 3, label: 'Sorghum' },
        { value: 4, label: 'Vegetables' },
        { value: 5, label: 'Fruit' },
      ],
      declaredMissingCodes: [
        { value: 99, label: 'Unknown crop', category: 'dont_know' },
      ],
    },
    {
      name: 'production_kg',
      label: 'Harvested production quantity kilograms',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
    {
      name: 'sales_value_lcu',
      label: 'Value of crop sales in local currency',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      skipPatternDependencies: [
        {
          sourceVariable: 'production_kg',
          condition: 'production_kg > 0',
          description:
            'Crop sales value applies when production was harvested.',
        },
      ],
    },
  ]

  return makeExamplePlan(
    'phase16-agricultural-holding-plan',
    'Synthetic agricultural holding survey Cleaning Plan',
    'Review-oriented example for agricultural holdings, crop production, sales, and design variables.',
    variables,
    [
      exampleStep({
        id: 'ag_hold_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale:
          'Preserve labels from the synthetic agricultural holding codebook.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'ag_hold_value_labels',
        type: 'value_label',
        variables: [
          'region_code',
          'holder_sex',
          'irrigation_used',
          'main_crop_code',
        ],
        rationale: 'Preserve holding and crop categorical labels.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'ag_hold_missing_codes',
        type: 'missing_value_declaration',
        variables: [
          'region_code',
          'holder_sex',
          'total_area_ha',
          'parcel_count',
          'irrigation_used',
          'main_crop_code',
          'production_kg',
          'sales_value_lcu',
        ],
        rationale: 'Declare holding-survey nonresponse codes before review.',
        defaultAction: 'set_missing',
      }),
      exampleStep({
        id: 'ag_hold_nonnegative_ranges',
        type: 'range_check',
        variables: [
          'holding_weight',
          'total_area_ha',
          'parcel_count',
          'production_kg',
          'sales_value_lcu',
        ],
        parameters: { min: 0 },
        rationale: 'Flag negative land, production, weight, or sales values.',
      }),
      exampleStep({
        id: 'ag_hold_domains',
        type: 'domain_check',
        variables: [
          'region_code',
          'holder_sex',
          'irrigation_used',
          'main_crop_code',
        ],
        rationale: 'Flag agricultural categorical values outside the codebook.',
      }),
      exampleStep({
        id: 'ag_hold_duplicate_id',
        type: 'duplicate_id_check',
        variables: ['holding_id'],
        rationale:
          'Flag duplicate holding identifiers without deleting records.',
        severity: 'error',
      }),
      exampleStep({
        id: 'ag_hold_sales_consistency',
        type: 'consistency_check',
        variables: ['production_kg', 'sales_value_lcu'],
        parameters: { condition: 'sales_value_lcu > 0 && production_kg <= 0' },
        rationale:
          'Flag positive sales when no production quantity is reported.',
      }),
      exampleStep({
        id: 'ag_hold_production_structural_missing',
        type: 'structural_missing_check',
        variables: ['production_kg', 'main_crop_code'],
        parameters: { condition: 'main_crop_code == 99' },
        rationale:
          'Protect production structural missingness when no valid main crop is reported.',
      }),
      exampleStep({
        id: 'ag_hold_sales_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['sales_value_lcu', 'production_kg'],
        parameters: { condition: 'production_kg > 0' },
        rationale: 'Flag sales values outside the production route.',
      }),
      exampleStep({
        id: 'ag_hold_production_outlier',
        type: 'outlier_flag',
        variables: ['production_kg', 'sales_value_lcu'],
        parameters: { method: 'tukey', multiplier: 1.5 },
        rationale:
          'Flag unusual production or sales values for subject-matter review.',
      }),
      exampleStep({
        id: 'ag_hold_missingness',
        type: 'missingness_diagnosis',
        variables: [
          'total_area_ha',
          'main_crop_code',
          'production_kg',
          'sales_value_lcu',
        ],
        parameters: { createIndicators: true },
        rationale:
          'Summarise holding-survey missingness before treatment decisions.',
        citationKeys: ['LITTLE_RUBIN_2019'],
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'ag_hold_production_imputation_review',
        type: 'imputation',
        variables: ['production_kg', 'sales_value_lcu'],
        parameters: {
          method: 'mice',
          predictorVariables: [
            'total_area_ha',
            'parcel_count',
            'irrigation_used',
            'holding_weight',
          ],
          targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
          includeStructuralMissing: false,
        },
        rationale:
          'Provide review syntax for item nonresponse in production and sales variables.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      exampleStep({
        id: 'ag_hold_audit_log',
        type: 'audit_log',
        variables: [
          'holding_id',
          'total_area_ha',
          'main_crop_code',
          'production_kg',
          'sales_value_lcu',
        ],
        rationale:
          'Document flags and edits for agricultural survey processing.',
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      exampleStep({
        id: 'ag_hold_summary_report',
        type: 'summary_report',
        variables: [
          'total_area_ha',
          'parcel_count',
          'production_kg',
          'sales_value_lcu',
        ],
        rationale:
          'Produce summary evidence for agricultural reviewer handoff.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export function createLivestockCropExamplePlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'holding_id',
      label: 'Agricultural holding identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'module_weight',
      label: 'Final module analysis weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: { min: 0 },
    },
    {
      name: 'livestock_module_applicable',
      label: 'Livestock module applicable',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No livestock' },
        { value: 1, label: 'Livestock keeper' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'cattle_count',
      label: 'Number of cattle owned',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 500 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'cattle_non_keeper',
          description: 'Cattle count is structurally missing for non-keepers.',
          condition: 'livestock_module_applicable != 1',
          dependsOn: ['livestock_module_applicable'],
        },
      ],
    },
    {
      name: 'small_ruminant_count',
      label: 'Number of sheep and goats',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 1000 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
    {
      name: 'poultry_count',
      label: 'Number of poultry owned',
      type: 'count',
      role: 'analysis',
      storageType: 'integer',
      validRange: { min: 0, max: 5000 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
    {
      name: 'cultivated_maize',
      label: 'Cultivated maize during reference season',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'maize_area_ha',
      label: 'Maize area planted in hectares',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'maize_area_not_grower',
          description: 'Maize area is structurally missing for non-growers.',
          condition: 'cultivated_maize != 1',
          dependsOn: ['cultivated_maize'],
        },
      ],
    },
    {
      name: 'maize_harvest_kg',
      label: 'Maize harvest quantity kilograms',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
    {
      name: 'fertilizer_used_maize',
      label: 'Fertilizer used on maize',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'crop_sales_channel',
      label: 'Main sales channel for crop output',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 1, label: 'Farm gate' },
        { value: 2, label: 'Local market' },
        { value: 3, label: 'Cooperative' },
        { value: 4, label: 'Processor' },
        { value: 5, label: 'No sales' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
  ]

  return makeExamplePlan(
    'phase16-livestock-crop-plan',
    'Synthetic livestock and crop module Cleaning Plan',
    'Review-oriented example for livestock applicability, maize routing, counts, production, and sales channels.',
    variables,
    [
      exampleStep({
        id: 'livestock_crop_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale: 'Preserve labels from the synthetic livestock/crop module.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'livestock_crop_value_labels',
        type: 'value_label',
        variables: [
          'livestock_module_applicable',
          'cultivated_maize',
          'fertilizer_used_maize',
          'crop_sales_channel',
        ],
        rationale: 'Preserve module routing and category labels.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'livestock_crop_missing_codes',
        type: 'missing_value_declaration',
        variables: [
          'livestock_module_applicable',
          'cattle_count',
          'small_ruminant_count',
          'poultry_count',
          'cultivated_maize',
          'maize_area_ha',
          'maize_harvest_kg',
          'fertilizer_used_maize',
          'crop_sales_channel',
        ],
        rationale: 'Declare livestock/crop nonresponse codes before checks.',
        defaultAction: 'set_missing',
      }),
      exampleStep({
        id: 'livestock_crop_ranges',
        type: 'range_check',
        variables: [
          'module_weight',
          'cattle_count',
          'small_ruminant_count',
          'poultry_count',
          'maize_area_ha',
          'maize_harvest_kg',
        ],
        parameters: { min: 0 },
        rationale: 'Flag negative counts, areas, and production quantities.',
      }),
      exampleStep({
        id: 'livestock_crop_domains',
        type: 'domain_check',
        variables: [
          'livestock_module_applicable',
          'cultivated_maize',
          'fertilizer_used_maize',
          'crop_sales_channel',
        ],
        rationale: 'Flag module codes outside documented domains.',
      }),
      exampleStep({
        id: 'livestock_crop_livestock_structural_missing',
        type: 'structural_missing_check',
        variables: ['cattle_count', 'livestock_module_applicable'],
        parameters: { condition: 'livestock_module_applicable != 1' },
        rationale:
          'Protect livestock counts for holdings outside the livestock module.',
      }),
      exampleStep({
        id: 'livestock_crop_maize_structural_missing',
        type: 'structural_missing_check',
        variables: ['maize_area_ha', 'cultivated_maize'],
        parameters: { condition: 'cultivated_maize != 1' },
        rationale:
          'Protect maize variables for holdings that did not cultivate maize.',
      }),
      exampleStep({
        id: 'livestock_crop_maize_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['maize_harvest_kg', 'cultivated_maize'],
        parameters: { condition: 'cultivated_maize == 1' },
        rationale: 'Flag maize harvest values outside the maize-grower route.',
      }),
      exampleStep({
        id: 'livestock_crop_count_outliers',
        type: 'outlier_flag',
        variables: [
          'cattle_count',
          'small_ruminant_count',
          'poultry_count',
          'maize_harvest_kg',
        ],
        parameters: { method: 'mad', threshold: 3.5 },
        rationale:
          'Flag unusual livestock counts and harvest quantities without treatment.',
      }),
      exampleStep({
        id: 'livestock_crop_missingness',
        type: 'missingness_diagnosis',
        variables: [
          'cattle_count',
          'maize_area_ha',
          'maize_harvest_kg',
          'crop_sales_channel',
        ],
        parameters: {
          createIndicators: true,
          distinguishStructuralMissing: true,
        },
        rationale: 'Summarise item nonresponse separately from module skips.',
        citationKeys: ['LITTLE_RUBIN_2019'],
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'livestock_crop_harvest_imputation_review',
        type: 'imputation',
        variables: ['maize_harvest_kg'],
        parameters: {
          method: 'mice_pmm',
          predictorVariables: [
            'maize_area_ha',
            'fertilizer_used_maize',
            'cattle_count',
          ],
          targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
          includeStructuralMissing: false,
        },
        rationale:
          'Provide review syntax for item nonresponse in maize harvest only.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      exampleStep({
        id: 'livestock_crop_audit_log',
        type: 'audit_log',
        variables: [
          'holding_id',
          'cattle_count',
          'maize_area_ha',
          'maize_harvest_kg',
        ],
        rationale: 'Document module routing flags and reviewer decisions.',
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      exampleStep({
        id: 'livestock_crop_summary_report',
        type: 'summary_report',
        variables: [
          'cattle_count',
          'poultry_count',
          'maize_area_ha',
          'maize_harvest_kg',
        ],
        rationale: 'Produce summary evidence for module reviewer handoff.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export function createIncomeExpenditureExamplePlan(): CleaningPlan {
  const variables: SurveyVariable[] = [
    {
      name: 'household_id',
      label: 'Household identifier',
      type: 'identifier',
      role: 'identifier',
      storageType: 'string',
    },
    {
      name: 'hh_weight',
      label: 'Final household weight',
      type: 'weight',
      role: 'weight',
      storageType: 'numeric',
      validRange: { min: 0 },
    },
    {
      name: 'received_wage_income',
      label: 'Any wage income received',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'wage_income_month',
      label: 'Monthly household wage income',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'wage_income_not_received',
          description:
            'Wage income is structurally missing when no wage income was received.',
          condition: 'received_wage_income != 1',
          dependsOn: ['received_wage_income'],
        },
      ],
    },
    {
      name: 'received_remittances',
      label: 'Any remittances received',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'remittance_value_month',
      label: 'Monthly remittance value',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'remittance_not_received',
          description:
            'Remittance value is structurally missing when no remittances were received.',
          condition: 'received_remittances != 1',
          dependsOn: ['received_remittances'],
        },
      ],
    },
    {
      name: 'own_dwelling',
      label: 'Household owns dwelling',
      type: 'nominal',
      role: 'analysis',
      storageType: 'integer',
      valueLabels: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' },
        { value: 2, label: 'Occupied free' },
      ],
      declaredMissingCodes: [
        { value: 9, label: 'Not stated', category: 'item_nonresponse' },
      ],
    },
    {
      name: 'rent_paid_month',
      label: 'Monthly rent paid',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
      structuralMissingRules: [
        {
          id: 'rent_not_renter',
          description:
            'Rent is structurally missing for owners and free occupants.',
          condition: 'own_dwelling != 0',
          dependsOn: ['own_dwelling'],
        },
      ],
    },
    {
      name: 'food_expenditure_week',
      label: 'Food expenditure last 7 days',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
        { value: -97, label: 'Not purchased', category: 'not_applicable' },
      ],
    },
    {
      name: 'health_expenditure_month',
      label: 'Health expenditure last month',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
        { value: -97, label: 'No expenditure', category: 'not_applicable' },
      ],
    },
    {
      name: 'total_expenditure_month',
      label: 'Total household expenditure last month',
      type: 'continuous',
      role: 'analysis',
      storageType: 'numeric',
      validRange: { min: 0 },
      declaredMissingCodes: [
        { value: -98, label: "Don't know", category: 'dont_know' },
        { value: -99, label: 'Refused', category: 'refusal' },
      ],
    },
  ]

  return makeExamplePlan(
    'phase16-income-expenditure-plan',
    'Synthetic income and expenditure module Cleaning Plan',
    'Review-oriented example for household income/expenditure, declared missing codes, not-applicable values, and routing.',
    variables,
    [
      exampleStep({
        id: 'inc_exp_variable_labels',
        type: 'variable_label',
        variables: variables.map((variable) => variable.name),
        rationale:
          'Preserve labels from the synthetic income/expenditure module.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'inc_exp_value_labels',
        type: 'value_label',
        variables: [
          'received_wage_income',
          'received_remittances',
          'own_dwelling',
        ],
        rationale: 'Preserve routing-variable category labels.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'inc_exp_missing_codes',
        type: 'missing_value_declaration',
        variables: [
          'received_wage_income',
          'wage_income_month',
          'received_remittances',
          'remittance_value_month',
          'own_dwelling',
          'rent_paid_month',
          'food_expenditure_week',
          'health_expenditure_month',
          'total_expenditure_month',
        ],
        rationale:
          'Declare nonresponse and not-applicable codes before treatment review.',
        defaultAction: 'set_missing',
      }),
      exampleStep({
        id: 'inc_exp_ranges',
        type: 'range_check',
        variables: [
          'hh_weight',
          'wage_income_month',
          'remittance_value_month',
          'rent_paid_month',
          'food_expenditure_week',
          'health_expenditure_month',
          'total_expenditure_month',
        ],
        parameters: { min: 0 },
        rationale: 'Flag negative weights, incomes, rents, and expenditures.',
      }),
      exampleStep({
        id: 'inc_exp_domains',
        type: 'domain_check',
        variables: [
          'received_wage_income',
          'received_remittances',
          'own_dwelling',
        ],
        rationale: 'Flag routing codes outside documented domains.',
      }),
      exampleStep({
        id: 'inc_exp_duplicate_household',
        type: 'duplicate_id_check',
        variables: ['household_id'],
        rationale:
          'Flag duplicate household identifiers without deleting records.',
        severity: 'error',
      }),
      exampleStep({
        id: 'inc_exp_wage_structural_missing',
        type: 'structural_missing_check',
        variables: ['wage_income_month', 'received_wage_income'],
        parameters: { condition: 'received_wage_income != 1' },
        rationale:
          'Protect wage income structural missingness when no wage income was received.',
      }),
      exampleStep({
        id: 'inc_exp_remittance_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['remittance_value_month', 'received_remittances'],
        parameters: { condition: 'received_remittances == 1' },
        rationale:
          'Flag remittance amounts outside the remittance-received route.',
      }),
      exampleStep({
        id: 'inc_exp_rent_skip_pattern',
        type: 'skip_pattern_check',
        variables: ['rent_paid_month', 'own_dwelling'],
        parameters: { condition: 'own_dwelling == 0' },
        rationale: 'Flag rent values outside the renter route.',
      }),
      exampleStep({
        id: 'inc_exp_total_consistency',
        type: 'consistency_check',
        variables: [
          'total_expenditure_month',
          'food_expenditure_week',
          'health_expenditure_month',
          'rent_paid_month',
        ],
        parameters: {
          condition:
            'total_expenditure_month < health_expenditure_month || total_expenditure_month < rent_paid_month',
        },
        rationale:
          'Flag totals lower than large monthly expenditure components for review.',
      }),
      exampleStep({
        id: 'inc_exp_expenditure_outliers',
        type: 'outlier_flag',
        variables: [
          'wage_income_month',
          'remittance_value_month',
          'rent_paid_month',
          'total_expenditure_month',
        ],
        parameters: { method: 'mad', threshold: 3.5 },
        rationale:
          'Flag unusual income and expenditure amounts without silent removal.',
      }),
      exampleStep({
        id: 'inc_exp_missingness',
        type: 'missingness_diagnosis',
        variables: [
          'wage_income_month',
          'remittance_value_month',
          'rent_paid_month',
          'food_expenditure_week',
          'health_expenditure_month',
          'total_expenditure_month',
        ],
        parameters: {
          createIndicators: true,
          distinguishStructuralMissing: true,
        },
        rationale:
          'Summarise nonresponse, not-applicable codes, and routing skips before imputation review.',
        citationKeys: ['LITTLE_RUBIN_2019'],
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
      exampleStep({
        id: 'inc_exp_total_imputation_review',
        type: 'imputation',
        variables: ['total_expenditure_month'],
        parameters: {
          method: 'mice_pmm',
          predictorVariables: [
            'hh_weight',
            'food_expenditure_week',
            'health_expenditure_month',
            'rent_paid_month',
            'wage_income_month',
          ],
          targetMissingness: ['item_nonresponse', 'dont_know', 'refusal'],
          includeStructuralMissing: false,
        },
        rationale:
          'Provide review syntax for item nonresponse in total expenditure only.',
        citationKeys: ['RUBIN_1987'],
        defaultAction: 'impute',
        isAutomatic: false,
      }),
      exampleStep({
        id: 'inc_exp_audit_log',
        type: 'audit_log',
        variables: [
          'household_id',
          'wage_income_month',
          'rent_paid_month',
          'total_expenditure_month',
        ],
        rationale: 'Document income/expenditure flags and reviewer decisions.',
        severity: 'info',
        defaultAction: 'derive',
        requiresReview: false,
      }),
      exampleStep({
        id: 'inc_exp_summary_report',
        type: 'summary_report',
        variables: [
          'wage_income_month',
          'remittance_value_month',
          'rent_paid_month',
          'total_expenditure_month',
        ],
        rationale:
          'Produce summary evidence for income/expenditure reviewer handoff.',
        severity: 'info',
        defaultAction: 'no_action',
        requiresReview: false,
      }),
    ],
  )
}

export const officialStatisticsExamplePlans = [
  {
    id: 'householdLabourSurvey',
    label: 'Household and labour survey',
    createPlan: createHouseholdLabourExamplePlan,
  },
  {
    id: 'agriculturalHoldingSurvey',
    label: 'Agricultural holding survey',
    createPlan: createAgriculturalHoldingExamplePlan,
  },
  {
    id: 'livestockCropModule',
    label: 'Livestock and crop module',
    createPlan: createLivestockCropExamplePlan,
  },
  {
    id: 'incomeExpenditureModule',
    label: 'Income and expenditure module',
    createPlan: createIncomeExpenditureExamplePlan,
  },
] as const
