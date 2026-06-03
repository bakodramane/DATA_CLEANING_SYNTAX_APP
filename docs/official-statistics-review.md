# Official Statistics Review Guide

This guide is for statisticians, survey data managers, and reviewers assessing
generated Cleaning Plans and syntax before production use.

The examples are synthetic. They are designed to look like realistic survey
metadata, but they do not contain confidential records or real microdata.

## Phase 16 Example Set

The repository includes four synthetic demo dictionaries:

- Household and labour survey: person roster, labour status, hours worked, wage
  income, weights, strata, and PSUs.
- Agricultural holding survey: holdings, land area, crops, production, sales,
  weights, and strata.
- Livestock and crop module: livestock applicability, livestock counts, maize
  routing, harvest, fertilizer, and sales channel.
- Income and expenditure module: wage income, remittances, rent, food
  expenditure, health expenditure, total expenditure, missing codes, and skip
  patterns.

The examples are available as TypeScript fixtures in
`src/core/fixtures/official-statistics-examples.ts`. Regression tests confirm
that the dictionaries import, generate valid Cleaning Plans, and render in SPSS
v18, Stata v14, R, and Python.

## Review Procedure

1. Review the imported dictionary against the approved questionnaire and
   metadata source.
2. Confirm variable names, labels, types, roles, value labels, valid ranges, and
   declared missing codes.
3. Check that questionnaire routing is represented as skip-pattern or
   structural-missing guidance where applicable.
4. Generate the Cleaning Plan and review assumptions, warnings, citations, and
   renderer support notes.
5. Inspect generated syntax line by line before running it in SPSS, Stata, R,
   or Python.
6. Run syntax on a controlled copy of the dataset and compare record counts,
   missingness summaries, and key estimates before and after edits.
7. Archive the Cleaning Plan JSON, generated scripts, logs, reviewer decisions,
   and final approved syntax together.

## Imputation Validation Notes

Imputation examples are review templates. A statistician should approve:

- the variables eligible for imputation;
- the missing categories included, excluding structural missingness;
- the predictor variables, classes, or model terms;
- handling of survey weights, strata, PSUs, domains, and replicate weights;
- diagnostics comparing observed and imputed distributions;
- sensitivity checks against alternative treatments;
- the production environment and package versions used for final execution.

## Reviewer Checklist

- Variable types checked.
- Missing codes checked.
- Structural missingness protected.
- Outliers flagged, not silently removed.
- Imputation reviewed by a statistician.
- Generated syntax reviewed before production use.

## Documentation Expectations

For official survey workflows, keep an audit bundle containing:

- source dictionary and questionnaire version;
- exported Cleaning Plan JSON;
- generated syntax and final reviewed syntax;
- syntax execution logs;
- counts of records flagged, reviewed, edited, imputed, or left unchanged;
- reviewer notes and sign-off;
- unresolved warnings or unsupported renderer features.

The app does not certify that a method is statistically appropriate. It helps
make the first draft transparent enough for official review.
