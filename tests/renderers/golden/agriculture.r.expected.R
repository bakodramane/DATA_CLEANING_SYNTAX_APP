# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: R
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Agriculture renderer golden plan
# Cleaning Plan ID: agriculture-golden-plan
# Cleaning Plan version: 0.4.1-renderer-fixture
# Version note: first-release R renderer; review package versions before use.
#
# Assumptions:
# - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
# - Generated syntax must be reviewed before production use and is never executed by the app.
#
# WARNING: Review this generated syntax before production use.
# The script flags and documents issues; it must not be treated as a black box.
# =============================================================================

# Required packages:
# install.packages(c("dplyr", "labelled", "mice"))
library(dplyr)
library(labelled)
library(mice)

# Expected input: a data frame named `data`.
# Rename your imported survey dataset to this object before running the script,
# or regenerate the script with a different data frame name.

# -----------------------------------------------------------------------------
# Step ID: ag_variable_labels
# Step type: variable_label
# Variables: holding_id, parcel_area, crop_code, livestock_count, irrigation_status, production_qty, sales_value
# Rationale: Preserve agricultural survey labels.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Variable label: holding_id
var_label(data$holding_id) <- "Agricultural holding identifier"
# Variable label: parcel_area
var_label(data$parcel_area) <- "Parcel area in hectares"
# Variable label: crop_code
var_label(data$crop_code) <- "Main crop code"
# Variable label: livestock_count
var_label(data$livestock_count) <- "Number of livestock owned"
# Variable label: irrigation_status
var_label(data$irrigation_status) <- "Parcel uses irrigation"
# Variable label: production_qty
var_label(data$production_qty) <- "Production quantity harvested"
# Variable label: sales_value
var_label(data$sales_value) <- "Value of crop sales"

# -----------------------------------------------------------------------------
# Step ID: ag_value_labels
# Step type: value_label
# Variables: crop_code, irrigation_status
# Rationale: Preserve categorical agricultural codes.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Value labels: crop_code
val_labels(data$crop_code) <- c("Maize" = 1, "Rice" = 2, "Sorghum" = 3)
# Value labels: irrigation_status
val_labels(data$irrigation_status) <- c("No" = 0, "Yes" = 1)

# -----------------------------------------------------------------------------
# Step ID: ag_missing_codes
# Step type: missing_value_declaration
# Variables: crop_code, production_qty, sales_value
# Rationale: Declare agricultural nonresponse codes.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for crop_code: 99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    crop_code = if_else(crop_code %in% c(99), NA_integer_, crop_code)
  )
# Declared missing codes for production_qty: -99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    production_qty = if_else(production_qty %in% c(-99), NA_real_, production_qty)
  )
