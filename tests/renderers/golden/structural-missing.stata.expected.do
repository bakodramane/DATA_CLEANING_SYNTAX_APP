* =============================================================================
* Survey Microdata Cleaning Syntax
* Generated target: Stata v14 do-file syntax
* Generation timestamp: 2026-05-30T12:00:00.000Z
* Cleaning Plan: Structural missing renderer golden plan
* Cleaning Plan ID: structural-missing-golden-plan
* Cleaning Plan version: 0.4.1-renderer-fixture
* Version assumption: Stata v14
* Assumptions:
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use
* No records are deleted and validation checks write flag variables
* =============================================================================

* -----------------------------------------------------------------------------
* Step ID: struct_variable_labels
* Step type: variable_label
* Variables: person_id, age, employment_status, wage_income, school_attendance, reason_not_working
* Rationale: Preserve labels for skip-pattern review.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label variable person_id "Person identifier"
label variable age "Age in completed years"
label variable employment_status "Employment status"
label variable wage_income "Wage income for employed persons"
label variable school_attendance "Currently attending school"
label variable reason_not_working "Reason not working"

* -----------------------------------------------------------------------------
* Step ID: struct_value_labels
* Step type: value_label
* Variables: employment_status, school_attendance, reason_not_working
* Rationale: Preserve routing-category labels.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label define employment_status_lbl 1 "Employed" 2 "Unemployed" 3 "Outside labour force", replace
label values employment_status employment_status_lbl
label define school_attendance_lbl 0 "No" 1 "Yes", replace
label values school_attendance school_attendance_lbl
label define reason_not_working_lbl 1 "Seeking work" 2 "Student" 3 "Family care", replace
label values reason_not_working reason_not_working_lbl

* -----------------------------------------------------------------------------
* Step ID: struct_missing_codes
* Step type: missing_value_declaration
* Variables: employment_status, wage_income
* Rationale: Declare nonresponse before routing checks.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Declared missing codes for employment_status: 9
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode employment_status, mv(9)
* Declared missing codes for wage_income: -99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode wage_income, mv(-99)

* -----------------------------------------------------------------------------
* Step ID: struct_age_range
* Step type: range_check
* Variables: age
* Rationale: Flag impossible ages before age-based routing checks.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_age_range = !missing(age) & (age < 0 | age > 120)
label variable flag_age_range "Flag: age outside expected range"

* -----------------------------------------------------------------------------
* Step ID: struct_employment_domain
* Step type: domain_check
* Variables: employment_status, school_attendance, reason_not_working
* Rationale: Flag categorical routing variables outside documented domains.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_employment_status_domain = !missing(employment_status) & !inlist(employment_status, 1, 2, 3, 9)
label variable flag_employment_status_domain "Flag: employment_status outside allowed domain"
generate byte flag_school_attendance_domain = !missing(school_attendance) & !inlist(school_attendance, 0, 1)
label variable flag_school_attendance_domain "Flag: school_attendance outside allowed domain"
generate byte flag_reason_not_working_domain = !missing(reason_not_working) & !inlist(reason_not_working, 1, 2, 3)
label variable flag_reason_not_working_domain "Flag: reason_not_working outside allowed domain"

* -----------------------------------------------------------------------------
* Step ID: struct_duplicate_person
* Step type: duplicate_id_check
* Variables: person_id
* Rationale: Flag duplicate person identifiers.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Duplicate identifier checks tag records; no records are deleted.
duplicates tag person_id, generate(flag_struct_duplicate_person_dup)
replace flag_struct_duplicate_person_dup = flag_struct_duplicate_person_dup > 0 if !missing(person_id)
label variable flag_struct_duplicate_person_dup "Flag: duplicate identifier for person_id"

