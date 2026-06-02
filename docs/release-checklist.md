# Release Checklist

Use this checklist before tagging a public release.

Status below is for the current Phase 11 checkpoint.

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
- [x] DDI-imported variables appear in Variable review.
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

## Documentation

- [x] README updated.
- [x] User guide updated.
- [x] Architecture documentation updated.
- [x] Methodology documentation updated.
- [x] References checked.
- [x] Offline/PWA documentation updated.
- [x] Contributor guide updated.
- [x] Rule and renderer contribution docs updated.
- [x] GitHub Pages setup documented.
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
