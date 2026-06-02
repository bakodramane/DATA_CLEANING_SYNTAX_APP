* =============================================================================.
* Survey Microdata Cleaning Syntax.
* Generated target: SPSS v18 command syntax.
* Generation timestamp: 2026-05-30T12:00:00.000Z.
* Cleaning Plan: Agriculture renderer golden plan.
* Cleaning Plan ID: agriculture-golden-plan.
* Cleaning Plan version: 0.4.1-renderer-fixture.
* Version assumption: IBM SPSS Statistics v18 command syntax.
* Assumptions:.
* - Fixture contains metadata and Cleaning Plan steps only; it contains no survey microdata.
* - Generated syntax must be reviewed before production use and is never executed by the app.
* WARNING: Review this generated syntax before production use.
* No records are deleted and source variables are not overwritten by validation checks.
* =============================================================================.

* -----------------------------------------------------------------------------.
* Step ID: ag_variable_labels.
* Step type: variable_label.
* Variables: holding_id, parcel_area, crop_code, livestock_count, irrigation_status, production_qty, sales_value.
* Rationale: Preserve agricultural survey labels.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VARIABLE LABELS holding_id "Agricultural holding identifier".
VARIABLE LABELS parcel_area "Parcel area in hectares".
VARIABLE LABELS crop_code "Main crop code".
VARIABLE LABELS livestock_count "Number of livestock owned".
VARIABLE LABELS irrigation_status "Parcel uses irrigation".
VARIABLE LABELS production_qty "Production quantity harvested".
VARIABLE LABELS sales_value "Value of crop sales".

* -----------------------------------------------------------------------------.
* Step ID: ag_value_labels.
* Step type: value_label.
* Variables: crop_code, irrigation_status.
* Rationale: Preserve categorical agricultural codes.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
VALUE LABELS crop_code
  1 "Maize"
  2 "Rice"
  3 "Sorghum"
.
VALUE LABELS irrigation_status
  0 "No"
  1 "Yes"
.

* -----------------------------------------------------------------------------.
* Step ID: ag_missing_codes.
* Step type: missing_value_declaration.
* Variables: crop_code, production_qty, sales_value.
* Rationale: Declare agricultural nonresponse codes.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Declared missing codes for crop_code: 99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES crop_code (99).
* Declared missing codes for production_qty: -99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES production_qty (-99).
* Declared missing codes for sales_value: -99.
* SPSS user-missing declarations preserve original values; no source variable is overwritten.
MISSING VALUES sales_value (-99).

