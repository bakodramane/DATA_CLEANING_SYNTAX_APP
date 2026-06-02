# Survey Data Cleaning Syntax Generator

An open-source, offline-first web app for turning survey metadata into
reviewable data-cleaning syntax.

The app is for official statisticians, survey operations teams, data managers,
and analysts who need a transparent first draft of cleaning and imputation
syntax from a data dictionary. It does not clean data directly and it does not
execute generated scripts. Instead, it builds a language-neutral Cleaning Plan
from imported metadata, then renders syntax that a human analyst can review,
adapt, and run in their own statistical environment.

## What It Generates

- SPSS v18 syntax
- Stata v14 do-files
- R scripts
- Python scripts
- Cleaning Plan JSON
- Plain-language summary reports

## Metadata Inputs

- CSV dictionary files
- Excel `.xlsx` dictionary files
- Pasted CSV dictionary text
- Built-in demo household survey dictionary

The first release focuses on metadata-driven checks, rule review, syntax
preview, and local export. It is not a DDI XML, SPSS `.sav`, or Stata `.dta`
metadata importer yet.

## Screenshots

![Workflow start](docs/screenshots/workflow-start.png)

![Variable review](docs/screenshots/variable-review.png)

![Syntax preview](docs/screenshots/syntax-preview.png)

![Export step](docs/screenshots/export-step.png)

## Offline And Privacy Principles

The app is a static Progressive Web App. After one successful online load, the
browser can cache the app shell and reopen it offline. The demo dictionary,
pasted metadata, local CSV/XLSX uploads, rule review, Cleaning Plan generation,
syntax previews, and downloads all run locally in the browser.

Uploaded dictionaries, generated Cleaning Plans, scripts, and reports are not
uploaded to a server. The project has no backend service, authentication,
telemetry, analytics, cloud storage, or remote logging.

## Quick Start

Install dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm run dev
```

Run tests:

```powershell
npm test
```

Build the production app:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

Recommended release checks:

```powershell
npm run lint
npm run format
npm test
npm run build
npm audit --omit=dev
```

## GitHub Pages

The Vite configuration uses a relative default base path (`./`), which is safe
for static hosting and GitHub Pages subpath deployments. If a deployment needs
an explicit repository base path, set `VITE_BASE_PATH` before building:

```powershell
$env:VITE_BASE_PATH='/DATA_CLEANING_SYNTAX_APP/'
npm run build
```

See [GitHub Pages Deployment](docs/github-pages.md) for setup notes and the
optional manual deployment workflow.

## Current Limitations

- Generated syntax must be reviewed before production use.
- The app generates syntax; it does not execute scripts or clean datasets.
- DDI XML import is not implemented.
- SPSS `.sav` metadata import is not implemented.
- Stata `.dta` metadata import is not implemented.
- Full manual-entry UI is not implemented.
- AI-assisted interpretation, online rule-pack fetching, backend services,
  authentication, telemetry, analytics, and cloud storage are not implemented.
- Some renderer support is partial for advanced imputation and specialist rule
  types.
- Browser install prompts and offline indicators vary by browser and platform.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), then
see:

- [User Guide](docs/user-guide.md)
- [Architecture](docs/architecture.md)
- [Methodology](docs/methodology.md)
- [References](docs/references.md)
- [Offline Mode](docs/offline-mode.md)
- [Adding a Rule](docs/adding-a-rule.md)
- [Adding a Renderer](docs/adding-a-renderer.md)
- [Release Checklist](docs/release-checklist.md)
- [Post-Release QA](docs/post-release-qa-v0.1.0.md)
- [Roadmap](docs/roadmap.md)
