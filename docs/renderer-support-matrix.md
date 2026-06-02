# Renderer Support Matrix

This matrix documents what the SPSS v18, Stata v14, R, and Python renderers
emit for each current Cleaning Plan step type. The app generates reviewable
scripts only. It does not execute scripts, inspect observation-level data, or
silently modify a dataset.

Status labels:

- **Supported**: executable or directly usable syntax is generated for the
  current metadata-driven step.
- **Partial**: syntax, comments, or review templates are generated, but analyst
  review or adaptation is required.
- **Unsupported**: the renderer emits a visible warning/comment rather than
  pretending to implement the step.

## Matrix

| Step type                   | SPSS v18    | Stata v14   | R           | Python      | Notes                                                                                                                                                                         |
| --------------------------- | ----------- | ----------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import_declaration`        | Unsupported | Unsupported | Unsupported | Unsupported | Import source metadata is preserved in the Cleaning Plan and exported JSON, not as executable syntax.                                                                         |
| `variable_label`            | Supported   | Supported   | Supported   | Partial     | Python stores labels in dictionaries because pandas has no native SPSS/Stata-style label metadata.                                                                            |
| `value_label`               | Supported   | Supported   | Supported   | Partial     | Python stores value labels in dictionaries for analyst review.                                                                                                                |
| `missing_value_declaration` | Supported   | Partial     | Supported   | Supported   | SPSS declares user-missing values; Stata uses `mvdecode` for ordinary declared codes and warns for extended missing values; R/Python recode declared codes to missing values. |
| `range_check`               | Supported   | Supported   | Supported   | Supported   | Renderers create flag variables only; source values are not changed.                                                                                                          |
| `domain_check`              | Supported   | Supported   | Supported   | Supported   | Renderers create flag variables from explicit allowed values, value labels, and declared missing codes.                                                                       |
| `structural_missing_check`  | Partial     | Partial     | Partial     | Partial     | Rendered as review flags or warning comments. Structural missing values are not imputed or recoded automatically.                                                             |
| `skip_pattern_check`        | Partial     | Partial     | Partial     | Partial     | Rendered as routing-violation flags when a simple applicability condition is available.                                                                                       |
| `consistency_check`         | Partial     | Partial     | Partial     | Partial     | Rendered only when the Cleaning Plan supplies a simple condition; complex consistency edits remain reviewer work.                                                             |
| `duplicate_id_check`        | Supported   | Supported   | Supported   | Supported   | Duplicate identifiers are flagged. No records are deleted.                                                                                                                    |
| `recode`                    | Unsupported | Unsupported | Unsupported | Unsupported | General recoding is outside the current renderer path.                                                                                                                        |
| `derived_variable`          | Unsupported | Unsupported | Unsupported | Unsupported | Derived-variable creation is outside the current renderer path.                                                                                                               |
| `outlier_flag`              | Partial     | Supported   | Supported   | Supported   | Tukey and MAD flags are supported where feasible. SPSS emits review templates for thresholds. Advanced methods warn and do not generate treatment syntax.                     |
| `outlier_treatment`         | Unsupported | Unsupported | Unsupported | Unsupported | No renderer deletes, caps, or winsorises outliers automatically.                                                                                                              |
| `missingness_diagnosis`     | Supported   | Supported   | Supported   | Supported   | Renderers produce missingness summaries and optional missingness indicators.                                                                                                  |
| `imputation`                | Partial     | Supported   | Supported   | Partial     | SPSS depends on module availability. Stata and R emit reviewed MI examples. Python emits an IterativeImputer example and does not automate Rubin-style pooled inference.      |
| `audit_log`                 | Partial     | Partial     | Partial     | Partial     | Rendered as audit guidance and flag-summary comments; no separate audit table is created automatically.                                                                       |
| `summary_report`            | Partial     | Partial     | Partial     | Partial     | Rendered as simple summaries or comments; publication-ready reports remain a reviewer task.                                                                                   |

## Known Limitations

- Generated syntax must be reviewed before use in production.
- The renderers do not execute code and do not inspect or profile
  observation-level records.
- Structural missing and skip-pattern steps depend on simple conditions in the
  Cleaning Plan. Complex questionnaire logic may require manual adaptation.
- Consistency checks are rendered only when the plan provides a simple flag
  condition. The app does not choose advanced edit or statistical models.
- Outlier flags do not delete, cap, winsorise, or set values to missing.
- Imputation examples protect identifiers and block structural missing values.
  Categorical imputation requires extra review of coding, category prevalence,
  and model fit.
- Stata extended missing values require review because ordinary `mvdecode`
  examples are not a full extended-missing semantics model.
- Python label and value-label support is metadata-dictionary based; pandas does
  not preserve native SPSS/Stata labels.

## Regression Protection

Full-file golden tests cover representative household, agricultural, and
structural-missing Cleaning Plans for all four languages. These tests compare
complete generated scripts with stable expected files so changes to comments,
warnings, syntax structure, and safety guarantees are intentional.

The golden tests also check that unsupported steps are visible, partial support
produces warnings, records are not silently deleted, outliers are not silently
treated, identifiers are not imputed, and structural missing values are blocked
from imputation examples.
