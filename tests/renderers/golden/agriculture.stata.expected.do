* =============================================================================
* Survey Microdata Cleaning Syntax
* Generated target: Stata v14 do-file syntax
* Generation timestamp: 2026-05-30T12:00:00.000Z
* Cleaning Plan: Agriculture renderer golden plan
* Cleaning Plan ID: agriculture-golden-plan
* Cleaning Plan version: 0.4.1-renderer-fixture
* Version assumption: Stata v14
* Assumptions:
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use
* No records are deleted and validation checks write flag variables
* =============================================================================

* -----------------------------------------------------------------------------
* Step ID: ag_variable_labels
* Step type: variable_label
* Variables: holding_id, parcel_area, crop_code, livestock_count, irrigation_status, production_qty, sales_value
* Rationale: Preserve agricultural survey labels.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label variable holding_id "Agricultural holding identifier"
label variable parcel_area "Parcel area in hectares"
label variable crop_code "Main crop code"
label variable livestock_count "Number of livestock owned"
label variable irrigation_status "Parcel uses irrigation"
label variable production_qty "Production quantity harvested"
label variable sales_value "Value of crop sales"

* -----------------------------------------------------------------------------
* Step ID: ag_value_labels
* Step type: value_label
* Variables: crop_code, irrigation_status
* Rationale: Preserve categorical agricultural codes.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
label define crop_code_lbl 1 "Maize" 2 "Rice" 3 "Sorghum", replace
label values crop_code crop_code_lbl
label define irrigation_status_lbl 0 "No" 1 "Yes", replace
label values irrigation_status irrigation_status_lbl

* -----------------------------------------------------------------------------
* Step ID: ag_missing_codes
* Step type: missing_value_declaration
* Variables: crop_code, production_qty, sales_value
* Rationale: Declare agricultural nonresponse codes.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Declared missing codes for crop_code: 99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode crop_code, mv(99)
* Declared missing codes for production_qty: -99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode production_qty, mv(-99)
* Declared missing codes for sales_value: -99
* mvdecode converts declared nonresponse codes to Stata system missing; review before running
mvdecode sales_value, mv(-99)

* -----------------------------------------------------------------------------
* Step ID: ag_non_negative_ranges
* Step type: range_check
* Variables: parcel_area, livestock_count, production_qty, sales_value
* Rationale: Flag negative agricultural quantities or values.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_parcel_area_range = !missing(parcel_area) & (parcel_area < 0)
label variable flag_parcel_area_range "Flag: parcel_area outside expected range"
generate byte flag_livestock_count_range = !missing(livestock_count) & (livestock_count < 0)
label variable flag_livestock_count_range "Flag: livestock_count outside expected range"
generate byte flag_production_qty_range = !missing(production_qty) & (production_qty < 0)
label variable flag_production_qty_range "Flag: production_qty outside expected range"
generate byte flag_sales_value_range = !missing(sales_value) & (sales_value < 0)
label variable flag_sales_value_range "Flag: sales_value outside expected range"

* -----------------------------------------------------------------------------
* Step ID: ag_categorical_domains
* Step type: domain_check
* Variables: crop_code, irrigation_status
* Rationale: Flag crop and irrigation codes outside documented domains.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
generate byte flag_crop_code_domain = !missing(crop_code) & !inlist(crop_code, 1, 2, 3, 99)
label variable flag_crop_code_domain "Flag: crop_code outside allowed domain"
generate byte flag_irrigation_status_domain = !missing(irrigation_status) & !inlist(irrigation_status, 0, 1)
label variable flag_irrigation_status_domain "Flag: irrigation_status outside allowed domain"

* -----------------------------------------------------------------------------
* Step ID: ag_duplicate_holding
* Step type: duplicate_id_check
* Variables: holding_id
* Rationale: Flag duplicate holding identifiers.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Duplicate identifier checks tag records; no records are deleted.
duplicates tag holding_id, generate(flag_ag_duplicate_holding_duplic)
replace flag_ag_duplicate_holding_duplic = flag_ag_duplicate_holding_duplic > 0 if !missing(holding_id)
label variable flag_ag_duplicate_holding_duplic "Flag: duplicate identifier for holding_id"

