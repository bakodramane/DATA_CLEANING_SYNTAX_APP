# Methodology

This document explains the statistical editing principles behind the generated
Cleaning Plan steps. It is written for official statisticians, survey staff, and
data managers who may not have advanced statistical training.

The app generates reviewable syntax from metadata. It does not inspect the
dataset itself, run models, or make final editing decisions.

## What The App Does Well

- Converts survey metadata into a transparent, language-neutral Cleaning Plan.
- Preserves variable labels, value labels, missing codes, ranges, roles, and
  source notes where the importer can detect them.
- Generates reviewable first-draft syntax for SPSS v18, Stata v14, R, and
  Python.
- Flags range, domain, duplicate-identifier, routing, missingness, and outlier
  review items without silently changing records.
- Protects identifiers, survey design variables, and structural missingness
  from imputation-style treatment.
- Documents assumptions, citations, renderer limitations, and unsupported steps
  directly in the Cleaning Plan and generated syntax.

## What The App Does Not Automate

- It does not read or profile observation-level microdata for cleaning
  decisions.
- It does not execute SPSS, Stata, R, or Python code.
- It does not decide whether a flagged value is an error, a valid rare case, or
  a value needing treatment.
- It does not delete records, cap values, winsorise values, or overwrite source
  variables automatically.
- It does not choose final imputation models, donor pools, variance methods, or
  official production parameters.
- It does not replace survey-processing governance, disclosure review,
  reproducibility checks, or subject-matter sign-off.

## Data Editing As Review, Selection, And Treatment

Statistical data editing usually involves:

1. **Review**: identify possible problems, such as values outside a valid range.
2. **Selection**: decide which flagged cases need attention.
3. **Treatment**: document the approved action, such as correction, recoding,
   imputation, or no change.

The app defaults to review and documentation. It prefers flags, warnings, and
plain-language rationales over silent deletion or automatic overwriting.

## Guided Methodology Presets

Methodology presets help non-expert users choose a conservative starting point
for rule selection. A preset controls which rule families are selected by
default; it does not approve the rules, execute scripts, or prevent manual
review. Users can still select or deselect individual rules before generating a
Cleaning Plan.

- **Documentation/reporting only** focuses on variable labels, value labels,
  metadata traceability, audit notes, and the summary report. It leaves
  validation, outlier, and imputation rules unselected by default.
- **Basic validation only** selects labels, missing-value declarations, range
  checks, domain checks, structural-missingness protection, skip-pattern
  checks, duplicate identifier checks, and design-variable warnings. It leaves
  outlier and imputation rules unselected.
- **Validation + outlier review** adds transparent outlier flags for eligible
  numeric variables. It does not select deletion, capping, winsorisation, or
  imputation.
- **Analysis-ready with imputation suggestions** adds missingness diagnosis and
  conservative imputation suggestions where the metadata supports them. These
  suggestions remain review-required and may be partial in some renderers.

All presets preserve hard protections. Identifiers must not be imputed,
structural missing values must not be treated as item nonresponse, and survey
design variables must not be modified without specialist review.

## Structural Missingness Versus Item Nonresponse

Structural missingness occurs when a questionnaire route makes a question not
applicable. Item nonresponse occurs when a question was applicable but no valid
answer was recorded.

The app protects structural missingness because valid skip patterns should not
be treated as ordinary nonresponse. Imputing a structurally missing value can
create impossible or misleading records.

## Range Checks

Range checks flag numeric, date, time, weight, or count values that fall outside
metadata-defined minimum and maximum bounds. A value outside a range is not
automatically wrong; it is a review item that needs a subject-matter decision.

## Domain Checks

Domain checks flag categorical values that are not listed in documented value
labels or declared valid codes. They help find coding mistakes, unexpected
categories, and metadata mismatches.

## Consistency Checks

Consistency checks compare related variables, such as dates that should follow a
known order. The first release documents some consistency rule types as planned
or unsupported when the required relationship is not fully defined by metadata.

## Duplicate Identifier Checks

Identifiers support record linkage, deduplication, and audit trails. Duplicate
or missing identifiers can break downstream processing. The app flags
identifier issues for review and blocks imputation-style treatment of
identifier variables.

