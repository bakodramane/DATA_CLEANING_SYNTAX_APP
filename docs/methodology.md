# Methodology

This document explains the statistical editing principles behind the generated
Cleaning Plan steps. It is written for official statisticians, survey staff, and
data managers who may not have advanced statistical training.

The app generates reviewable syntax from metadata. It does not inspect the
dataset itself, run models, or make final editing decisions.

## Data Editing As Review, Selection, And Treatment

Statistical data editing usually involves:

1. **Review**: identify possible problems, such as values outside a valid range.
2. **Selection**: decide which flagged cases need attention.
3. **Treatment**: document the approved action, such as correction, recoding,
   imputation, or no change.

The app defaults to review and documentation. It prefers flags, warnings, and
plain-language rationales over silent deletion or automatic overwriting.

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
