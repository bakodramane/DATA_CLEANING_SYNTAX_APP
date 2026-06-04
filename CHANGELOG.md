# Changelog

All notable changes to this project will be documented in this file.

This project uses conventional commits and versioned release tags.

## v0.8.1 - 2026-06-04

### Changed

- Improved the Syntax step empty state.
- Clarified the distinction between a missing Cleaning Plan and a validation
  failure.
- Expanded Playwright coverage for English/French workflow guidance.
- Expanded Playwright coverage for empty states.
- Expanded Playwright coverage for export descriptions and French export
  completion.
- Updated documentation for reviewer-friendly guidance, empty states, warning
  grouping, and export purposes.

### Notes

- No backend, telemetry, cloud storage, authentication, script execution,
  AI-assisted interpretation, or major workflow redesign was added.

## v0.8.0 - 2026-06-04

### Added

- Generated script comments now follow the selected UI language.
- English/French comment localisation for SPSS, Stata, R, and Python
  renderers.
- Syntax previews and downloads use the selected language.
- Added and updated tests for language-aware renderer comments.

### Notes

- Executable syntax remains unchanged.
- Variable names, package names, commands, and citation keys remain unchanged.
- User-entered labels and value labels are not machine-translated.
- French comments are UTF-8 compatible.
- No backend, telemetry, cloud storage, authentication, script execution,
  external translation API, or AI-assisted translation was added.

## v0.7.0 - 2026-06-03

### Added

- English/French reviewer-facing rule text.
- Translated rule labels, descriptions, rationales, and warnings.
- French blocked-rule explanations.
- French Cleaning Plan preview rationales.
- English/French summary report reviewer text.

### Notes

- Generated executable syntax remains unchanged.
- Generated syntax comments remain English for now.
- No backend, telemetry, cloud storage, authentication, script execution,
  external translation API, or AI-assisted translation was added.

## v0.6.0 - 2026-06-03

### Added

- English/French UI foundation.
- Lightweight local dictionary-based i18n.
- Language selector in the application header.
- English default language with a French option.
- Local persistence of the selected language.
- English fallback for missing translation keys.
- French translations for the core workflow UI.
- French importer and privacy warnings where feasible.
- French workflow end-to-end coverage.

### Notes

- Generated syntax comments remain English for now.
- No backend, telemetry, cloud storage, authentication, script execution,
  external translation API, or AI-assisted translation was added.

## v0.5.0 - 2026-06-03

### Added

- Realistic synthetic official-statistics demo dictionaries.
- Household/labour, agricultural holding, livestock/crop, and
  income/expenditure examples.
- Reviewer Cleaning Plans for methodology validation.
- Richer default demo dictionary.
- Documented SPSS, Stata, R, and Python syntax examples.
- Expanded methodology guidance.
- Official-statistics reviewer checklist.
- Regression tests confirming example dictionaries generate valid Cleaning Plans
  and render in all four languages.

### Notes

- No backend, telemetry, cloud storage, authentication, script execution, or
  AI-assisted interpretation was added.

## v0.4.2 - 2026-06-03

### Added

- Renderer capability metadata for SPSS v18, Stata v14, R, and Python.
- Full-file golden tests for household, agriculture, and structural-missing
  Cleaning Plans.
- Twelve golden files covering SPSS, Stata, R, and Python renderer outputs.
- Renderer support matrix documentation.
- Support-matrix consistency tests.

### Changed

- Improved SPSS, Stata, R, and Python renderer warnings.
- Added clearer partial-support comments in generated scripts.
- Improved structural-missingness and imputation-limit documentation in
  renderer output.

### Notes

- No backend, telemetry, cloud storage, authentication, script execution, or
  AI-assisted interpretation was added.

## v0.4.1 - 2026-06-02

### Added

- Importer support matrix documentation.
- Exact supported fields and known limitations by format.
- DDI edge-case fixture covering partial Codebook metadata.
- Regression tests for CSV, Excel, DDI, SAV, and DTA import paths.

### Changed

- Improved fallback warnings for `.sav` and `.dta` imports.
- Improved CSV and Excel importer warnings for malformed or partial inputs.
- Added DDI source metadata consistency for importer results.

### Notes

- No new backend, telemetry, cloud storage, authentication, script execution, or
  observation-level profiling was added.

## v0.4.0 - 2026-06-02

### Added

