* =============================================================================.
* Survey Microdata Cleaning Syntax.
* Generated target: SPSS v18 command syntax.
* Generation timestamp: 2026-05-30T12:00:00.000Z.
* Cleaning Plan: Household renderer golden plan.
* Cleaning Plan ID: household-golden-plan.
* Cleaning Plan version: 0.4.1-renderer-fixture.
* Version assumption: IBM SPSS Statistics v18 command syntax.
* Assumptions:.
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use.
* No records are deleted and source variables are not overwritten by validation checks.
* =============================================================================.

* -----------------------------------------------------------------------------.
* Step ID: household_variable_labels.
* Step type: variable_label.
* Variables: household_id, strata, psu, weight, age, sex, education, income.
* Rationale: Preserve household survey labels in the analysis dataset.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VARIABLE LABELS household_id "Household identifier".
VARIABLE LABELS strata "Sampling stratum".
VARIABLE LABELS psu "Primary sampling unit".
VARIABLE LABELS weight "Household survey weight".
VARIABLE LABELS age "Age in completed years".
VARIABLE LABELS sex "Sex".
VARIABLE LABELS education "Highest education completed".
VARIABLE LABELS income "Monthly household income".

* -----------------------------------------------------------------------------.
* Step ID: household_value_labels.
* Step type: value_label.
* Variables: sex, education.
* Rationale: Preserve labelled household categorical codes.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VALUE LABELS sex
  1 "Male"
  2 "Female"
.
VALUE LABELS education
  0 "None"
  1 "Primary"
  2 "Secondary"
  3 "Tertiary"
.

* -----------------------------------------------------------------------------.
* Step ID: household_missing_codes.
* Step type: missing_value_declaration.
* Variables: age, sex, education, income.
* Rationale: Declare nonresponse codes before diagnostics or imputation.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Declared missing codes for age: 98, 99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES age (98, 99).
* Declared missing codes for sex: 9.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES sex (9).
* Declared missing codes for education: 9.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES education (9).
* Declared missing codes for income: -98, -99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES income (-98, -99).

* -----------------------------------------------------------------------------.
* Step ID: household_age_range.
* Step type: range_check.
* Variables: age.
* Rationale: Flag impossible age values.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_age_range (F1.0).
COMPUTE flag_age_range = 0.
IF (NOT MISSING(age) AND (age < 0 OR age > 120)) flag_age_range = 1.
VARIABLE LABELS flag_age_range "Flag: age outside expected range".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_income_range.
* Step type: range_check.
* Variables: income, weight.
* Rationale: Flag negative income or weight values.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_income_range (F1.0).
COMPUTE flag_income_range = 0.
IF (NOT MISSING(income) AND (income < 0)) flag_income_range = 1.
VARIABLE LABELS flag_income_range "Flag: income outside expected range".
EXECUTE.
NUMERIC flag_weight_range (F1.0).
COMPUTE flag_weight_range = 0.
IF (NOT MISSING(weight) AND (weight < 0)) flag_weight_range = 1.
VARIABLE LABELS flag_weight_range "Flag: weight outside expected range".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_sex_domain.
* Step type: domain_check.
* Variables: sex, education.
* Rationale: Flag categorical values outside documented labels.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_sex_domain (F1.0).
COMPUTE flag_sex_domain = 0.
IF (NOT MISSING(sex) AND NOT ANY(sex, 1, 2, 9)) flag_sex_domain = 1.
VARIABLE LABELS flag_sex_domain "Flag: sex outside allowed domain".
EXECUTE.
NUMERIC flag_education_domain (F1.0).
COMPUTE flag_education_domain = 0.
IF (NOT MISSING(education) AND NOT ANY(education, 0, 1, 2, 3, 9)) flag_education_domain = 1.
VARIABLE LABELS flag_education_domain "Flag: education outside allowed domain".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_duplicate_id.
* Step type: duplicate_id_check.
* Variables: household_id.
* Rationale: Flag duplicate household identifiers without deleting records.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Duplicate identifier checks sort cases to tag duplicates; no records are deleted.
SORT CASES BY household_id.
MATCH FILES FILE=* /BY household_id /FIRST=flag_household_duplicate_id_duplicate_id_first /LAST=flag_household_duplicate_id_duplicate_id_last.
NUMERIC flag_household_duplicate_id_duplicate_id (F1.0).
COMPUTE flag_household_duplicate_id_duplicate_id = (flag_household_duplicate_id_duplicate_id_first = 0 OR flag_household_duplicate_id_duplicate_id_last = 0).
VARIABLE LABELS flag_household_duplicate_id_duplicate_id "Flag: duplicate identifier for household_id".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_income_outlier.
* Step type: outlier_flag.
* Variables: income.
* Rationale: Flag unusual income values for review without treatment.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS v18 tukey outlier thresholds are emitted as a review template; verify thresholds before running production syntax.
* Review quartiles for income; replace placeholders before running the IF command.
* Tukey multiplier: 1.5.
NUMERIC flag_income_outlier_tukey (F1.0).
COMPUTE flag_income_outlier_tukey = 0.
* IF (NOT MISSING(income) AND (income < <income_lower_tukey> OR income > <income_upper_tukey>)) flag_income_outlier_tukey = 1.
VARIABLE LABELS flag_income_outlier_tukey "Flag: income possible Tukey outlier".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_missingness.
* Step type: missingness_diagnosis.
* Variables: age, sex, education, income.
* Rationale: Summarise missingness before any treatment decision.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
FREQUENCIES VARIABLES=age sex education income /FORMAT=NOTABLE /MISSING=INCLUDE.
NUMERIC missing_age (F1.0).
COMPUTE missing_age = MISSING(age).
VARIABLE LABELS missing_age "Indicator: age is missing".
EXECUTE.
NUMERIC missing_sex (F1.0).
COMPUTE missing_sex = MISSING(sex).
VARIABLE LABELS missing_sex "Indicator: sex is missing".
EXECUTE.
NUMERIC missing_education (F1.0).
COMPUTE missing_education = MISSING(education).
VARIABLE LABELS missing_education "Indicator: education is missing".
EXECUTE.
NUMERIC missing_income (F1.0).
COMPUTE missing_income = MISSING(income).
VARIABLE LABELS missing_income "Indicator: income is missing".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: household_income_imputation.
* Step type: imputation.
* Variables: household_id, income.
* Rationale: Review income imputation while protecting identifiers.
* Citation: RUBIN_1987.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS multiple imputation requires the relevant SPSS functionality and analyst review.
* Review imputation models and structural missingness before running this syntax.
* Identifier variables and structural missing values are excluded from imputation templates.
* WARNING: Identifier variable "household_id" was excluded from imputation.
MULTIPLE IMPUTATION income
  /IMPUTE METHOD=AUTO NIMPUTATIONS=5 MAXPCTMISSING=NONE
  /MISSINGSUMMARIES VARIABLES=income
  /IMPUTATIONSUMMARIES MODELS DESCRIPTIVES.
* After imputation, inspect generated imputed datasets before analysis.

* -----------------------------------------------------------------------------.
* Step ID: household_audit_log.
* Step type: audit_log.
* Variables: household_id, age, sex, education, income.
* Rationale: Document generated flags and reviewer decisions.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------.
* Step ID: household_summary_report.
* Step type: summary_report.
* Variables: age, sex, education, income.
* Rationale: Produce a basic summary section for reviewer handoff.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
FREQUENCIES VARIABLES=age sex education income /MISSING=INCLUDE.