* -----------------------------------------------------------------------------.
* Step ID: ag_non_negative_ranges.
* Step type: range_check.
* Variables: parcel_area, livestock_count, production_qty, sales_value.
* Rationale: Flag negative agricultural quantities or values.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_parcel_area_range (F1.0).
COMPUTE flag_parcel_area_range = 0.
IF (NOT MISSING(parcel_area) AND (parcel_area < 0)) flag_parcel_area_range = 1.
VARIABLE LABELS flag_parcel_area_range "Flag: parcel_area outside expected range".
EXECUTE.
NUMERIC flag_livestock_count_range (F1.0).
COMPUTE flag_livestock_count_range = 0.
IF (NOT MISSING(livestock_count) AND (livestock_count < 0)) flag_livestock_count_range = 1.
VARIABLE LABELS flag_livestock_count_range "Flag: livestock_count outside expected range".
EXECUTE.
NUMERIC flag_production_qty_range (F1.0).
COMPUTE flag_production_qty_range = 0.
IF (NOT MISSING(production_qty) AND (production_qty < 0)) flag_production_qty_range = 1.
VARIABLE LABELS flag_production_qty_range "Flag: production_qty outside expected range".
EXECUTE.
NUMERIC flag_sales_value_range (F1.0).
COMPUTE flag_sales_value_range = 0.
IF (NOT MISSING(sales_value) AND (sales_value < 0)) flag_sales_value_range = 1.
VARIABLE LABELS flag_sales_value_range "Flag: sales_value outside expected range".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_categorical_domains.
* Step type: domain_check.
* Variables: crop_code, irrigation_status.
* Rationale: Flag crop and irrigation codes outside documented domains.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
NUMERIC flag_crop_code_domain (F1.0).
COMPUTE flag_crop_code_domain = 0.
IF (NOT MISSING(crop_code) AND NOT ANY(crop_code, 1, 2, 3, 99)) flag_crop_code_domain = 1.
VARIABLE LABELS flag_crop_code_domain "Flag: crop_code outside allowed domain".
EXECUTE.
NUMERIC flag_irrigation_status_domain (F1.0).
COMPUTE flag_irrigation_status_domain = 0.
IF (NOT MISSING(irrigation_status) AND NOT ANY(irrigation_status, 0, 1)) flag_irrigation_status_domain = 1.
VARIABLE LABELS flag_irrigation_status_domain "Flag: irrigation_status outside allowed domain".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_duplicate_holding.
* Step type: duplicate_id_check.
* Variables: holding_id.
* Rationale: Flag duplicate holding identifiers.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* Duplicate identifier checks sort cases to tag duplicates; no records are deleted.
SORT CASES BY holding_id.
MATCH FILES FILE=* /BY holding_id /FIRST=flag_ag_duplicate_holding_duplicate_id_first /LAST=flag_ag_duplicate_holding_duplicate_id_last.
NUMERIC flag_ag_duplicate_holding_duplicate_id (F1.0).
COMPUTE flag_ag_duplicate_holding_duplicate_id = (flag_ag_duplicate_holding_duplicate_id_first = 0 OR flag_ag_duplicate_holding_duplicate_id_last = 0).
VARIABLE LABELS flag_ag_duplicate_holding_duplicate_id "Flag: duplicate identifier for holding_id".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_sales_consistency.
* Step type: consistency_check.
* Variables: sales_value, production_qty.
* Rationale: Flag positive sales when no production quantity is reported.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.
* Flag condition: sales_value > 0 && production_qty <= 0.
NUMERIC flag_ag_sales_consistency_consistency (F1.0).
COMPUTE flag_ag_sales_consistency_consistency = 0.
IF (sales_value > 0  AND  production_qty <= 0) flag_ag_sales_consistency_consistency = 1.
VARIABLE LABELS flag_ag_sales_consistency_consistency "Flag: consistency review for ag_sales_consistency".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_production_outlier.
* Step type: outlier_flag.
* Variables: production_qty, sales_value.
* Rationale: Flag unusual production and sales values for review.
* Citation: DE_WAAL_2011.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS v18 mad outlier thresholds are emitted as a review template; verify thresholds before running production syntax.
* Replace the placeholder median and MAD values for production_qty after review.
* Example threshold: absolute robust z-score greater than 3.5.
NUMERIC flag_production_qty_outlier_mad (F1.0).
COMPUTE flag_production_qty_outlier_mad = 0.
* IF (NOT MISSING(production_qty) AND <production_qty_mad> > 0 AND ABS(production_qty - <production_qty_median>) / <production_qty_mad> > 3.5) flag_production_qty_outlier_mad = 1.
VARIABLE LABELS flag_production_qty_outlier_mad "Flag: production_qty possible MAD outlier".
EXECUTE.
* WARNING: SPSS v18 mad outlier thresholds are emitted as a review template; verify thresholds before running production syntax.
* Replace the placeholder median and MAD values for sales_value after review.
* Example threshold: absolute robust z-score greater than 3.5.
NUMERIC flag_sales_value_outlier_mad (F1.0).
COMPUTE flag_sales_value_outlier_mad = 0.
* IF (NOT MISSING(sales_value) AND <sales_value_mad> > 0 AND ABS(sales_value - <sales_value_median>) / <sales_value_mad> > 3.5) flag_sales_value_outlier_mad = 1.
VARIABLE LABELS flag_sales_value_outlier_mad "Flag: sales_value possible MAD outlier".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_missingness.
* Step type: missingness_diagnosis.
* Variables: parcel_area, crop_code, production_qty, sales_value.
* Rationale: Summarise missing agricultural metadata before treatment.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
FREQUENCIES VARIABLES=parcel_area crop_code production_qty sales_value /FORMAT=NOTABLE /MISSING=INCLUDE.
NUMERIC missing_parcel_area (F1.0).
COMPUTE missing_parcel_area = MISSING(parcel_area).
VARIABLE LABELS missing_parcel_area "Indicator: parcel_area is missing".
EXECUTE.
NUMERIC missing_crop_code (F1.0).
COMPUTE missing_crop_code = MISSING(crop_code).
VARIABLE LABELS missing_crop_code "Indicator: crop_code is missing".
EXECUTE.
NUMERIC missing_production_qty (F1.0).
COMPUTE missing_production_qty = MISSING(production_qty).
VARIABLE LABELS missing_production_qty "Indicator: production_qty is missing".
EXECUTE.
NUMERIC missing_sales_value (F1.0).
COMPUTE missing_sales_value = MISSING(sales_value).
VARIABLE LABELS missing_sales_value "Indicator: sales_value is missing".
EXECUTE.

* -----------------------------------------------------------------------------.
* Step ID: ag_production_imputation.
* Step type: imputation.
* Variables: production_qty, crop_code.
* Rationale: Review production and crop-code imputation with method warnings.
* Citation: RUBIN_1987.
* Review requirement: Requires user review.
* -----------------------------------------------------------------------------.
* WARNING: SPSS multiple imputation requires the relevant SPSS functionality and analyst review.
* Review imputation models and structural missingness before running this syntax.
* Identifier variables and structural missing values are excluded from imputation templates.
MULTIPLE IMPUTATION production_qty crop_code
  /IMPUTE METHOD=AUTO NIMPUTATIONS=5 MAXPCTMISSING=NONE
  /MISSINGSUMMARIES VARIABLES=production_qty crop_code
  /IMPUTATIONSUMMARIES MODELS DESCRIPTIVES.
* After imputation, inspect generated imputed datasets before analysis.

* -----------------------------------------------------------------------------.
* Step ID: ag_audit_log.
* Step type: audit_log.
* Variables: holding_id, parcel_area, crop_code, production_qty.
* Rationale: Document agricultural flag review.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS audit-log support is partial: this section documents review guidance but does not create a separate audit table.
* Review generated flag_* variables and preserve reviewer decisions outside the source variables.

* -----------------------------------------------------------------------------.
* Step ID: ag_summary_report.
* Step type: summary_report.
* Variables: parcel_area, crop_code, production_qty, sales_value.
* Rationale: Produce a basic agricultural summary section.
* Citation: DE_WAAL_2011.
* Review requirement: Automatic step.
* -----------------------------------------------------------------------------.
* WARNING: SPSS summary-report support is partial: basic summaries are emitted for review, not a publication-ready report.
FREQUENCIES VARIABLES=parcel_area crop_code production_qty sales_value /MISSING=INCLUDE.
