# Changelog

All notable changes to this project will be documented in this file.

This project uses conventional commits and versioned release tags.

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
