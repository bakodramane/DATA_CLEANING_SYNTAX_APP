# Post-Release QA For v0.1.0

Date checked: 2026-06-02

## Release Version

- Release tag checked: `v0.1.0`
- Package version checked: `0.1.0`
- Current branch after release: `main`

## Checks Run

- `npm run lint`
- `npm run format`
- `npm test`
- `npm run build`
- `npm audit --omit=dev`
- Production preview smoke check
- Offline reload smoke check after first successful load

## Reference Verification Status

The rule-library citation keys were checked against the rule configuration and
documentation. Every citation key used by a rule is listed in
`src/rules/config/default-citations.json` and `docs/references.md`.

Most bibliographic entries now include verified titles, authors or
organisations, years, source URLs, and DOIs where available. Remaining
`NEEDS_VERIFICATION` items:

- `IHSN_DDI`: exact IHSN toolkit/checklist title, version, and publication year.
- SPSS v18 command-reference details for version-specific syntax.
- Stata v14 manual references where commands differ by release.
- Primary landing-page verification for `HUBERT_VANDERVIEREN_2008`.

## GitHub Pages Readiness

The Pages workflow is manual-only and uses the `dist/` production output. Vite
uses a relative default base path with an overridable `VITE_BASE_PATH` for
repository subpath deployments. The workflow requires no secrets and does not
deploy automatically on push.

The manual Pages workflow was not run during this QA pass.

## Remaining Known Limitations

- Generated syntax must be reviewed before production use.
- The app generates scripts but does not execute them or clean datasets.
- DDI XML, SPSS `.sav`, and Stata `.dta` metadata imports are not implemented.
- Full manual variable-entry UI is not implemented.
- AI-assisted interpretation and online template-pack fetching are not
  implemented.
- Backend services, authentication, telemetry, analytics, and cloud storage are
  not implemented.
- Some advanced imputation and specialist outlier methods remain partial or
  unsupported in renderers.

## Recommended Next Priorities

1. Verify the remaining IHSN/DDI and version-specific software references.
2. Add lightweight browser-level smoke tests for the public workflow.
3. Add fuller renderer golden-output coverage.
4. Improve version-specific SPSS, Stata, and Python imputation examples and
   warnings.
5. Add realistic example dictionaries from official survey contexts.