# Declared missing codes for sales_value: -99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    sales_value = if_else(sales_value %in% c(-99), NA_real_, sales_value)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_non_negative_ranges
# Step type: range_check
# Variables: parcel_area, livestock_count, production_qty, sales_value
# Rationale: Flag negative agricultural quantities or values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_parcel_area_range = if_else(!is.na(parcel_area) & (parcel_area < 0), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_livestock_count_range = if_else(!is.na(livestock_count) & (livestock_count < 0), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_production_qty_range = if_else(!is.na(production_qty) & (production_qty < 0), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_sales_value_range = if_else(!is.na(sales_value) & (sales_value < 0), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_categorical_domains
# Step type: domain_check
# Variables: crop_code, irrigation_status
# Rationale: Flag crop and irrigation codes outside documented domains.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_crop_code_domain = if_else(!is.na(crop_code) & !(crop_code %in% c(1, 2, 3, 99)), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_irrigation_status_domain = if_else(!is.na(irrigation_status) & !(irrigation_status %in% c(0, 1)), 1L, 0L)
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
flag_ag_duplicate_holding_duplicate_id_key <- data %>% select(all_of(c("holding_id")))
data <- data %>%
  mutate(
    flag_ag_duplicate_holding_duplicate_id = if_else(if_all(all_of(c("holding_id")), ~ !is.na(.x)) & (duplicated(flag_ag_duplicate_holding_duplicate_id_key) | duplicated(flag_ag_duplicate_holding_duplicate_id_key, fromLast = TRUE)), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_sales_consistency
# Step type: consistency_check
# Variables: sales_value, production_qty
# Rationale: Flag positive sales when no production quantity is reported.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: R consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.
# Flag condition: sales_value > 0 && production_qty <= 0
data <- data %>%
  mutate(
    flag_ag_sales_consistency_consistency = if_else(data$sales_value > 0  &  data$production_qty <= 0, 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_production_outlier
# Step type: outlier_flag
# Variables: production_qty, sales_value
# Rationale: Flag unusual production and sales values for review.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
production_qty_median <- median(data$production_qty, na.rm = TRUE)
production_qty_mad <- mad(data$production_qty, constant = 1.4826, na.rm = TRUE)
data <- data %>%
  mutate(
    flag_production_qty_outlier_mad = if_else(!is.na(production_qty) & production_qty_mad > 0 & abs(production_qty - production_qty_median) / production_qty_mad > 3.5, 1L, 0L)
  )
sales_value_median <- median(data$sales_value, na.rm = TRUE)
sales_value_mad <- mad(data$sales_value, constant = 1.4826, na.rm = TRUE)
data <- data %>%
  mutate(
    flag_sales_value_outlier_mad = if_else(!is.na(sales_value) & sales_value_mad > 0 & abs(sales_value - sales_value_median) / sales_value_mad > 3.5, 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_missingness
# Step type: missingness_diagnosis
# Variables: parcel_area, crop_code, production_qty, sales_value
# Rationale: Summarise missing agricultural metadata before treatment.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missingness_summary <- bind_rows(
  data.frame(
    variable = "parcel_area",
    n_missing = sum(is.na(data$parcel_area)),
    pct_missing = mean(is.na(data$parcel_area)) * 100
  ),
  data.frame(
    variable = "crop_code",
    n_missing = sum(is.na(data$crop_code)),
    pct_missing = mean(is.na(data$crop_code)) * 100
  ),
  data.frame(
    variable = "production_qty",
    n_missing = sum(is.na(data$production_qty)),
    pct_missing = mean(is.na(data$production_qty)) * 100
  ),
  data.frame(
    variable = "sales_value",
    n_missing = sum(is.na(data$sales_value)),
    pct_missing = mean(is.na(data$sales_value)) * 100
  )
)
print(missingness_summary)
data <- data %>%
  mutate(
    missing_parcel_area = if_else(is.na(parcel_area), 1L, 0L),
    missing_crop_code = if_else(is.na(crop_code), 1L, 0L),
    missing_production_qty = if_else(is.na(production_qty), 1L, 0L),
    missing_sales_value = if_else(is.na(sales_value), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: ag_production_imputation
# Step type: imputation
# Variables: production_qty, crop_code
# Rationale: Review production and crop-code imputation with method warnings.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Multiple imputation requires careful methodological review.
# This MVP uses mice() with simple default methods and does not automate model selection.
# Structural missing values must be excluded before imputation.
# Identifier variables are excluded from imputation methods.
# WARNING: Categorical variable "crop_code" uses a mice categorical method; review category prevalence and model fit before production use.
imputation_variables <- c("production_qty", "crop_code", "parcel_area", "livestock_count", "irrigation_status")
imputation_data <- data %>% select(all_of(imputation_variables))

mice_methods <- mice::make.method(imputation_data)
mice_methods[] <- ""
mice_methods["production_qty"] <- "pmm"
mice_methods["crop_code"] <- "polyreg"

set.seed(12345)
mice_fit <- mice(imputation_data, m = 5, method = mice_methods, maxit = 10, seed = 12345)
completed_data_example <- complete(mice_fit, action = 1)

# Example analysis and pooling guidance, to be adapted by the analyst:
# fit <- with(mice_fit, lm(outcome ~ income + age + sex))
# pooled <- pool(fit)
# summary(pooled)

# -----------------------------------------------------------------------------
# Step ID: ag_audit_log
# Step type: audit_log
# Variables: holding_id, parcel_area, crop_code, production_qty
# Rationale: Document agricultural flag review.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: ag_summary_report
# Step type: summary_report
# Variables: parcel_area, crop_code, production_qty, sales_value
# Rationale: Produce a basic agricultural summary section.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables <- c("parcel_area", "crop_code", "production_qty", "sales_value")
print(summary(data[summary_report_variables]))