- Stata `.dta` metadata-import path.
- SPSS `.sav` metadata-import path.
- Conservative metadata-only parsing for supported package-file structures.
- Local browser-only processing for SPSS and Stata package-file imports.
- No observation-level data imported into app state.
- Visible confidentiality warnings for SPSS and Stata files.
- Fallback guidance for unsupported or malformed `.sav` and `.dta` files.
- New documentation for importing SPSS and Stata metadata.
- Unit tests and Playwright coverage for package-file import paths and safe
  fallback handling.
- Continued support for CSV, Excel, manual entry, and DDI XML workflows.
- Continued offline-first PWA behavior.

### Notes

- No backend, telemetry, cloud storage, authentication, or script execution was
  added.

## v0.3.0 - 2026-06-02

### Added

- DDI XML Codebook-style metadata import.
- Extraction of study title, variables, labels, text/question/universe notes,
  categories, value labels, valid ranges, variable groups, and source metadata.
- Explicit missing-code handling from DDI missing markers.
- Conservative inferred missing-code detection with warnings for review.
- Invalid XML and non-DDI warning/error handling.
- UI support for `.xml` upload.
- DDI-imported variables integrated into Variable Review, rule recommendations,
  Cleaning Plan generation, syntax previews, and exports.
- DDI importer unit tests and a Playwright DDI upload workflow test.
- Continued offline-first behavior.

### Notes

- No backend, telemetry, cloud storage, authentication, or script execution was
  added.

## v0.2.0 - 2026-06-02

### Added

- Full manual variable-entry UI for building a dictionary without uploading a
  file.
- Manual add, edit, and remove workflow for manually entered variables.
- Validation feedback for manual entries, including required names, duplicate
  names, required types, malformed label text, and invalid ranges.
- Manual-variable integration with rule recommendations, Cleaning Plan
  generation, syntax preview, and exports.
- Playwright browser-level workflow tests.
- Browser test coverage for the demo workflow, manual-entry workflow, validation
  workflow, CSV paste, and Excel upload.

### Notes

- No backend, telemetry, cloud storage, authentication, or script execution was
  added.

## v0.1.1 - 2026-06-02

### Changed

- Improved rule-library reference details and verification notes.
- Clarified methodology cautions for imputation and renderer limitations.
- Improved GitHub Pages deployment documentation and manual workflow readiness.
- Added post-release QA and roadmap notes.

### Notes

- No functional app changes.

## v0.1.0 - 2026-06-02

### Added

- Offline-first Progressive Web App support with manifest metadata, generated
  service worker, app-shell caching, and installability assets.
- Local metadata workflow for demo dictionaries, pasted CSV dictionaries,
  uploaded CSV dictionaries, and uploaded Excel `.xlsx` dictionaries.
- Variable review and correction for detected variable types and roles.
- Metadata-driven rule review with recommended and blocked rules.
- Language-neutral Cleaning Plan generation with assumptions, warnings,
  citations, and renderer capability information.
- Syntax preview and local export for SPSS v18, Stata v14, R, and Python.
- Cleaning Plan JSON and plain-language summary report downloads.
- Release documentation covering user workflow, architecture, methodology,
  references, offline mode, contribution, GitHub Pages setup, and release
  checks.

### Limitations

- Generated syntax must be reviewed before production use.
- The app generates syntax only; it does not execute scripts or clean datasets.
- DDI XML, SPSS `.sav`, and Stata `.dta` metadata import are not implemented.
- AI-assisted interpretation, online rule-pack fetching, backend services,
  authentication, telemetry, analytics, and cloud storage are not implemented.
- Some advanced and specialist rule types have partial or unsupported renderer
  coverage.
- Several bibliographic entries remain marked `NEEDS_VERIFICATION`.

## Draft Release Notes For v0.1.0

The first public release of the Survey Data Cleaning Syntax Generator provides
an offline-first, local-only workflow for generating reviewable data-cleaning
syntax from survey metadata.

Highlights:

- installable Progressive Web App that can reopen offline after the first load;
- CSV, Excel `.xlsx`, pasted CSV, and demo dictionary metadata inputs;
- transparent rule engine for variable labels, value labels, missing codes,
  range checks, domain checks, missingness diagnosis, outlier flags, identifier
  checks, and survey-design warnings;
- language-neutral Cleaning Plan JSON for audit and review;
- SPSS v18, Stata v14, R, and Python syntax previews;
- local downloads for scripts, Cleaning Plan JSON, and summary reports;
- no backend, telemetry, analytics, cloud storage, or user-data upload.

Known limitations:

- generated syntax is a reviewable draft, not an executed cleaning process;
- DDI XML, SPSS `.sav`, and Stata `.dta` metadata import are not included;
- AI-assisted interpretation and online rule-pack updates are not included;
- several references still need full bibliographic verification.
