# Contributing

Thank you for helping build DATA_CLEANING_SYNTAX_APP.

This project is developed incrementally. Each phase should keep the core
deterministic, offline-first, and inspectable by statisticians.

## Development Workflow

1. Create a focused branch.
2. Keep cleaning rules outside UI components.
3. Add or update tests for core behavior.
4. Run `npm run lint`, `npm test`, and `npm run build`.
5. Use conventional commits.

## Adding Rules

Rules should be editable configuration plus tested TypeScript support code. See
[docs/adding-a-rule.md](docs/adding-a-rule.md).

## Adding Renderers

Renderers should produce transparent, heavily commented syntax and explicit
warnings for unsupported features. See
[docs/adding-a-renderer.md](docs/adding-a-renderer.md).
