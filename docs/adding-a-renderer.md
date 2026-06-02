# Adding A Renderer

Renderers convert a language-neutral Cleaning Plan into version-aware syntax.
The first release includes SPSS v18, Stata v14, R, and Python renderers.

## Renderer Location

Renderer code lives in:

```text
src/renderers
```

Renderer tests live in:

```text
tests/renderers
```

## Renderer Principles

A renderer should:

- preserve Cleaning Plan step order;
- add comments before every substantive step;
- include rationales and citation keys;
- make unsupported or partial behavior visible;
- avoid silent deletion or overwriting;
- generate reproducible, reviewable code;
- keep output deterministic for the same Cleaning Plan.

## Adding Support For A Step

1. Identify the Cleaning Plan `type` to render.
2. Add helper functions when language-specific quoting, labels, or missing-value
   syntax needs care.
3. Generate comments that explain the rule, rationale, review status, and
   citation keys.
4. Add warning comments for partial support.
5. Update renderer capability expectations if needed.
6. Add focused tests and golden fragments.

## Adding A Future Target Language

A new target language should include:

- a target language identifier in `src/core`;
- UI labels and download extension mapping in `src/app/state/appState.ts`;
- renderer implementation in `src/renderers`;
- tests for all supported step types;
- capability matrix support;
- documentation of limitations.

Do not add a target language without tests for generated syntax and clear notes
for unsupported Cleaning Plan steps.