* -----------------------------------------------------------------------------
* Step ID: struct_wage_structural_missing
* Step type: structural_missing_check
* Variables: wage_income, employment_status
* Rationale: Protect wage income structural missingness for non-employed persons.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* WARNING: Stata structural-missing checks are rendered as review flags only; values are not recoded or imputed.
* Structural-missing condition: employment_status != 1
generate byte flag_wage_income_structural_missing = (employment_status != 1) & !missing(wage_income)
label variable flag_wage_income_structural_missing "Flag: wage_income present when structurally missing"

* -----------------------------------------------------------------------------
* Step ID: struct_wage_skip_pattern
* Step type: skip_pattern_check
* Variables: wage_income, employment_status
* Rationale: Flag wage income present outside the employed route.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* WARNING: Stata skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: employment_status == 1
generate byte flag_wage_income_skip_pattern = !(employment_status == 1) & !missing(wage_income)
label variable flag_wage_income_skip_pattern "Flag: wage_income present outside skip pattern"

* -----------------------------------------------------------------------------
* Step ID: struct_school_skip_pattern
* Step type: skip_pattern_check
* Variables: school_attendance, age
* Rationale: Flag school attendance values outside the relevant age group.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* WARNING: Stata skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: (age >= 6) && (age <= 24)
generate byte flag_school_attendance_skip_pattern = !((age >= 6) && (age <= 24)) & !missing(school_attendance)
label variable flag_school_attendance_skip_pattern "Flag: school_attendance present outside skip pattern"

* -----------------------------------------------------------------------------
* Step ID: struct_reason_skip_pattern
* Step type: skip_pattern_check
* Variables: reason_not_working, employment_status
* Rationale: Flag reason-not-working values for employed persons.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* WARNING: Stata skip-pattern checks use simple applicability conditions and only flag possible routing violations.
* Applicable when: employment_status != 1
generate byte flag_reason_not_working_skip_pattern = !(employment_status != 1) & !missing(reason_not_working)
label variable flag_reason_not_working_skip_pattern "Flag: reason_not_working present outside skip pattern"

* -----------------------------------------------------------------------------
* Step ID: struct_missingness
* Step type: missingness_diagnosis
* Variables: employment_status, wage_income, school_attendance, reason_not_working
* Rationale: Summarise item and structural missingness before treatment.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
misstable summarize employment_status wage_income school_attendance reason_not_working
generate byte missing_employment_status = missing(employment_status)
label variable missing_employment_status "Indicator: employment_status is missing"
generate byte missing_wage_income = missing(wage_income)
label variable missing_wage_income "Indicator: wage_income is missing"
generate byte missing_school_attendance = missing(school_attendance)
label variable missing_school_attendance "Indicator: school_attendance is missing"
generate byte missing_reason_not_working = missing(reason_not_working)
label variable missing_reason_not_working "Indicator: reason_not_working is missing"

* -----------------------------------------------------------------------------
* Step ID: struct_wage_imputation
* Step type: imputation
* Variables: person_id, wage_income, school_attendance
* Rationale: Show that identifiers and structural missingness are blocked from imputation examples.
* Citation: RUBIN_1987
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Multiple imputation model choices require analyst review
* Structural missing values must be excluded before imputation
* Identifier variables are excluded from mi register imputed lists
* WARNING: Structural missing values were requested for imputation and have been blocked.
* WARNING: Identifier variable "person_id" was excluded from imputation.
mi set mlong
mi register imputed wage_income school_attendance
mi register regular age employment_status
mi impute chained (pmm) wage_income (logit) school_attendance = age employment_status, add(20) rseed(12345)
* Example pooling guidance, to be adapted by the analyst:
* mi estimate: regress outcome income age sex

* -----------------------------------------------------------------------------
* Step ID: struct_audit_log
* Step type: audit_log
* Variables: person_id, wage_income, school_attendance, reason_not_working
* Rationale: Document routing flags and reviewer decisions.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------
* Step ID: struct_summary_report
* Step type: summary_report
* Variables: employment_status, wage_income, school_attendance, reason_not_working
* Rationale: Produce a basic structural-missing summary section.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summarize employment_status wage_income school_attendance reason_not_working
misstable summarize employment_status wage_income school_attendance reason_not_working
