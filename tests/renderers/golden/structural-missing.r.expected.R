# =============================================================================
# Survey Microdata Cleaning Syntax
# Generated target: R
# Generation timestamp: 2026-05-30T12:00:00.000Z
# Cleaning Plan: Structural missing renderer golden plan
# Cleaning Plan ID: structural-missing-golden-plan
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
# Step ID: struct_variable_labels
# Step type: variable_label
# Variables: person_id, age, employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Preserve labels for skip-pattern review.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Variable label: person_id
var_label(data$person_id) <- "Person identifier"
# Variable label: age
var_label(data$age) <- "Age in completed years"
# Variable label: employment_status
var_label(data$employment_status) <- "Employment status"
# Variable label: wage_income
var_label(data$wage_income) <- "Wage income for employed persons"
# Variable label: school_attendance
var_label(data$school_attendance) <- "Currently attending school"
# Variable label: reason_not_working
var_label(data$reason_not_working) <- "Reason not working"

# -----------------------------------------------------------------------------
# Step ID: struct_value_labels
# Step type: value_label
# Variables: employment_status, school_attendance, reason_not_working
# Rationale: Preserve routing-category labels.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# Value labels: employment_status
val_labels(data$employment_status) <- c("Employed" = 1, "Unemployed" = 2, "Outside labour force" = 3)
# Value labels: school_attendance
val_labels(data$school_attendance) <- c("No" = 0, "Yes" = 1)
# Value labels: reason_not_working
val_labels(data$reason_not_working) <- c("Seeking work" = 1, "Student" = 2, "Family care" = 3)

# -----------------------------------------------------------------------------
# Step ID: struct_missing_codes
# Step type: missing_value_declaration
# Variables: employment_status, wage_income
# Rationale: Declare nonresponse before routing checks.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Declared missing codes for employment_status: 9
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    employment_status = if_else(employment_status %in% c(9), NA_integer_, employment_status)
  )
