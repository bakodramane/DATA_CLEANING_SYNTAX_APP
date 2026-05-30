# Architecture

The application is a local-first static Progressive Web App built with React,
Vite, and TypeScript.

The intended flow is:

```text
metadata importers
        |
variable model
        |
Cleaning Plan builder
        |
rule library
        |
language-specific renderers
        |
SPSS / Stata / R / Python scripts
```

The Cleaning Plan is the central abstraction. The core package must not depend
on the UI, network services, telemetry, or hosted storage.

## Phase 0 Scope

Phase 0 creates only the repository foundation:

- React and TypeScript app shell
- pure TypeScript core folder
- renderer, rule, model, and validation folders
- Vitest setup
- CI workflow
- documentation skeleton

No cleaning logic is implemented in Phase 0.
