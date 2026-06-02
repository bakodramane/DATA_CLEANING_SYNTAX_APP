# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: Python script
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Agriculture renderer golden plan
# Cleaning Plan ID: agriculture-golden-plan
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
# Step ID: ag_variable_labels
# Step type: variable_label
# Variables: holding_id, parcel_area, crop_code, livestock_count, irrigation_status, production_qty, sales_value
# Rationale: Preserve agricultural survey labels.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas does not preserve SPSS/Stata-style variable labels natively; labels are stored in a dictionary.
variable_labels = globals().get("variable_labels", {})
variable_labels.update({
    "holding_id": "Agricultural holding identifier",
    "parcel_area": "Parcel area in hectares",
    "crop_code": "Main crop code",
    "livestock_count": "Number of livestock owned",
    "irrigation_status": "Parcel uses irrigation",
    "production_qty": "Production quantity harvested",
    "sales_value": "Value of crop sales",
})

# -----------------------------------------------------------------------------
# Step ID: ag_value_labels
# Step type: value_label
# Variables: crop_code, irrigation_status
# Rationale: Preserve categorical agricultural codes.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# pandas category/value labels are stored here as metadata dictionaries for analyst review.
value_labels = globals().get("value_labels", {})
value_labels.update({
    "crop_code": {
        1: "Maize",
        2: "Rice",
        3: "Sorghum",
    },
    "irrigation_status": {
        0: "No",
        1: "Yes",
    },
})

# -----------------------------------------------------------------------------
# Step ID: ag_missing_codes
# Step type: missing_value_declaration
# Variables: crop_code, production_qty, sales_value
# Rationale: Declare agricultural nonresponse codes.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for crop_code: 99
# These are recoded to np.nan for Python analysis. Review before running.
data["crop_code"] = data["crop_code"].replace([99], np.nan)
# Declared missing codes for production_qty: -99
# These are recoded to np.nan for Python analysis. Review before running.
data["production_qty"] = data["production_qty"].replace([-99], np.nan)
# Declared missing codes for sales_value: -99
# These are recoded to np.nan for Python analysis. Review before running.
data["sales_value"] = data["sales_value"].replace([-99], np.nan)

