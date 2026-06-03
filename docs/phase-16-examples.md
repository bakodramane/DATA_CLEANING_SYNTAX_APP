# Phase 16 Official-Statistics Examples

These examples strengthen methodology review without adding AI features,
backend services, telemetry, cloud storage, authentication, script execution, or
major UI changes.

The source of truth is
`src/core/fixtures/official-statistics-examples.ts`. Tests validate that each
synthetic dictionary imports, generates a valid Cleaning Plan, and renders in
SPSS v18, Stata v14, R, and Python.

## Synthetic Demo Dictionaries

Included dictionaries:

- `householdLabourSurvey`: household roster, labour status, hours worked, wage
  income, survey weights, strata, PSUs, missing codes, and labour skip patterns.
- `agriculturalHoldingSurvey`: holdings, holder characteristics, land area,
  parcels, crops, production, sales, design variables, and missing codes.
- `livestockCropModule`: livestock applicability, animal counts, maize routing,
  crop area, harvest, fertilizer, and sales channels.
- `incomeExpenditureModule`: wage income, remittances, rent, food, health, total
  expenditure, declared missing codes, not-applicable codes, and skip patterns.

## Example Cleaning Plan Fragment

```json
{
  "id": "phase16-income-expenditure-plan",
  "metadata": {
    "title": "Synthetic income and expenditure module Cleaning Plan",
    "assumptions": [
      "The example is synthetic and contains metadata only; it is not based on real survey microdata.",
      "Generated syntax is a review draft and must be checked by survey statisticians before production use.",
      "Structural missingness, identifiers, weights, strata, and PSUs are protected from imputation-style treatment."
    ]
  },
  "steps": [
    {
      "id": "inc_exp_wage_structural_missing",
      "type": "structural_missing_check",
      "variables": ["wage_income_month", "received_wage_income"],
      "parameters": { "condition": "received_wage_income != 1" },
      "defaultAction": "flag",
      "requiresReview": true
    },
    {
      "id": "inc_exp_total_imputation_review",
      "type": "imputation",
      "variables": ["total_expenditure_month"],
      "parameters": {
        "method": "mice_pmm",
        "targetMissingness": ["item_nonresponse", "dont_know", "refusal"],
        "includeStructuralMissing": false
      },
      "defaultAction": "impute",
      "isAutomatic": false,
      "requiresReview": true
    }
  ]
}
```

## Generated Syntax Output Examples

Representative generated SPSS v18 fragment:

```spss
* Step ID: inc_exp_wage_structural_missing.
* Type: structural_missing_check.
* Rationale: Protect wage income structural missingness when no wage income was received.
COMPUTE flag_inc_exp_wage_structural_missing_structural_missing = 0.
IF (received_wage_income <> 1 AND NOT MISSING(wage_income_month))
  flag_inc_exp_wage_structural_missing_structural_missing = 1.
EXECUTE.
```

Representative generated Stata v14 fragment:

```stata
* Step ID: inc_exp_remittance_skip_pattern
* Type: skip_pattern_check
* Rationale: Flag remittance amounts outside the remittance-received route.
generate byte flag_inc_exp_remittance_skip_pattern_skip_pattern = 0
replace flag_inc_exp_remittance_skip_pattern_skip_pattern = 1 if !(received_remittances == 1) & !missing(remittance_value_month)
label variable flag_inc_exp_remittance_skip_pattern_skip_pattern "Review flag: inc_exp_remittance_skip_pattern"
```

Representative generated R fragment:

```r
# Step ID: inc_exp_expenditure_outliers
# Type: outlier_flag
# Rationale: Flag unusual income and expenditure amounts without silent removal.
median_value <- median(data$total_expenditure_month, na.rm = TRUE)
mad_value <- mad(data$total_expenditure_month, constant = 1, na.rm = TRUE)
data$flag_total_expenditure_month_outlier_mad <- abs(data$total_expenditure_month - median_value) / mad_value > 3.5
```

Representative generated Python fragment:

```python
# Step ID: inc_exp_total_imputation_review
# Type: imputation
# Rationale: Provide review syntax for item nonresponse in total expenditure only.
# WARNING: Imputation syntax is a review template and must be approved by a statistician.
imputation_variables = ["total_expenditure_month"]
predictor_variables = [
    "hh_weight",
    "food_expenditure_week",
    "health_expenditure_month",
    "rent_paid_month",
    "wage_income_month",
]
```

## Reviewer Notes

The examples show how generated syntax should flag review issues rather than
silently treating data. Production teams should still verify questionnaire
routing, structural missingness, missing codes, outliers, imputation methods,
and documentation before using generated scripts in an official workflow.