* -----------------------------------------------------------------------------
* Step ID: ag_sales_consistency
* Step type: consistency_check
* Variables: sales_value, production_qty
* Rationale: Flag positive sales when no production quantity is reported.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* WARNING: Stata consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.
* Flag condition: sales_value > 0 && production_qty <= 0
generate byte flag_ag_sales_consistency_consis = (sales_value > 0 && production_qty <= 0)
label variable flag_ag_sales_consistency_consis "Flag: consistency review for ag_sales_consistency"

* -----------------------------------------------------------------------------
* Step ID: ag_production_outlier
* Step type: outlier_flag
* Variables: production_qty, sales_value
* Rationale: Flag unusual production and sales values for review.
* Citation: DE_WAAL_2011
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
quietly summarize production_qty, detail
scalar production_qty_median = r(p50)
tempvar absdev_production_qty
generate double `absdev_production_qty' = abs(production_qty - production_qty_median)
quietly summarize `absdev_production_qty', detail
scalar production_qty_mad = r(p50) * 1.4826
generate byte flag_production_qty_outlier_mad = !missing(production_qty) & production_qty_mad > 0 & abs(production_qty - production_qty_median) / production_qty_mad > 3.5
label variable flag_production_qty_outlier_mad "Flag: production_qty possible MAD outlier"
quietly summarize sales_value, detail
scalar sales_value_median = r(p50)
tempvar absdev_sales_value
generate double `absdev_sales_value' = abs(sales_value - sales_value_median)
quietly summarize `absdev_sales_value', detail
scalar sales_value_mad = r(p50) * 1.4826
generate byte flag_sales_value_outlier_mad = !missing(sales_value) & sales_value_mad > 0 & abs(sales_value - sales_value_median) / sales_value_mad > 3.5
label variable flag_sales_value_outlier_mad "Flag: sales_value possible MAD outlier"

* -----------------------------------------------------------------------------
* Step ID: ag_missingness
* Step type: missingness_diagnosis
* Variables: parcel_area, crop_code, production_qty, sales_value
* Rationale: Summarise missing agricultural metadata before treatment.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
misstable summarize parcel_area crop_code production_qty sales_value
generate byte missing_parcel_area = missing(parcel_area)
label variable missing_parcel_area "Indicator: parcel_area is missing"
generate byte missing_crop_code = missing(crop_code)
label variable missing_crop_code "Indicator: crop_code is missing"
generate byte missing_production_qty = missing(production_qty)
label variable missing_production_qty "Indicator: production_qty is missing"
generate byte missing_sales_value = missing(sales_value)
label variable missing_sales_value "Indicator: sales_value is missing"

* -----------------------------------------------------------------------------
* Step ID: ag_production_imputation
* Step type: imputation
* Variables: production_qty, crop_code
* Rationale: Review production and crop-code imputation with method warnings.
* Citation: RUBIN_1987
* Review requirement: Requires user review
* -----------------------------------------------------------------------------
* Multiple imputation model choices require analyst review
* Structural missing values must be excluded before imputation
* Identifier variables are excluded from mi register imputed lists
mi set mlong
mi register imputed production_qty crop_code
mi register regular parcel_area livestock_count irrigation_status
mi impute chained (pmm) production_qty (mlogit) crop_code = parcel_area livestock_count irrigation_status, add(20) rseed(12345)
* Example pooling guidance, to be adapted by the analyst:
* mi estimate: regress outcome income age sex

* -----------------------------------------------------------------------------
* Step ID: ag_audit_log
* Step type: audit_log
* Variables: holding_id, parcel_area, crop_code, production_qty
* Rationale: Document agricultural flag review.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------
* Step ID: ag_summary_report
* Step type: summary_report
* Variables: parcel_area, crop_code, production_qty, sales_value
* Rationale: Produce a basic agricultural summary section.
* Citation: DE_WAAL_2011
* Review requirement: Automatic step
* -----------------------------------------------------------------------------
* WARNING: Stata summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
summarize parcel_area crop_code production_qty sales_value
misstable summarize parcel_area crop_code production_qty sales_value