# -----------------------------------------------------------------------------
# Step ID: ag_non_negative_ranges
# Step type: range_check
# Variables: parcel_area, livestock_count, production_qty, sales_value
# Rationale: Flag negative agricultural quantities or values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_parcel_area_range"] = np.where(
    data["parcel_area"].notna() & ((data["parcel_area"] < 0)),
    1,
    0,
)
data["flag_livestock_count_range"] = np.where(
    data["livestock_count"].notna() & ((data["livestock_count"] < 0)),
    1,
    0,
)
data["flag_production_qty_range"] = np.where(
    data["production_qty"].notna() & ((data["production_qty"] < 0)),
    1,
    0,
)
data["flag_sales_value_range"] = np.where(
    data["sales_value"].notna() & ((data["sales_value"] < 0)),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: ag_categorical_domains
# Step type: domain_check
# Variables: crop_code, irrigation_status
# Rationale: Flag crop and irrigation codes outside documented domains.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data["flag_crop_code_domain"] = np.where(
    data["crop_code"].notna() & ~data["crop_code"].isin([1, 2, 3, 99]),
    1,
    0,
)
data["flag_irrigation_status_domain"] = np.where(
    data["irrigation_status"].notna() & ~data["irrigation_status"].isin([0, 1]),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: ag_duplicate_holding
# Step type: duplicate_id_check
# Variables: holding_id
# Rationale: Flag duplicate holding identifiers.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Duplicate identifier checks tag records; no records are deleted.
duplicate_key_flag_ag_duplicate_holding_duplicate_id = ["holding_id"]
data["flag_ag_duplicate_holding_duplicate_id"] = np.where(
    data[duplicate_key_flag_ag_duplicate_holding_duplicate_id].notna().all(axis=1) & data.duplicated(subset=duplicate_key_flag_ag_duplicate_holding_duplicate_id, keep=False),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: ag_sales_consistency
# Step type: consistency_check
# Variables: sales_value, production_qty
# Rationale: Flag positive sales when no production quantity is reported.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: Python consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.
# Flag condition: sales_value > 0 && production_qty <= 0
data["flag_ag_sales_consistency_consistency"] = np.where(
    data["sales_value"] > 0  &  data["production_qty"] <= 0,
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: ag_production_outlier
# Step type: outlier_flag
# Variables: production_qty, sales_value
# Rationale: Flag unusual production and sales values for review.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
production_qty_median = data["production_qty"].median(skipna=True)
production_qty_mad = (data["production_qty"] - production_qty_median).abs().median(skipna=True) * 1.4826
data["flag_production_qty_outlier_mad"] = np.where(
    data["production_qty"].notna() & (production_qty_mad > 0) & ((data["production_qty"] - production_qty_median).abs() / production_qty_mad > 3.5),
    1,
    0,
)
sales_value_median = data["sales_value"].median(skipna=True)
sales_value_mad = (data["sales_value"] - sales_value_median).abs().median(skipna=True) * 1.4826
data["flag_sales_value_outlier_mad"] = np.where(
    data["sales_value"].notna() & (sales_value_mad > 0) & ((data["sales_value"] - sales_value_median).abs() / sales_value_mad > 3.5),
    1,
    0,
)

# -----------------------------------------------------------------------------
# Step ID: ag_missingness
# Step type: missingness_diagnosis
# Variables: parcel_area, crop_code, production_qty, sales_value
# Rationale: Summarise missing agricultural metadata before treatment.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missing_summary = data[["parcel_area","crop_code","production_qty","sales_value"]].isna().sum().to_frame("n_missing")
missing_summary["pct_missing"] = missing_summary["n_missing"] / len(data) * 100
print(missing_summary)
data["missing_parcel_area"] = np.where(data["parcel_area"].isna(), 1, 0)
data["missing_crop_code"] = np.where(data["crop_code"].isna(), 1, 0)
data["missing_production_qty"] = np.where(data["production_qty"].isna(), 1, 0)
data["missing_sales_value"] = np.where(data["sales_value"].isna(), 1, 0)

# -----------------------------------------------------------------------------
# Step ID: ag_production_imputation
# Step type: imputation
# Variables: production_qty, crop_code
# Rationale: Review production and crop-code imputation with method warnings.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: IterativeImputer is experimental in scikit-learn and must be reviewed before production use.
# A single completed Python dataset is not equivalent to full Rubin-style multiple-imputation inference.
# Use statsmodels or a specialised workflow when analysis pooling is required.
# Identifier variables and structural missing values are excluded from imputation examples.
# WARNING: Categorical variable "crop_code" is included in a numeric IterativeImputer example; review encoding and model fit before production use.
imputation_variables = ["production_qty", "crop_code", "parcel_area", "livestock_count", "irrigation_status"]
data_for_imputation = data[imputation_variables].copy()
imputer = IterativeImputer(random_state=12345, max_iter=10, sample_posterior=True)
imputed_array = imputer.fit_transform(data_for_imputation)
completed_data_example = data.copy()
completed_data_example[imputation_variables] = imputed_array

# Pooling guidance: fit models separately across multiple imputations and pool estimates.
# Do not treat completed_data_example as full multiple-imputation inference.

# -----------------------------------------------------------------------------
# Step ID: ag_audit_log
# Step type: audit_log
# Variables: holding_id, parcel_area, crop_code, production_qty
# Rationale: Document agricultural flag review.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: ag_summary_report
# Step type: summary_report
# Variables: parcel_area, crop_code, production_qty, sales_value
# Rationale: Produce a basic agricultural summary section.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: Python summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables = ["parcel_area", "crop_code", "production_qty", "sales_value"]
print(data[summary_report_variables].describe(include="all"))
print(data[summary_report_variables].isna().sum())