## Outlier Flagging

Outliers are unusual values that may be errors, genuine rare cases, or values
that require special treatment. The app includes transparent first-pass outlier
flags such as Tukey fences and median absolute deviation based checks. It does
not delete, cap, winsorise, or replace outliers automatically.

## Missingness Diagnosis

Missingness diagnosis summarises missing values before treatment decisions are
made. This helps distinguish complete records, item nonresponse, declared
missing codes, and structural missingness.

## Imputation Cautions

Imputation can support analysis when item nonresponse is present, but it can
also affect estimates, variance, and relationships between variables. The app
treats imputation as review-required. Some renderers provide partial syntax for
common approaches, but generated imputation code must be checked by a qualified
analyst before production use.

Renderer support differs by target language. R and Stata examples are closer to
standard multiple-imputation workflows, but still need analyst review. SPSS
syntax may require licensed functionality. Python output uses practical
single-workflow examples, such as scikit-learn imputation templates, and must
not be treated as full Rubin-style multiple-imputation inference or pooled
analysis.

## Reviewing Generated Syntax

Generated syntax should be treated as a documented draft. Before production use,
statisticians should:

1. Compare every variable name, type, role, label, and missing code against the
   approved questionnaire and data dictionary.
2. Confirm that skip patterns and structural missing rules match the final
   questionnaire routing, including universe restrictions and derived routes.
3. Review every flag variable created by the generated syntax before deciding
   whether correction, recoding, imputation, or no action is appropriate.
4. Check that outlier syntax creates flags only and does not delete, cap, or
   replace values.
5. Confirm that identifiers, weights, strata, PSUs, and structural missing
   values are excluded from imputation or automatic treatment.
6. Run the syntax first on a controlled test copy, compare record counts and
   summary statistics before and after each section, and archive the logs.

## Validating Imputation Choices

The app can render imputation review templates, but the statistical method must
be approved outside the app. Validation should document:

- which variables are eligible for imputation and why;
- which missing-value categories are included, excluding structural missingness;
- which predictors, stratification variables, donor classes, or models are used;
- whether weights, clustering, stratification, and domain estimation affect the
  imputation approach;
- diagnostics comparing observed and imputed distributions;
- sensitivity checks against simpler alternatives, such as no imputation or
  deterministic editing where appropriate;
- whether variance estimation, replicate weights, or pooled estimates are
  handled correctly in the analyst's production environment;
- the statistician who reviewed and approved the final imputation choice.

## Documenting Edits In Official Workflows

Generated syntax should be stored with the Cleaning Plan JSON, the source
dictionary, reviewer notes, execution logs, and version identifiers. Official
survey teams should record:

- the source metadata version used to generate the plan;
- all manual changes to variable types, roles, missing codes, ranges, and skip
  patterns;
- the reason for each accepted edit or imputation decision;
- the number of records flagged by each check and the number treated;
- the retained original variable, edited variable, and flag or audit variable
  naming convention;
- the reviewer, approver, date, and production environment used;
- any unresolved warnings, unsupported renderer steps, or deviations from the
  generated draft.

## Reviewer Checklist

- Variable types checked.
- Missing codes checked.
- Structural missingness protected.
- Outliers flagged, not silently removed.
- Imputation reviewed by a statistician.
- Generated syntax reviewed before production use.

## Why Flagging Is The Default

Deleting or changing values without review can damage survey estimates and hide
audit evidence. The app therefore produces flags, comments, warnings, and
summary reports by default. Treatment steps are explicit and review-required.

## Protected Variables

Identifiers are protected because they are linkage and audit keys. Structural
missing values are protected because they can represent valid questionnaire
routing. Survey design variables, including weights, strata, and primary
sampling units, are protected because they affect design-based inference and
require specialist review before modification.

## Renderer Limitations

SPSS, Stata, R, and Python renderers include warnings when a Cleaning Plan step
is unsupported or only partially supported. Unsupported steps are documented in
comments rather than silently skipped. Generated scripts are intended as
transparent review drafts, not as certification that a method is statistically
appropriate for a particular survey.
