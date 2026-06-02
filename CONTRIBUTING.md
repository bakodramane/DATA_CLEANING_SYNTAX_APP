# Contributing

Thank you for helping build the Survey Data Cleaning Syntax Generator.

The project is developed incrementally. Contributions should keep the core
workflow deterministic, offline-first, local-only, and inspectable by
statisticians.

## Install And Run

```powershell
npm install
npm run dev
```

Preview a production build:

```powershell
npm run build
npm run preview
```

## Tests And Checks

Run the standard checks before opening a pull request:

```powershell
npm run lint
npm run format
npm test
npm run build
npm audit --omit=dev
```

## Folder Structure

- `src/core`: shared models, capabilities, and Cleaning Plan validation.
- `src/importers`: CSV, Excel, manual-entry helpers, type detection, and column
  mapping.
- `src/rules`: rule engine, default rule configuration, and citation loading.
- `src/renderers`: SPSS, Stata, R, and Python syntax renderers.
- `src/app`: React workflow UI, state helpers, PWA helpers, and download UI.
- `tests`: importer, rule, renderer, core, app, and smoke tests.
- `docs`: release, architecture, methodology, user, and contributor guidance.

## Adding A New Cleaning Rule

Rules should be transparent configuration plus tested support code. Start with
[docs/adding-a-rule.md](docs/adding-a-rule.md). Keep rules out of UI
components.

## Adding A New Citation

Add the citation to `src/rules/config/default-citations.json`, use a stable key,
and update [docs/references.md](docs/references.md). Mark uncertain details as
`NEEDS_VERIFICATION`.

## Adding A Renderer Step

Renderer steps should preserve Cleaning Plan order, include comments and
rationales, and warn when support is partial. Start with
[docs/adding-a-renderer.md](docs/adding-a-renderer.md).

## Adding A Future Target Language

A future target language should include:

- a new target language identifier in core types;
- renderer implementation and tests;
- capability matrix support;
- UI labels and preview/download support;
- golden fragments or targeted assertions for generated syntax;
- documentation of partial or unsupported Cleaning Plan steps.

## Adding Importer Support

Importer contributions should preserve source metadata, avoid server uploads,
and convert input into the core variable model. Add tests for supported column
names, type detection, value labels, missing codes, valid ranges, and invalid
input handling.

## Writing Tests

Prefer focused tests close to the behavior being changed. Existing examples are
in:

- `tests/importers`
- `tests/rules`
- `tests/renderers`
- `tests/core`
- `tests/app`

Do not add heavy browser-level tests unless they are simple to maintain and
provide clear release value.

## Coding Style

- Use TypeScript.
- Keep shared behavior outside React components when possible.
- Preserve deterministic output.
- Avoid network dependencies for the core workflow.
- Keep comments useful and concise.
- Run Prettier and ESLint through the existing npm scripts.

## Conventional Commits

Use conventional commit messages, for example:

- `feat(rules): add domain check for labelled values`
- `fix(importers): preserve unknown dictionary columns`
- `docs: update user guide`
- `test(renderers): cover Stata missingness output`
