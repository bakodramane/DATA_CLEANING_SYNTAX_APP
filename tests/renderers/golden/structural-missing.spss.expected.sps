* =============================================================================.
* Survey Microdata Cleaning Syntax.
* Generated target: SPSS v18 command syntax.
* Generation timestamp: 2026-05-30T12:00:00.000Z.
* Cleaning Plan: Structural missing renderer golden plan.
* Cleaning Plan ID: structural-missing-golden-plan.
* Cleaning Plan version: 0.4.1-renderer-fixture.
* Version assumption: IBM SPSS Statistics v18 command syntax.
* Assumptions:.
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use.
* No records are deleted and source variables are not overwritten by validation checks.
* =============================================================================.

* -----------------------------------------------------------------------------.
* Step ID: struct_variable_labels.
* Step type: variable_label.
* Variables: person_id, age, employment_status, wage_income, school_attendance, reason_not_working.
* Rationale: Preserve labels for skip-pattern review.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VARIABLE LABELS person_id "Person identifier".
VARIABLE LABELS age "Age in completed years".
VARIABLE LABELS employment_status "Employment status".
VARIABLE LABELS wage_income "Wage income for employed persons".
VARIABLE LABELS school_attendance "Currently attending school".
VARIABLE LABELS reason_not_working "Reason not working".

* -----------------------------------------------------------------------------.
* Step ID: struct_value_labels.
* Step type: value_label.
* Variables: employment_status, school_attendance, reason_not_working.
* Rationale: Preserve routing-category labels.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VALUE LABELS employment_status
  1 "Employed"
  2 "Unemployed"
  3 "Outside labour force"
.
VALUE LABELS school_attendance
  0 "No"
  1 "Yes"
.
VALUE LABELS reason_not_working
  1 "Seeking work"
  2 "Student"
  3 "Family care"
.

* -----------------------------------------------------------------------------.
* Step ID: struct_missing_codes.
* Step type: missing_value_declaration.
* Variables: employment_status, wage_income.
* Rationale: Declare nonresponse before routing checks.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Declared missing codes for employment_status: 9.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES employment_status (9).
* Declared missing codes for wage_income: -99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES wage_income (-99).

