# Adding A Rule

Rules are transparent, editable recommendations that turn metadata into Cleaning
Plan steps. A rule should be understandable by a statistician and testable by a
developer.

## Rule Location

Default rules live in:

```text
src/rules/config/default-rules.json
```

Citation metadata lives in:

```text
src/rules/config/default-citations.json
```

Rule engine support code lives in:

```text
src/rules
```

## Rule Fields

A rule should define:

- a stable `id`;
- a `family`;
- a variable or plan `scope`;
- a plain-language `label`;
- a concise `description`;
- applicability constraints, such as variable types, roles, required metadata,
  excluded roles, or context requirements;
- `defaultAction`;
- whether review is required;
- whether the rule is automatic or optional/planned;
- generated Cleaning Plan step type;
- parameters;
- rationale;
- citation keys;
- severity;
- recommendation status;
- renderer support for each target language.

## Design Expectations

- Prefer flagging and review over deletion or silent treatment.
- Protect identifiers, structural missing values, and survey design variables.
- Keep rule rationale plain enough for survey staff to review.
- Do not put rule logic in React components.
- Do not add network, telemetry, or backend dependencies.

## Implementation Steps

1. Add or update citation entries in `default-citations.json`.
2. Add the rule to `default-rules.json`.
3. Add rule engine support code if the existing matcher cannot express the
   condition.
4. Add tests in `tests/rules`.
5. Add or update renderer tests if the new step is rendered.
6. Update [references.md](references.md) and methodology notes if needed.

## Testing

At minimum, test that:

- the rule loads;
- it is recommended for suitable variables;
- it is blocked or absent for unsuitable variables;
- selected rules create the expected Cleaning Plan step;
- citation keys appear in generated plans;
- renderer output is correct or explicitly unsupported.
