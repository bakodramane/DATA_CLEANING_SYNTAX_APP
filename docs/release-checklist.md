# Release Checklist

Use this checklist before tagging a public release.

Status below is for the current v0.4.2 deployment checkpoint.

## Quality Checks

- [x] `npm run lint` passes.
- [x] `npm run format` passes.
- [x] `npm test` passes.
- [x] `npm run test:e2e` passes.
- [x] `npm run build` passes.
- [x] `npm audit --omit=dev` passes.
- [x] Production build emits PWA assets, including `manifest.webmanifest` and
      `sw.js`.

## Production Smoke Check

- [x] Production preview opens.
- [x] Demo dictionary loads.
- [x] CSV paste works.
- [x] Excel upload works.
- [x] Manual variables can be added, edited, removed, and validated.
- [x] DDI XML upload works.
- [x] Stata `.dta` upload works or returns a safe fallback warning.
- [x] SPSS `.sav` upload works or returns a safe fallback warning.
- [x] SPSS/Stata privacy warning is visible before package-file import.
- [x] DDI-imported variables appear in Variable review.
- [x] Package-imported variables appear in Variable review when direct metadata
      extraction succeeds.
- [x] Detected types and roles can be corrected.
- [x] Rules generate from DDI-imported variables.
- [x] Variable review works.
- [x] Rule review works.
- [x] Cleaning Plan preview works.
- [x] SPSS v18 syntax preview renders.
- [x] Stata v14 syntax preview renders.
- [x] R syntax preview renders.
- [x] Python syntax preview renders.
- [x] Cleaning Plan JSON downloads.
- [x] SPSS syntax downloads.
- [x] Stata `.do` downloads.
- [x] R script downloads.
- [x] Python script downloads.
- [x] Summary report downloads.
- [x] Offline reload opens the app shell after first load.

## Public Demo Smoke Check

- [x] GitHub Pages source is configured for GitHub Actions.
- [x] Manual **Deploy GitHub Pages** workflow completes successfully.
- [x] Public demo opens at
      `https://bakodramane.github.io/DATA_CLEANING_SYNTAX_APP/`.
- [x] Public `manifest.webmanifest` is available.
- [x] Public `sw.js` is available.
- [x] Service worker registers from the deployed site.
- [x] Public demo workflow works.
- [x] Public CSV paste, Excel upload, manual entry, DDI XML upload, `.sav`, and
      `.dta` paths behave correctly with synthetic fixtures.
- [x] Public offline reload works after first load.

## Documentation

- [x] README updated.
- [x] User guide updated.
- [x] Importer support matrix updated.
- [x] Renderer support matrix updated.
- [x] Architecture documentation updated.
- [x] Methodology documentation updated.
- [x] References checked.
- [x] Offline/PWA documentation updated.
- [x] Contributor guide updated.
- [x] Rule and renderer contribution docs updated.
- [x] GitHub Pages setup documented.
- [x] GitHub Pages deployment validation documented.
- [x] Screenshots added or placeholders documented.

## Release Metadata

- [x] Version updated.
- [x] Changelog updated.
- [x] Release notes drafted.
- [x] Working tree clean at tagging time.
- [x] Release tag created.
- [x] Release tag pushed.

## Notes For DDI XML Releases

DDI XML support is an MVP DDI Codebook importer. Before release, verify that
users are told to review detected types, roles, value labels, missing codes, and
valid ranges, and that unsupported DDI structures produce warnings or preserved
source notes rather than silent data loss.

## Notes For SPSS And Stata Package Imports

SPSS `.sav` and Stata `.dta` files may contain full confidential microdata.
Before release, verify that the UI warning is visible, package importers run
locally in the browser, observation-level records are not imported into app
state, unsupported or malformed files return the CSV/Excel dictionary fallback
message, and documentation recommends exported metadata dictionaries when
confidentiality rules prohibit opening full data files.

## Notes For Renderer Releases

Renderer syntax is a reviewable draft and must not be treated as executed or
validated output. Before release, verify that partial and unsupported behavior is
visible in both returned renderer warnings and generated script comments, that
full-file golden tests cover representative Cleaning Plans for SPSS v18, Stata
v14, R, and Python, and that generated scripts do not silently delete records,
treat outliers, impute identifiers, or impute structural missing values.
