# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: R
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Household renderer golden plan
# Cleaning Plan ID: household-golden-plan
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
# Step ID: household_variable_labels
# Step type: variable_label
# Variables: household_id, strata, psu, weight, age, sex, education, income
# Rationale: Preserve household survey labels in the analysis dataset.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Variable label: household_id
var_label(data$household_id) <- "Household identifier"
# Variable label: strata
var_label(data$strata) <- "Sampling stratum"
# Variable label: psu
var_label(data$psu) <- "Primary sampling unit"
# Variable label: weight
var_label(data$weight) <- "Household survey weight"
# Variable label: age
var_label(data$age) <- "Age in completed years"
# Variable label: sex
var_label(data$sex) <- "Sex"
# Variable label: education
var_label(data$education) <- "Highest education completed"
# Variable label: income
var_label(data$income) <- "Monthly household income"

# -----------------------------------------------------------------------------
# Step ID: household_value_labels
# Step type: value_label
# Variables: sex, education
# Rationale: Preserve labelled household categorical codes.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Value labels: sex
val_labels(data$sex) <- c("Male" = 1, "Female" = 2)
# Value labels: education
val_labels(data$education) <- c("None" = 0, "Primary" = 1, "Secondary" = 2, "Tertiary" = 3)

# -----------------------------------------------------------------------------
# Step ID: household_missing_codes
# Step type: missing_value_declaration
# Variables: age, sex, education, income
# Rationale: Declare nonresponse codes before diagnostics or imputation.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for age: 98, 99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    age = if_else(age %in% c(98, 99), NA_integer_, age)
  )
# Declared missing codes for sex: 9
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    sex = if_else(sex %in% c(9), NA_integer_, sex)
  )
# Declared missing codes for education: 9
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    education = if_else(education %in% c(9), NA_integer_, education)
  )
# Declared missing codes for income: -98, -99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    income = if_else(income %in% c(-98, -99), NA_real_, income)
  )

# -----------------------------------------------------------------------------
# Step ID: household_age_range
# Step type: range_check
# Variables: age
# Rationale: Flag impossible age values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_age_range = if_else(!is.na(age) & (age < 0 | age > 120), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: household_income_range
# Step type: range_check
# Variables: income, weight
# Rationale: Flag negative income or weight values.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_income_range = if_else(!is.na(income) & (income < 0), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_weight_range = if_else(!is.na(weight) & (weight < 0), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: household_sex_domain
# Step type: domain_check
# Variables: sex, education
# Rationale: Flag categorical values outside documented labels.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_sex_domain = if_else(!is.na(sex) & !(sex %in% c(1, 2, 9)), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_education_domain = if_else(!is.na(education) & !(education %in% c(0, 1, 2, 3, 9)), 1L, 0L)
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
flag_household_duplicate_id_duplicate_id_key <- data %>% select(all_of(c("household_id")))
data <- data %>%
  mutate(
    flag_household_duplicate_id_duplicate_id = if_else(if_all(all_of(c("household_id")), ~ !is.na(.x)) & (duplicated(flag_household_duplicate_id_duplicate_id_key) | duplicated(flag_household_duplicate_id_duplicate_id_key, fromLast = TRUE)), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: household_income_outlier
# Step type: outlier_flag
# Variables: income
# Rationale: Flag unusual income values for review without treatment.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
income_q1 <- quantile(data$income, 0.25, na.rm = TRUE)
income_q3 <- quantile(data$income, 0.75, na.rm = TRUE)
income_iqr <- income_q3 - income_q1
income_lower_tukey <- income_q1 - 1.5 * income_iqr
income_upper_tukey <- income_q3 + 1.5 * income_iqr
data <- data %>%
  mutate(
    flag_income_outlier_tukey = if_else(!is.na(income) & (income < income_lower_tukey | income > income_upper_tukey), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: household_missingness
# Step type: missingness_diagnosis
# Variables: age, sex, education, income
# Rationale: Summarise missingness before any treatment decision.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missingness_summary <- bind_rows(
  data.frame(
    variable = "age",
    n_missing = sum(is.na(data$age)),
    pct_missing = mean(is.na(data$age)) * 100
  ),
  data.frame(
    variable = "sex",
    n_missing = sum(is.na(data$sex)),
    pct_missing = mean(is.na(data$sex)) * 100
  ),
  data.frame(
    variable = "education",
    n_missing = sum(is.na(data$education)),
    pct_missing = mean(is.na(data$education)) * 100
  ),
  data.frame(
    variable = "income",
    n_missing = sum(is.na(data$income)),
    pct_missing = mean(is.na(data$income)) * 100
  )
)
print(missingness_summary)
data <- data %>%
  mutate(
    missing_age = if_else(is.na(age), 1L, 0L),
    missing_sex = if_else(is.na(sex), 1L, 0L),
    missing_education = if_else(is.na(education), 1L, 0L),
    missing_income = if_else(is.na(income), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: household_income_imputation
# Step type: imputation
# Variables: household_id, income
# Rationale: Review income imputation while protecting identifiers.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Multiple imputation requires careful methodological review.
# This MVP uses mice() with simple default methods and does not automate model selection.
# Structural missing values must be excluded before imputation.
# Identifier variables are excluded from imputation methods.
# WARNING: Identifier variable "household_id" was excluded from imputation.
imputation_variables <- c("income", "age", "sex", "education", "weight")
imputation_data <- data %>% select(all_of(imputation_variables))

mice_methods <- mice::make.method(imputation_data)
mice_methods[] <- ""
mice_methods["income"] <- "pmm"

set.seed(12345)
mice_fit <- mice(imputation_data, m = 5, method = mice_methods, maxit = 10, seed = 12345)
completed_data_example <- complete(mice_fit, action = 1)

# Example analysis and pooling guidance, to be adapted by the analyst:
# fit <- with(mice_fit, lm(outcome ~ income + age + sex))
# pooled <- pool(fit)
# summary(pooled)

# -----------------------------------------------------------------------------
# Step ID: household_audit_log
# Step type: audit_log
# Variables: household_id, age, sex, education, income
# Rationale: Document generated flags and reviewer decisions.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: household_summary_report
# Step type: summary_report
# Variables: age, sex, education, income
# Rationale: Produce a basic summary section for reviewer handoff.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables <- c("age", "sex", "education", "income")
print(summary(data[summary_report_variables]))
