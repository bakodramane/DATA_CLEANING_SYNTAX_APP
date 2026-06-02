# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: Python script
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Structural missing renderer golden plan
# Cleaning Plan ID: structural-missing-golden-plan
# Cleaning Plan version: 0.4.1-renderer-fixture
# Version assumption: pandas/numpy plus scikit-learn for practical imputation
# Assumptions:
# - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
# - Generated syntax must be reviewed before production use and is never executed by the app.
# WARNING: Review this generated syntax before production use
# No records are deleted and validation checks write flag variables
# =============================================================================

# Required packages:
# pip install pandas numpy scikit-learn statsmodels
import numpy as np
import pandas as pd
from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import IterativeImputer

# Expected input: a pandas DataFrame named data.

# -----------------------------------------------------------------------------
# Step ID: struct_variable_labels
# Step type: variable_label
# Variables: person_id, age, employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Preserve labels for skip-pattern review.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas does not preserve SPSS/Stata-style variable labels natively; labels are stored in a dictionary.
variable_labels = globals().get("variable_labels", {})
variable_labels.update({
    "person_id": "Person identifier",
    "age": "Age in completed years",
    "employment_status": "Employment status",
    "wage_income": "Wage income for employed persons",
    "school_attendance": "Currently attending school",
    "reason_not_working": "Reason not working",
})

# -----------------------------------------------------------------------------
# Step ID: struct_value_labels
# Step type: value_label
# Variables: employment_status, school_attendance, reason_not_working
# Rationale: Preserve routing-category labels.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas category/value labels are stored here as metadata dictionaries for analyst review.
value_labels = globals().get("value_labels", {})
value_labels.update({
    "employment_status": {
        1: "Employed",
        2: "Unemployed",
        3: "Outside labour force",
    },
    "school_attendance": {
        0: "No",
        1: "Yes",
    },
    "reason_not_working": {
        1: "Seeking work",
        2: "Student",
        3: "Family care",
    },
})

# -----------------------------------------------------------------------------
# Step ID: struct_missing_codes
# Step type: missing_value_declaration
# Variables: employment_status, wage_income
# Rationale: Declare nonresponse before routing checks.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for employment_status: 9
# These are recoded to np.nan for Python analysis. Review before running.
data["employment_status"] = data["employment_status"].replace([9], np.nan)
# Declared missing codes for wage_income: -99
# These are recoded to np.nan for Python analysis. Review before running.
data["wage_income"] = data["wage_income"].replace([-99], np.nan)

# -----------------------------------------------------------------------------
# Step ID: struct_age_range
# Step type: range_check
# Variables: age
# Rationale: Flag impossible ages before age-based routing checks.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_age_range"] = np.where(
    data["age"].notna() & ((data["age"] < 0) | (data["age"] > 120)),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_employment_domain
