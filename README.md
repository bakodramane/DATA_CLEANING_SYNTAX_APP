# DATA_CLEANING_SYNTAX_APP

Open-source, offline-first application for generating transparent survey
microdata cleaning and imputation syntax from metadata.

The application will transform survey metadata into a language-neutral Cleaning
Plan, then render ready-to-review scripts for:

- SPSS v18 syntax
- Stata v14 do-files
- R scripts
- Python scripts

Phase 0 establishes the repository, local app shell, documentation skeleton,
testing setup, and CI. No cleaning logic is implemented in this phase.

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

## Project Principles

- Offline-first core workflow
- No telemetry, analytics, cloud storage, or backend requirement
- Human-editable rules and renderer templates
- Transparent, version-aware generated syntax
- Plain-language assumptions, warnings, and rationales

## Documentation

- [Architecture](docs/architecture.md)
- [Methodology](docs/methodology.md)
- [References](docs/references.md)
- [Adding a Rule](docs/adding-a-rule.md)
- [Adding a Renderer](docs/adding-a-renderer.md)
- [User Guide](docs/user-guide.md)
