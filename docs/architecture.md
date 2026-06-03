# Architecture

The Survey Data Cleaning Syntax Generator is a local-first static Progressive
Web App built with React, Vite, and TypeScript.

The application flow is:

```text
metadata importers
        |
variable model
        |
rule engine
        |
Cleaning Plan
        |
renderers
        |
SPSS / Stata / R / Python scripts
        |
export
```

The Cleaning Plan is the central abstraction. It records imported variables,
selected steps, assumptions, warnings, citations, and renderer support before
language-specific syntax is produced.

## Main Modules

### `src/core`

Core models and validation logic. This area defines variables, cleaning plans,
cleaning steps, target languages, citations, capabilities, and validation
contracts. It must not depend on React, browser APIs, network services, hosted
storage, or telemetry.

### `src/importers`

Dictionary importers, manual-entry conversion, value parsing, XML parsing,
package-file metadata parsing, and type-detection helpers. The current release
supports pasted CSV, uploaded CSV, uploaded Excel `.xlsx`, uploaded DDI XML
Codebook metadata, conservative Stata `.dta` metadata paths, SPSS `.sav`
dictionary metadata paths, manual variable entry, and a built-in demo
dictionary. Importer output is normalised into the core variable model while
preserving source metadata where possible.

The DDI importer is an MVP Codebook parser. It extracts common `<codeBook>`,
`<stdyDscr>`, `<dataDscr>`, `<var>`, `<labl>`, `<txt>`, `<catgry>`,
`<catValu>`, `<valrng>`, `<range>`, `<varFormat>`, `<universe>`, `<qstnLit>`,
and `<varGrp>` structures without network access or external services. It keeps
unsupported or ambiguous details in warnings and source notes so users can
review partial metadata instead of losing it silently.

The statistical package importers are metadata-only and browser-safe by design.
They do not add a parser dependency, do not call a backend, and do not import
observation-level records into app state. The Stata importer reads tagged
v117-v119-style metadata sections where feasible and warns for unsupported
value-label table or extended-missing semantics. The SPSS importer reads classic
SAV dictionary records before the data terminator, including simple value labels
and user-missing values where available. Unsupported or malformed files return a
clear CSV/Excel dictionary fallback warning.

The exact field coverage and known limitations are documented in the
[Importer Support Matrix](importer-support-matrix.md).

### `src/rules`

The rule engine and editable rule/citation configuration. Rules are metadata
driven: they inspect variable type, role, labels, missing codes, valid ranges,
and project context to recommend, block, or mark planned cleaning steps.

### `src/renderers`

Language-specific renderers that convert a valid Cleaning Plan into SPSS v18,
Stata v14, R, or Python syntax. Renderers preserve step order, add comments and
rationales, include citation keys, and surface partial or unsupported behavior.
They generate scripts for human review only; the app does not execute the
generated SPSS, Stata, R, or Python code. Full-file golden tests cover
representative household, agricultural, and structural-missing plans so syntax
changes are intentional and reviewable.

The exact renderer coverage by Cleaning Plan step type is documented in the
[Renderer Support Matrix](renderer-support-matrix.md).

### `src/app`

React UI, workflow state helpers, manual-entry validation helpers, PWA status
helpers, and download components. The UI orchestrates the workflow but keeps
cleaning rules, importers, renderers, and validation outside presentation
components.

### `src/i18n`

Lightweight dictionary-based internationalisation for the user interface. The
default language is English, French is available from the header selector, and
the selected language is persisted in browser local storage. Translation lookup
falls back to English when a selected-language key is missing and never calls a
network service or external translation API.

This layer translates core visible UI labels, help text, common warnings,
buttons, workflow step labels, and selected rule-review/Plan-preview text. It
does not translate generated SPSS, Stata, R, or Python syntax comments in this
phase; renderer output remains deterministic and language-neutral from the
Cleaning Plan.

### PWA And Offline Support

`vite-plugin-pwa` generates installability metadata, `manifest.webmanifest`,
`sw.js`, and Workbox assets during production builds. The service worker
precaches the built app shell and static assets. User-uploaded dictionaries and
generated downloads are handled in browser memory and are not cached as remote
server responses.

## Design Principles

### Offline-First

The core workflow works without a backend. After one successful online load, the
browser can serve the cached app shell during offline reloads.

### Deterministic

Given the same imported metadata, selected rules, and project settings, the app
should produce the same Cleaning Plan structure and renderer output except for
explicit timestamps in generated metadata.

### Local-Only

No user dictionary, Cleaning Plan, generated script, or summary report is
uploaded by the app. The current release has no cloud storage, telemetry,
analytics, authentication, remote logging, or backend service.

Package-file import follows the same local-only rule. SPSS `.sav` and Stata
`.dta` uploads may contain confidential microdata, so importers must avoid
observation-level profiling, persistence of source data, network transfer, and
telemetry. Exported metadata dictionaries remain the recommended path when
organisational rules prohibit opening full data files.

### Metadata-Driven

The app recommends checks from dictionary metadata rather than inspecting or
modifying a dataset. Generated scripts are therefore reviewable drafts, not
automatic data-cleaning decisions.

### Open Source And Modifiable

Rules, citations, renderers, and importers are separated so contributors can add
new cleaning logic, target languages, or metadata formats without changing the
entire application.

## Static Hosting And GitHub Pages

The production build is emitted to `dist/` by Vite. The default Vite base is
relative (`./`), which is safe for static hosting and GitHub Pages subpath
deployments.

If a deployment workflow needs an explicit repository base path, set
`VITE_BASE_PATH` during build:

```powershell
$env:VITE_BASE_PATH='/DATA_CLEANING_SYNTAX_APP/'
npm run build
```

See [GitHub Pages Deployment](github-pages.md) for manual setup steps.

## Non-Goals In The First Release

The current release does not include full DDI lifecycle support,
observation-level data profiling, AI-assisted interpretation, script execution,
backend services, authentication, telemetry, analytics, cloud storage, external
translation services, or AI-assisted translation.
