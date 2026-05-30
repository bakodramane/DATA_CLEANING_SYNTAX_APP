# DATA_CLEANING_SYNTAX_APP

Open-source, offline-first application for generating transparent survey
microdata cleaning and imputation syntax from metadata.

The application will transform survey metadata into a language-neutral Cleaning
Plan, then render ready-to-review scripts for:

- SPSS v18 syntax
- Stata v14 do-files
- R scripts
- Python scripts

The current app includes the local metadata-to-syntax workflow, editable rule
configuration, renderer previews, downloads, and Progressive Web App support.
After a first successful load, the static app shell can reopen offline.

## Development

```powershell
npm install
npm run dev
```

## Quality Checks

```powershell
npm run lint
npm test
npm run build
```

## Install And Offline Use

Builds include a web app manifest and service worker. In a supported browser,
open the app once, then use the browser install action to add it to the desktop
or home screen. After the first load, the app shell and static assets are cached
for offline reloads.

The demo dictionary, pasted CSV dictionaries, local CSV/XLSX uploads, rule
review, Cleaning Plan generation, syntax previews, and downloads all run in the
browser. Uploaded dictionaries and generated scripts are not sent to a server.

## Project Principles

- Offline-first core workflow
- No telemetry, analytics, cloud storage, or backend requirement
- Human-editable rules and renderer templates
- Transparent, version-aware generated syntax
- Plain-language assumptions, warnings, and rationales

## Documentation

- [Architecture](docs/architecture.md)
- [Offline Mode](docs/offline-mode.md)
- [Methodology](docs/methodology.md)
- [References](docs/references.md)
- [Adding a Rule](docs/adding-a-rule.md)
- [Adding a Renderer](docs/adding-a-renderer.md)
- [User Guide](docs/user-guide.md)
