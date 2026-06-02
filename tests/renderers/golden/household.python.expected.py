# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: Python script
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Household renderer golden plan
# Cleaning Plan ID: household-golden-plan
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
# Step ID: household_variable_labels
# Step type: variable_label
# Variables: household_id, strata, psu, weight, age, sex, education, income
# Rationale: Preserve household survey labels in the analysis dataset.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas does not preserve SPSS/Stata-style variable labels natively; labels are stored in a dictionary.
variable_labels = globals().get("variable_labels", {})
variable_labels.update({
    "household_id": "Household identifier",
    "strata": "Sampling stratum",
    "psu": "Primary sampling unit",
    "weight": "Household survey weight",
    "age": "Age in completed years",
    "sex": "Sex",
    "education": "Highest education completed",
    "income": "Monthly household income",
})

# -----------------------------------------------------------------------------
# Step ID: household_value_labels
# Step type: value_label
# Variables: sex, education
# Rationale: Preserve labelled household categorical codes.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas category/value labels are stored here as metadata dictionaries for analyst review.
value_labels = globals().get("value_labels", {})
value_labels.update({
    "sex": {
        1: "Male",
        2: "Female",
    },
    "education": {
        0: "None",
        1: "Primary",
        2: "Secondary",
        3: "Tertiary",
    },
})

# -----------------------------------------------------------------------------
# Step ID: household_missing_codes
# Step type: missing_value_declaration
# Variables: age, sex, education, income
# Rationale: Declare nonresponse codes before diagnostics or imputation.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for age: 98, 99
# These are recoded to np.nan for Python analysis. Review before running.
data["age"] = data["age"].replace([98, 99], np.nan)
# Declared missing codes for sex: 9
# These are recoded to np.nan for Python analysis. Review before running.
data["sex"] = data["sex"].replace([9], np.nan)
# Declared missing codes for education: 9
# These are recoded to np.nan for Python analysis. Review before running.
data["education"] = data["education"].replace([9], np.nan)
# Declared missing codes for income: -98, -99
# These are recoded to np.nan for Python analysis. Review before running.
data["income"] = data["income"].replace([-98, -99], np.nan)

# -----------------------------------------------------------------------------
# Step ID: household_age_range
# Step type: range_check
# Variables: age
# Rationale: Flag impossible age values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_age_range"] = np.where(
    data["age"].notna() & ((data["age"] < 0) | (data["age"] > 120)),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: household_income_range
# Step type: range_check
# Variables: income, weight
# Rationale: Flag negative income or weight values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_income_range"] = np.where(
    data["income"].notna() & ((data["income"] < 0)),
    1,
    0,
)
data["flag_weight_range"] = np.where(
    data["weight"].notna() & ((data["weight"] < 0)),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: household_sex_domain
# Step type: domain_check
# Variables: sex, education
# Rationale: Flag categorical values outside documented labels.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_sex_domain"] = np.where(
    data["sex"].notna() & ~data["sex"].isin([1, 2, 9]),
    1,
    0,
)
data["flag_education_domain"] = np.where(
    data["education"].notna() & ~data["education"].isin([0, 1, 2, 3, 9]),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: household_duplicate_id
# Step type: duplicate_id_check
# Variables: household_id
# Rationale: Flag duplicate household identifiers without deleting records.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Duplicate identifier checks tag records; no records are deleted.
duplicate_key_flag_household_duplicate_id_duplicate_id = ["household_id"]
data["flag_household_duplicate_id_duplicate_id"] = np.where(
    data[duplicate_key_flag_household_duplicate_id_duplicate_id].notna().all(axis=1) & data.duplicated(subset=duplicate_key_flag_household_duplicate_id_duplicate_id, keep=False),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: household_income_outlier
# Step type: outlier_flag
# Variables: income
# Rationale: Flag unusual income values for review without treatment.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
income_q1 = data["income"].quantile(0.25)
income_q3 = data["income"].quantile(0.75)
income_iqr = income_q3 - income_q1
income_lower_tukey = income_q1 - 1.5 * income_iqr
income_upper_tukey = income_q3 + 1.5 * income_iqr
data["flag_income_outlier_tukey"] = np.where(
    data["income"].notna() & ((data["income"] < income_lower_tukey) | (data["income"] > income_upper_tukey)),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: household_missingness
# Step type: missingness_diagnosis
# Variables: age, sex, education, income
# Rationale: Summarise missingness before any treatment decision.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missing_summary = data[["age","sex","education","income"]].isna().sum().to_frame("n_missing")
missing_summary["pct_missing"] = missing_summary["n_missing"] / len(data) * 100
print(missing_summary)
data["missing_age"] = np.where(data["age"].isna(), 1, 0)
data["missing_sex"] = np.where(data["sex"].isna(), 1, 0)
data["missing_education"] = np.where(data["education"].isna(), 1, 0)
data["missing_income"] = np.where(data["income"].isna(), 1, 0)

# -----------------------------------------------------------------------------
# Step ID: household_income_imputation
# Step type: imputation
# Variables: household_id, income
# Rationale: Review income imputation while protecting identifiers.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: IterativeImputer is experimental in scikit-learn and must be reviewed before production use.
# A single completed Python dataset is not equivalent to full Rubin-style multiple-imputation inference.
# Use statsmodels or a specialised workflow when analysis pooling is required.
# Identifier variables and structural missing values are excluded from imputation examples.
# WARNING: Identifier variable "household_id" was excluded from imputation.
imputation_variables = ["income", "age", "sex", "education", "weight"]
data_for_imputation = data[imputation_variables].copy()
imputer = IterativeImputer(random_state=12345, max_iter=10, sample_posterior=True)
imputed_array = imputer.fit_transform(data_for_imputation)
completed_data_example = data.copy()
completed_data_example[imputation_variables] = imputed_array

# Pooling guidance: fit models separately across multiple imputations and pool estimates.
# Do not treat completed_data_example as full multiple-imputation inference.

# -----------------------------------------------------------------------------
# Step ID: household_audit_log
# Step type: audit_log
# Variables: household_id, age, sex, education, income
# Rationale: Document generated flags and reviewer decisions.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: household_summary_report
# Step type: summary_report
# Variables: age, sex, education, income
# Rationale: Produce a basic summary section for reviewer handoff.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables = ["age", "sex", "education", "income"]
print(data[summary_report_variables].describe(include="all"))
print(data[summary_report_variables].isna().sum())
