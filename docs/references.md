# References

This document lists the citation keys used by the rule library and generated
syntax. Citation keys must stay consistent with
`src/rules/config/default-citations.json`.

Phase 9 verified the rule-library citation keys against authoritative or
near-authoritative sources where feasible. Remaining uncertain details are
marked `NEEDS_VERIFICATION` instead of being guessed.

## Rule-Library Citation Keys

All citation keys below are used by rules in `src/rules/config/default-rules.json`.
No configured rule-library citation keys are currently unused.

### `UNECE_GSDEM`

United Nations Economic Commission for Europe. (2019). _Generic Statistical Data
Editing Model (GSDEM), Version 2.0_.

Verified source: <https://unece.org/statistics/documents/2019/06/gsdem-v20>

Used for: statistical editing framework, audit logging, summary reporting, and
survey design variable review.

### `DE_WAAL_2011`

de Waal, T., Pannekoek, J., & Scholtus, S. (2011). _Handbook of Statistical Data
Editing and Imputation_. Wiley Handbooks in Survey Methodology. John Wiley &
Sons.

Verified source:
<https://www.wiley-vch.de/en/areas-interest/mathematics-statistics/handbook-of-statistical-data-editing-and-imputation-978-0-470-54280-4>

Used for: range checks, domain checks, missing-code treatment, duplicate
identifier review, outlier treatment cautions, and imputation cautions.

### `FELLEGI_HOLT_1976`

Fellegi, I. P., & Holt, D. (1976). A systematic approach to automatic edit and
imputation. _Journal of the American Statistical Association_, 71(353), 17-35.
<https://doi.org/10.1080/01621459.1976.10481472>

Verified source:
<https://www.tandfonline.com/doi/abs/10.1080/01621459.1976.10481472>

Used for: edit and imputation principles, especially consistency checks.

### `TUKEY_1977`

Tukey, J. W. (1977). _Exploratory Data Analysis_. Reading, Massachusetts:
Addison-Wesley Publishing Company.

Verified source: <https://search.worldcat.org/title/03058187>

Used for: Tukey boxplot outlier flagging.

### `ROUSSEEUW_CROUX_1993`

Rousseeuw, P. J., & Croux, C. (1993). Alternatives to the median absolute
deviation. _Journal of the American Statistical Association_, 88(424),
1273-1283. <https://doi.org/10.1080/01621459.1993.10476408>

Verified source:
<https://www.tandfonline.com/doi/abs/10.1080/01621459.1993.10476408>

Used for: median absolute deviation based robust outlier flagging.

### `HUBERT_VANDERVIEREN_2008`

Hubert, M., & Vandervieren, E. (2008). An adjusted boxplot for skewed
distributions. _Computational Statistics & Data Analysis_, 52(12), 5186-5201.
<https://doi.org/10.1016/j.csda.2007.11.008>

Verification status: DOI, journal, volume, issue, and page range were
cross-checked from indexed package/documentation references. The primary article
landing page remains `NEEDS_VERIFICATION` before institutional release.

Used for: planned adjusted boxplot outlier methods for skewed distributions.

### `HIDIROGLOU_BERTHELOT_1986`

Hidiroglou, M., & Berthelot, J.-M. (1986). Statistical editing and imputation for
periodic business surveys. _Survey Methodology_, issue 1986001.

Verified source:
<https://www150.statcan.gc.ca/n1/en/catalogue/12-001-X198600114442>

Used for: planned business-survey outlier methods requiring specialist review.

### `RUBIN_1987`

Rubin, D. B. (1987). _Multiple Imputation for Nonresponse in Surveys_. Wiley
Series in Probability and Statistics. <https://doi.org/10.1002/9780470316696>

Verified sources:
<https://www.wiley-vch.de/en/areas-interest/mathematics-statistics/statistics-16st/survey-research-methods-sampling-16st6/multiple-imputation-for-nonresponse-in-surveys-978-0-471-65574-9>
and <https://cir.nii.ac.jp/crid/1363388844209853184>

Used for: multiple imputation rationale.

### `LITTLE_RUBIN_2019`

Little, R. J. A., & Rubin, D. B. (2019). _Statistical Analysis with Missing
Data_ (3rd ed.). Wiley Series in Probability and Statistics.
<https://doi.org/10.1002/9781119482260>

Verified sources:
<https://www.wiley-vch.de/en/areas-interest/mathematics-statistics/statistical-analysis-with-missing-data-978-0-470-52679-8>
and <https://cir.nii.ac.jp/crid/1360855569986150528>

Used for: missingness diagnosis, imputation cautions, and simple fill warnings.

### `VAN_BUUREN_2018`

van Buuren, S. (2018). _Flexible Imputation of Missing Data_ (2nd ed.). Chapman
& Hall/CRC. <https://doi.org/10.1201/9780429492259>

Verified source:
<https://www.routledge.com/Flexible-Imputation-of-Missing-Data-Second-Edition/vanBuuren/p/book/9780429492259>

Used for: MICE-style imputation rationale.

### `IHSN_DDI`

International Household Survey Network. _Metadata Standards and Models: Data
Documentation Initiative (DDI)_.

Verified source: <https://www.ihsn.org/documentation-standards>

Status: `NEEDS_VERIFICATION` for the exact IHSN toolkit/checklist title, version,
and publication year that should be cited for production documentation.

Used for: variable labels, value labels, missing codes, identifiers, structural
missingness, skip patterns, and survey design metadata.

## Software Documentation References

These software references are general background references for generated
syntax. They are not currently citation keys in the rule library.

- IBM SPSS Statistics command syntax documentation:
  <https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=reference-introduction-guide-command-syntax>
  and
  <https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=files-syntax-rules-guidelines>.
  The renderer targets SPSS v18-style syntax, so exact SPSS v18 command-reference
  details remain `NEEDS_VERIFICATION`.
- Stata Multiple-Imputation Reference Manual:
  <https://www.stata.com/manuals/mi.pdf>. Stata v14-specific references remain
  `NEEDS_VERIFICATION` where commands differ by release.
- R base documentation: <https://search.r-project.org/R/refmans/base/html/base-package.html>.
- pandas missing-data documentation:
  <https://pandas.pydata.org/docs/user_guide/missing_data.html>.
- scikit-learn `IterativeImputer` documentation:
  <https://scikit-learn.org/stable/modules/generated/sklearn.impute.IterativeImputer.html>.
- NumPy documentation: <https://numpy.org/doc/stable/>.

## Maintenance Notes

When adding a rule:

1. Add citation keys to `src/rules/config/default-citations.json`.
2. Reuse an existing key when the same source supports the new rule.
3. Add the key to the rule configuration.
4. Update this document with verification status.
5. Add tests that confirm generated plans include the expected citation keys.
