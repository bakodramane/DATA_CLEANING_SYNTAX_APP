* =============================================================================
* Survey Microdata Cleaning Syntax
* Generated target: Stata v14 do-file syntax
* Generation timestamp: 2026-05-30T12:00:00.000Z
* Cleaning Plan: Household renderer golden plan
* Cleaning Plan ID: household-golden-plan
* Cleaning Plan version: 0.4.1-renderer-fixture
* Version assumption: Stata v14
* Assumptions:
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use
* No records are deleted and validation checks write flag variables
* =============================================================================

* -----------------------------------------------------------------------------
* Step ID: household_variable_labels
* Step type: variable_label
* Variables: household_id, strata, psu, weight, age, sex, education, income
* Rationale: Preserve household survey labels in the analysis dataset.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label variable household_id "Household identifier"
label variable strata "Sampling stratum"
label variable psu "Primary sampling unit"
label variable weight "Household survey weight"
label variable age "Age in completed years"
label variable sex "Sex"
label variable education "Highest education completed"
label variable income "Monthly household income"

* -----------------------------------------------------------------------------
* Step ID: household_value_labels
* Step type: value_label
* Variables: sex, education
* Rationale: Preserve labelled household categorical codes.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label define sex_lbl 1 "Male" 2 "Female", replace
label values sex sex_lbl
label define education_lbl 0 "None" 1 "Primary" 2 "Secondary" 3 "Tertiary", replace
label values education education_lbl

* -----------------------------------------------------------------------------
* Step ID: household_missing_codes
* Step type: missing_value_declaration
* Variables: age, sex, education, income
* Rationale: Declare nonresponse codes before diagnostics or imputation.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Declared missing codes for age: 98 99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode age, mv(98 99)
* Declared missing codes for sex: 9
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode sex, mv(9)
* Declared missing codes for education: 9
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode education, mv(9)
* Declared missing codes for income: -98 -99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode income, mv(-98 -99)

* -----------------------------------------------------------------------------
* Step ID: household_age_range
* Step type: range_check
* Variables: age
* Rationale: Flag impossible age values.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_age_range = !missing(age) & (age < 0 | age > 120)
label variable flag_age_range "Flag: age outside expected range"

* -----------------------------------------------------------------------------
* Step ID: household_income_range
* Step type: range_check
* Variables: income, weight
* Rationale: Flag negative income or weight values.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_income_range = !missing(income) & (income < 0)
label variable flag_income_range "Flag: income outside expected range"
generate byte flag_weight_range = !missing(weight) & (weight < 0)
label variable flag_weight_range "Flag: weight outside expected range"

* -----------------------------------------------------------------------------
* Step ID: household_sex_domain
* Step type: domain_check
* Variables: sex, education
* Rationale: Flag categorical values outside documented labels.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_sex_domain = !missing(sex) & !inlist(sex, 1, 2, 9)
label variable flag_sex_domain "Flag: sex outside allowed domain"
generate byte flag_education_domain = !missing(education) & !inlist(education, 0, 1, 2, 3, 9)
label variable flag_education_domain "Flag: education outside allowed domain"

* -----------------------------------------------------------------------------
* Step ID: household_duplicate_id
* Step type: duplicate_id_check
* Variables: household_id
* Rationale: Flag duplicate household identifiers without deleting records.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Duplicate identifier checks tag records; no records are deleted.
duplicates tag household_id, generate(flag_household_duplicate_id_dupl)
replace flag_household_duplicate_id_dupl = flag_household_duplicate_id_dupl > 0 if !missing(household_id)
label variable flag_household_duplicate_id_dupl "Flag: duplicate identifier for household_id"

* -----------------------------------------------------------------------------
* Step ID: household_income_outlier
* Step type: outlier_flag
* Variables: income
* Rationale: Flag unusual income values for review without treatment.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
quietly summarize income, detail
scalar income_q1 = r(p25)
scalar income_q3 = r(p75)
scalar income_iqr = income_q3 - income_q1
scalar income_lower_tukey = income_q1 - 1.5 * income_iqr
scalar income_upper_tukey = income_q3 + 1.5 * income_iqr
generate byte flag_income_outlier_tukey = !missing(income) & (income < income_lower_tukey | income > income_upper_tukey)
label variable flag_income_outlier_tukey "Flag: income possible Tukey outlier"

* -----------------------------------------------------------------------------
* Step ID: household_missingness
* Step type: missingness_diagnosis
* Variables: age, sex, education, income
* Rationale: Summarise missingness before any treatment decision.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
misstable summarize age sex education income
generate byte missing_age = missing(age)
label variable missing_age "Indicator: age is missing"
generate byte missing_sex = missing(sex)
label variable missing_sex "Indicator: sex is missing"
generate byte missing_education = missing(education)
label variable missing_education "Indicator: education is missing"
generate byte missing_income = missing(income)
label variable missing_income "Indicator: income is missing"

* -----------------------------------------------------------------------------
* Step ID: household_income_imputation
* Step type: imputation
* Variables: household_id, income
* Rationale: Review income imputation while protecting identifiers.
* Citation: RUBIN_1987
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Multiple imputation model choices require analyst review
* Structural missing values must be excluded before imputation
* Identifier variables are excluded from mi register imputed lists
* WARNING: Identifier variable "household_id" was excluded from imputation.
mi set mlong
mi register imputed income
mi register regular age sex education weight
mi impute chained (pmm) income = age sex education weight, add(20) rseed(12345)
* Example pooling guidance, to be adapted by the analyst:
* mi estimate: regress outcome income age sex

* -----------------------------------------------------------------------------
* Step ID: household_audit_log
* Step type: audit_log
* Variables: household_id, age, sex, education, income
* Rationale: Document generated flags and reviewer decisions.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------
* Step ID: household_summary_report
* Step type: summary_report
* Variables: age, sex, education, income
* Rationale: Produce a basic summary section for reviewer handoff.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summarize age sex education income
misstable summarize age sex education income