* -----------------------------------------------------------------------------.
* Step ID: struct_age_range.
* Step type: range_check.
* Variables: age.
* Rationale: Flag impossible ages before age-based routing checks.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_age_range (F1.0).
COMPUTE flag_age_range = 0.
IF (NOT MISSING(age) AND (age < 0 OR age > 120)) flag_age_range = 1.
VARIABLE LABELS flag_age_range "Flag: age outside expected range".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_employment_domain.
* Step type: domain_check.
* Variables: employment_status, school_attendance, reason_not_working.
* Rationale: Flag categorical routing variables outside documented domains.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_employment_status_domain (F1.0).
COMPUTE flag_employment_status_domain = 0.
IF (NOT MISSING(employment_status) AND NOT ANY(employment_status, 1, 2, 3, 9)) flag_employment_status_domain = 1.
VARIABLE LABELS flag_employment_status_domain "Flag: employment_status outside allowed domain".
EXECUTE.
NUMERIC flag_school_attendance_domain (F1.0).
COMPUTE flag_school_attendance_domain = 0.
IF (NOT MISSING(school_attendance) AND NOT ANY(school_attendance, 0, 1)) flag_school_attendance_domain = 1.
VARIABLE LABELS flag_school_attendance_domain "Flag: school_attendance outside allowed domain".
EXECUTE.
NUMERIC flag_reason_not_working_domain (F1.0).
COMPUTE flag_reason_not_working_domain = 0.
IF (NOT MISSING(reason_not_working) AND NOT ANY(reason_not_working, 1, 2, 3)) flag_reason_not_working_domain = 1.
VARIABLE LABELS flag_reason_not_working_domain "Flag: reason_not_working outside allowed domain".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_duplicate_person.
* Step type: duplicate_id_check.
* Variables: person_id.
* Rationale: Flag duplicate person identifiers.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Duplicate identifier checks sort cases to tag duplicates; no records are deleted.
SORT CASES BY person_id.
MATCH FILES FILE=* /BY person_id /FIRST=flag_struct_duplicate_person_duplicate_id_first /LAST=flag_struct_duplicate_person_duplicate_id_last.
NUMERIC flag_struct_duplicate_person_duplicate_id (F1.0).
COMPUTE flag_struct_duplicate_person_duplicate_id = (flag_struct_duplicate_person_duplicate_id_first = 0 OR flag_struct_duplicate_person_duplicate_id_last = 0).
VARIABLE LABELS flag_struct_duplicate_person_duplicate_id "Flag: duplicate identifier for person_id".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_wage_structural_missing.
* Step type: structural_missing_check.
* Variables: wage_income, employment_status.
* Rationale: Protect wage income structural missingness for non-employed persons.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS structural-missing checks are rendered as review flags only; values are not recoded or imputed.
* Structural-missing condition: employment_status != 1.
NUMERIC flag_wage_income_structural_missing (F1.0).
COMPUTE flag_wage_income_structural_missing = 0.
IF ((employment_status <> 1) AND NOT MISSING(wage_income)) flag_wage_income_structural_missing = 1.
VARIABLE LABELS flag_wage_income_structural_missing "Flag: wage_income present when structurally missing".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_wage_skip_pattern.
* Step type: skip_pattern_check.
* Variables: wage_income, employment_status.
* Rationale: Flag wage income present outside the employed route.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: employment_status == 1.
NUMERIC flag_wage_income_skip_pattern (F1.0).
COMPUTE flag_wage_income_skip_pattern = 0.
IF (NOT (employment_status = 1) AND NOT MISSING(wage_income)) flag_wage_income_skip_pattern = 1.
VARIABLE LABELS flag_wage_income_skip_pattern "Flag: wage_income present outside skip pattern".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_school_skip_pattern.
* Step type: skip_pattern_check.
* Variables: school_attendance, age.
* Rationale: Flag school attendance values outside the relevant age group.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: (age >= 6) && (age <= 24).
NUMERIC flag_school_attendance_skip_pattern (F1.0).
COMPUTE flag_school_attendance_skip_pattern = 0.
IF (NOT ((age >= 6)  AND  (age <= 24)) AND NOT MISSING(school_attendance)) flag_school_attendance_skip_pattern = 1.
VARIABLE LABELS flag_school_attendance_skip_pattern "Flag: school_attendance present outside skip pattern".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_reason_skip_pattern.
* Step type: skip_pattern_check.
* Variables: reason_not_working, employment_status.
* Rationale: Flag reason-not-working values for employed persons.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: employment_status != 1.
NUMERIC flag_reason_not_working_skip_pattern (F1.0).
COMPUTE flag_reason_not_working_skip_pattern = 0.
IF (NOT (employment_status <> 1) AND NOT MISSING(reason_not_working)) flag_reason_not_working_skip_pattern = 1.
VARIABLE LABELS flag_reason_not_working_skip_pattern "Flag: reason_not_working present outside skip pattern".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_missingness.
* Step type: missingness_diagnosis.
* Variables: employment_status, wage_income, school_attendance, reason_not_working.
* Rationale: Summarise item and structural missingness before treatment.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
FREQUENCIES VARIABLES=employment_status wage_income school_attendance reason_not_working /FORMAT=NOTABLE /MISSING=INCLUDE.
NUMERIC missing_employment_status (F1.0).
COMPUTE missing_employment_status = MISSING(employment_status).
VARIABLE LABELS missing_employment_status "Indicator: employment_status is missing".
EXECUTE.
NUMERIC missing_wage_income (F1.0).
COMPUTE missing_wage_income = MISSING(wage_income).
VARIABLE LABELS missing_wage_income "Indicator: wage_income is missing".
EXECUTE.
NUMERIC missing_school_attendance (F1.0).
COMPUTE missing_school_attendance = MISSING(school_attendance).
VARIABLE LABELS missing_school_attendance "Indicator: school_attendance is missing".
EXECUTE.
NUMERIC missing_reason_not_working (F1.0).
COMPUTE missing_reason_not_working = MISSING(reason_not_working).
VARIABLE LABELS missing_reason_not_working "Indicator: reason_not_working is missing".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: struct_wage_imputation.
* Step type: imputation.
* Variables: person_id, wage_income, school_attendance.
* Rationale: Show that identifiers and structural missingness are blocked from imputation examples.
* Citation: RUBIN_1987.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS multiple imputation requires the relevant SPSS functionality and analyst review.
* Review imputation models and structural missingness before running this syntax.
* Identifier variables and structural missing values are excluded from imputation templates.
* WARNING: Structural missing values were requested for imputation and have been blocked.
* WARNING: Identifier variable "person_id" was excluded from imputation.
MULTIPLE IMPUTATION wage_income school_attendance
  /IMPUTE METHOD=AUTO NIMPUTATIONS=5 MAXPCTMISSING=NONE
  /MISSINGSUMMARIES VARIABLES=wage_income school_attendance
  /IMPUTATIONSUMMARIES MODELS DESCRIPTIVES.
* After imputation, inspect generated imputed datasets before analysis.

* -----------------------------------------------------------------------------.
* Step ID: struct_audit_log.
* Step type: audit_log.
* Variables: person_id, wage_income, school_attendance, reason_not_working.
* Rationale: Document routing flags and reviewer decisions.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------.
* Step ID: struct_summary_report.
* Step type: summary_report.
* Variables: employment_status, wage_income, school_attendance, reason_not_working.
* Rationale: Produce a basic structural-missing summary section.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
FREQUENCIES VARIABLES=employment_status wage_income school_attendance reason_not_working /MISSING=INCLUDE.