# Step type: domain_check
# Variables: employment_status, school_attendance, reason_not_working
# Rationale: Flag categorical routing variables outside documented domains.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_employment_status_domain"] = np.where(
    data["employment_status"].notna() & ~data["employment_status"].isin([1, 2, 3, 9]),
    1,
    0,
)
data["flag_school_attendance_domain"] = np.where(
    data["school_attendance"].notna() & ~data["school_attendance"].isin([0, 1]),
    1,
    0,
)
data["flag_reason_not_working_domain"] = np.where(
    data["reason_not_working"].notna() & ~data["reason_not_working"].isin([1, 2, 3]),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_duplicate_person
# Step type: duplicate_id_check
# Variables: person_id
# Rationale: Flag duplicate person identifiers.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Duplicate identifier checks tag records; no records are deleted.
duplicate_key_flag_struct_duplicate_person_duplicate_id = ["person_id"]
data["flag_struct_duplicate_person_duplicate_id"] = np.where(
    data[duplicate_key_flag_struct_duplicate_person_duplicate_id].notna().all(axis=1) & data.duplicated(subset=duplicate_key_flag_struct_duplicate_person_duplicate_id, keep=False),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_wage_structural_missing
# Step type: structural_missing_check
# Variables: wage_income, employment_status
# Rationale: Protect wage income structural missingness for non-employed persons.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: Python structural-missing checks are rendered as review flags only; values are not recoded or imputed.
# Structural-missing condition: employment_status != 1
data["flag_wage_income_structural_missing"] = np.where(
    (data["employment_status"] != 1) & data["wage_income"].notna(),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_wage_skip_pattern
# Step type: skip_pattern_check
# Variables: wage_income, employment_status
# Rationale: Flag wage income present outside the employed route.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: Python skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: employment_status == 1
data["flag_wage_income_skip_pattern"] = np.where(
    ~(data["employment_status"] == 1) & data["wage_income"].notna(),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_school_skip_pattern
# Step type: skip_pattern_check
# Variables: school_attendance, age
# Rationale: Flag school attendance values outside the relevant age group.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: Python skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: (age >= 6) && (age <= 24)
data["flag_school_attendance_skip_pattern"] = np.where(
    ~((data["age"] >= 6)  &  (data["age"] <= 24)) & data["school_attendance"].notna(),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_reason_skip_pattern
# Step type: skip_pattern_check
# Variables: reason_not_working, employment_status
# Rationale: Flag reason-not-working values for employed persons.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: Python skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: employment_status != 1
data["flag_reason_not_working_skip_pattern"] = np.where(
    ~(data["employment_status"] != 1) & data["reason_not_working"].notna(),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: struct_missingness
# Step type: missingness_diagnosis
# Variables: employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Summarise item and structural missingness before treatment.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missing_summary = data[["employment_status","wage_income","school_attendance","reason_not_working"]].isna().sum().to_frame("n_missing")
missing_summary["pct_missing"] = missing_summary["n_missing"] / len(data) * 100
print(missing_summary)
data["missing_employment_status"] = np.where(data["employment_status"].isna(), 1, 0)
data["missing_wage_income"] = np.where(data["wage_income"].isna(), 1, 0)
data["missing_school_attendance"] = np.where(data["school_attendance"].isna(), 1, 0)
data["missing_reason_not_working"] = np.where(data["reason_not_working"].isna(), 1, 0)

# -----------------------------------------------------------------------------
# Step ID: struct_wage_imputation
# Step type: imputation
# Variables: person_id, wage_income, school_attendance
# Rationale: Show that identifiers and structural missingness are blocked from imputation examples.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: IterativeImputer is experimental in scikit-learn and must be reviewed before production use.
# A single completed Python dataset is not equivalent to full Rubin-style multiple-imputation inference.
# Use statsmodels or a specialised workflow when analysis pooling is required.
# Identifier variables and structural missing values are excluded from imputation examples.
# WARNING: Structural missing values were requested for imputation and have been blocked.
# WARNING: Identifier variable "person_id" was excluded from imputation.
# WARNING: Categorical variable "school_attendance" is included in a numeric IterativeImputer example; review encoding and model fit before production use.
imputation_variables = ["wage_income", "school_attendance", "age", "employment_status"]
data_for_imputation = data[imputation_variables].copy()
imputer = IterativeImputer(random_state=12345, max_iter=10, sample_posterior=True)
imputed_array = imputer.fit_transform(data_for_imputation)
completed_data_example = data.copy()
completed_data_example[imputation_variables] = imputed_array

# Pooling guidance: fit models separately across multiple imputations and pool estimates.
# Do not treat completed_data_example as full multiple-imputation inference.

# -----------------------------------------------------------------------------
# Step ID: struct_audit_log
# Step type: audit_log
# Variables: person_id, wage_income, school_attendance, reason_not_working
# Rationale: Document routing flags and reviewer decisions.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: struct_summary_report
# Step type: summary_report
# Variables: employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Produce a basic structural-missing summary section.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables = ["employment_status", "wage_income", "school_attendance", "reason_not_working"]
print(data[summary_report_variables].describe(include="all"))
print(data[summary_report_variables].isna().sum())
