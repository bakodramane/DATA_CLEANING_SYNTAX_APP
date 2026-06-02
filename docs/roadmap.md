# Roadmap

This roadmap is a lightweight backlog for work after `v0.3.0`. It is not a
commitment to implement every item in order.

## Methodology And Statistical Validation

- Verify remaining bibliographic references.
- Add external statistical review of default rules.
- Clarify when imputation rules should be recommended, optional, discouraged, or
  blocked.
- Add examples showing how generated flags support review and amendment without
  overwriting source data.

## Importers

- Harden DDI XML import against more real-world Codebook fixtures.
- Explore broader DDI version and lifecycle support after the MVP Codebook
  importer is stable.
- Harden Stata `.dta` metadata import beyond the Phase 12 tagged-DTA MVP.
- Harden SPSS `.sav` metadata import beyond classic dictionary-record support.
- Improve exported metadata dictionary guidance for SPSS and Stata workflows.
- Add realistic public survey dictionary examples.
- Improve validation for dictionary column mappings.

## Renderer Depth

- Improve SPSS, Stata, and Python imputation warnings and examples.
- Add fuller golden-file tests for each renderer.
- Expand support for structural missingness and skip-pattern comments.
- Add clearer capability matrix reporting for unsupported steps.

## UI Improvements

- Refine manual variable-entry ergonomics and saved-session support.
- Improve import mapping review before accepting metadata.
- Add clearer warnings for partial renderer support.
- Explore multilingual UI support after the core workflow stabilises.
- Improve import warnings for partial package-file metadata extraction.

## Deployment And Packaging

- Run and verify the manual GitHub Pages workflow.
- Add release-asset guidance for screenshots and generated examples.
- Review PWA update behavior across major browsers.

## Optional AI-Assisted Interpretation

- Keep AI interpretation out of the core local workflow until privacy, review,
  and governance requirements are defined.
- If introduced later, ensure it is optional, clearly labelled, and does not
  upload user metadata without explicit consent.

## Testing And Quality Assurance

- Expand browser-level UI smoke tests.
- Add full-file renderer golden tests.
- Add accessibility checks for the wizard workflow.
- Add deployment smoke checks for GitHub Pages once enabled.