# Declared missing codes for wage_income: -99
# These are recoded to NA for R analysis. Review before running.
data <- data %>%
  mutate(
    wage_income = if_else(wage_income %in% c(-99), NA_real_, wage_income)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_age_range
# Step type: range_check
# Variables: age
# Rationale: Flag impossible ages before age-based routing checks.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_age_range = if_else(!is.na(age) & (age < 0 | age > 120), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_employment_domain
# Step type: domain_check
# Variables: employment_status, school_attendance, reason_not_working
# Rationale: Flag categorical routing variables outside documented domains.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
data <- data %>%
  mutate(
    flag_employment_status_domain = if_else(!is.na(employment_status) & !(employment_status %in% c(1, 2, 3, 9)), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_school_attendance_domain = if_else(!is.na(school_attendance) & !(school_attendance %in% c(0, 1)), 1L, 0L)
  )
data <- data %>%
  mutate(
    flag_reason_not_working_domain = if_else(!is.na(reason_not_working) & !(reason_not_working %in% c(1, 2, 3)), 1L, 0L)
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
flag_struct_duplicate_person_duplicate_id_key <- data %>% select(all_of(c("person_id")))
data <- data %>%
  mutate(
    flag_struct_duplicate_person_duplicate_id = if_else(if_all(all_of(c("person_id")), ~ !is.na(.x)) & (duplicated(flag_struct_duplicate_person_duplicate_id_key) | duplicated(flag_struct_duplicate_person_duplicate_id_key, fromLast = TRUE)), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_wage_structural_missing
# Step type: structural_missing_check
# Variables: wage_income, employment_status
# Rationale: Protect wage income structural missingness for non-employed persons.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: R structural-missing checks are rendered as review flags only; values are not recoded or imputed.
# Structural-missing condition: employment_status != 1
data <- data %>%
  mutate(
    flag_wage_income_structural_missing = if_else((data$employment_status != 1) & !is.na(wage_income), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_wage_skip_pattern
# Step type: skip_pattern_check
# Variables: wage_income, employment_status
# Rationale: Flag wage income present outside the employed route.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: R skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: employment_status == 1
data <- data %>%
  mutate(
    flag_wage_income_skip_pattern = if_else(!(data$employment_status == 1) & !is.na(wage_income), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_school_skip_pattern
# Step type: skip_pattern_check
# Variables: school_attendance, age
# Rationale: Flag school attendance values outside the relevant age group.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: R skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: (age >= 6) && (age <= 24)
data <- data %>%
  mutate(
    flag_school_attendance_skip_pattern = if_else(!((data$age >= 6)  &  (data$age <= 24)) & !is.na(school_attendance), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_reason_skip_pattern
# Step type: skip_pattern_check
# Variables: reason_not_working, employment_status
# Rationale: Flag reason-not-working values for employed persons.
# Citation: DE_WAAL_2011
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# WARNING: R skip-pattern checks use simple applicability conditions and only flag possible routing violations.
# Applicable when: employment_status != 1
data <- data %>%
  mutate(
    flag_reason_not_working_skip_pattern = if_else(!(data$employment_status != 1) & !is.na(reason_not_working), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_missingness
# Step type: missingness_diagnosis
# Variables: employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Summarise item and structural missingness before treatment.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
missingness_summary <- bind_rows(
  data.frame(
    variable = "employment_status",
    n_missing = sum(is.na(data$employment_status)),
    pct_missing = mean(is.na(data$employment_status)) * 100
  ),
  data.frame(
    variable = "wage_income",
    n_missing = sum(is.na(data$wage_income)),
    pct_missing = mean(is.na(data$wage_income)) * 100
  ),
  data.frame(
    variable = "school_attendance",
    n_missing = sum(is.na(data$school_attendance)),
    pct_missing = mean(is.na(data$school_attendance)) * 100
  ),
  data.frame(
    variable = "reason_not_working",
    n_missing = sum(is.na(data$reason_not_working)),
    pct_missing = mean(is.na(data$reason_not_working)) * 100
  )
)
print(missingness_summary)
data <- data %>%
  mutate(
    missing_employment_status = if_else(is.na(employment_status), 1L, 0L),
    missing_wage_income = if_else(is.na(wage_income), 1L, 0L),
    missing_school_attendance = if_else(is.na(school_attendance), 1L, 0L),
    missing_reason_not_working = if_else(is.na(reason_not_working), 1L, 0L)
  )

# -----------------------------------------------------------------------------
# Step ID: struct_wage_imputation
# Step type: imputation
# Variables: person_id, wage_income, school_attendance
# Rationale: Show that identifiers and structural missingness are blocked from imputation examples.
# Citation: RUBIN_1987
# Review requirement: Requires user review
# -----------------------------------------------------------------------------
# Multiple imputation requires careful methodological review.
# This MVP uses mice() with simple default methods and does not automate model selection.
# Structural missing values must be excluded before imputation.
# Identifier variables are excluded from imputation methods.
# WARNING: Structural missing values were requested for imputation and have been blocked.
# WARNING: Identifier variable "person_id" was excluded from imputation.
# WARNING: Categorical variable "school_attendance" uses a mice categorical method; review category prevalence and model fit before production use.
imputation_variables <- c("wage_income", "school_attendance", "age", "employment_status")
imputation_data <- data %>% select(all_of(imputation_variables))

mice_methods <- mice::make.method(imputation_data)
mice_methods[] <- ""
mice_methods["wage_income"] <- "pmm"
mice_methods["school_attendance"] <- "logreg"

set.seed(12345)
mice_fit <- mice(imputation_data, m = 5, method = mice_methods, maxit = 10, seed = 12345)
completed_data_example <- complete(mice_fit, action = 1)

# Example analysis and pooling guidance, to be adapted by the analyst:
# fit <- with(mice_fit, lm(outcome ~ income + age + sex))
# pooled <- pool(fit)
# summary(pooled)

# -----------------------------------------------------------------------------
# Step ID: struct_audit_log
# Step type: audit_log
# Variables: person_id, wage_income, school_attendance, reason_not_working
# Rationale: Document routing flags and reviewer decisions.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R audit-log support is partial: this section documents review guidance but does not create a separate audit table.
# Review generated flag_* variables and preserve reviewer decisions outside the source variables.

# -----------------------------------------------------------------------------
# Step ID: struct_summary_report
# Step type: summary_report
# Variables: employment_status, wage_income, school_attendance, reason_not_working
# Rationale: Produce a basic structural-missing summary section.
# Citation: DE_WAAL_2011
# Review requirement: Automatic step
# -----------------------------------------------------------------------------
# WARNING: R summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summary_report_variables <- c("employment_status", "wage_income", "school_attendance", "reason_not_working")
print(summary(data[summary_report_variables]))
