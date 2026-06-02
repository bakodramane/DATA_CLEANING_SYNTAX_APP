# References

This document lists the citation keys used by the rule library and generated
syntax. Citation keys must stay consistent with
`src/rules/config/default-citations.json`.

Several entries still need bibliographic verification before a production or
institutional release. Those entries are marked `NEEDS_VERIFICATION` rather than
filled with uncertain details.

## Rule-Library Citation Keys

### `UNECE_GSDEM`

UNECE. Generic Statistical Data Editing Model.

Status: `NEEDS_VERIFICATION` for exact publication year, edition, and URL.

Used for: statistical editing framework, audit logging, summary reporting, and
survey design variable review.

### `DE_WAAL_2011`

De Waal, Pannekoek and Scholtus. Handbook of Statistical Data Editing and
Imputation. 2011.

Status: `NEEDS_VERIFICATION` for publisher and full bibliographic details.

Used for: range checks, domain checks, missing-code treatment, duplicate
identifier review, outlier treatment cautions, and imputation cautions.

### `FELLEGI_HOLT_1976`

Fellegi and Holt. A Systematic Approach to Automatic Edit and Imputation. 1976.

Status: `NEEDS_VERIFICATION` for journal issue, pages, and full bibliographic
details.

Used for: edit and imputation principles, especially consistency checks.

### `TUKEY_1977`

Tukey. Exploratory Data Analysis. 1977.

Status: `NEEDS_VERIFICATION` for publisher and edition details.

Used for: Tukey boxplot outlier flagging.

### `ROUSSEEUW_CROUX_1993`

Rousseeuw and Croux. Alternatives to the Median Absolute Deviation. 1993.

Status: `NEEDS_VERIFICATION` for journal issue, pages, and full bibliographic
details.

Used for: median absolute deviation based robust outlier flagging.

### `HUBERT_VANDERVIEREN_2008`

Hubert and Vandervieren. An Adjusted Boxplot for Skewed Distributions. 2008.

Status: `NEEDS_VERIFICATION` for journal issue, pages, and full bibliographic
details.

Used for: planned adjusted boxplot outlier methods for skewed distributions.

### `HIDIROGLOU_BERTHELOT_1986`

Hidiroglou and Berthelot. Statistical Editing and Imputation for Periodic
Business Surveys. 1986.

Status: `NEEDS_VERIFICATION` for publication venue and full bibliographic
details.

Used for: planned business-survey outlier methods requiring specialist review.

### `RUBIN_1987`

Rubin. Multiple Imputation for Nonresponse in Surveys. 1987.

Status: `NEEDS_VERIFICATION` for publisher and full bibliographic details.

Used for: multiple imputation rationale.

### `LITTLE_RUBIN_2019`

Little and Rubin. Statistical Analysis with Missing Data. 2019.

Status: `NEEDS_VERIFICATION` for edition, publisher, and full bibliographic
details.

Used for: missingness diagnosis, imputation cautions, and simple fill warnings.

### `VAN_BUUREN_2018`

Van Buuren. Flexible Imputation of Missing Data. 2018.

Status: `NEEDS_VERIFICATION` for edition, publisher, and full bibliographic
details.

Used for: MICE-style imputation rationale.

### `IHSN_DDI`

IHSN/DDI metadata guidance.

Status: `NEEDS_VERIFICATION` for exact document title, version, year, and URL.

Used for: variable labels, value labels, missing codes, identifiers, structural
missingness, skip patterns, and survey design metadata.

## Software Documentation To Verify

The renderers generate syntax for the following ecosystems. The exact official
documentation references should be verified and added before institutional use:

- SPSS Statistics command syntax documentation: `NEEDS_VERIFICATION`
- Stata Base Reference Manual and multiple-imputation documentation:
  `NEEDS_VERIFICATION`
- R base documentation and package documentation for generated examples:
  `NEEDS_VERIFICATION`
- Python documentation for pandas, NumPy, and scikit-learn or imputation-related
  packages used in generated examples: `NEEDS_VERIFICATION`

## Maintenance Notes

When adding a rule:

1. Add citation keys to `src/rules/config/default-citations.json`.
2. Reuse an existing key when the same source supports the new rule.
3. Add the key to the rule configuration.
4. Update this document with verification status.
5. Add tests that confirm generated plans include the expected citation keys.
