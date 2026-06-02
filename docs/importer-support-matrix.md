# Importer Support Matrix

This matrix documents the current metadata import surface. It is intentionally
conservative: the app generates reviewable cleaning syntax from metadata, does
not execute scripts, does not upload files, and does not import
observation-level values into app state.

## Summary

| Format                   | Direct import status                     | Best use                              | Safe fallback                             |
| ------------------------ | ---------------------------------------- | ------------------------------------- | ----------------------------------------- |
| CSV dictionary           | Supported                                | Metadata exported as rows and columns | Fix headers and re-import                 |
| Excel `.xlsx` dictionary | Supported for simple worksheets          | Metadata maintained in spreadsheets   | Save as CSV or simple `.xlsx`             |
| DDI XML Codebook         | MVP support for common Codebook metadata | IHSN/World Bank-style codebooks       | Export variable dictionary to CSV/Excel   |
| Stata `.dta`             | Conservative tagged-DTA metadata path    | Approved local metadata inspection    | Export dictionary from Stata to CSV/Excel |
| SPSS `.sav`              | Conservative classic SAV dictionary path | Approved local metadata inspection    | Export dictionary from SPSS to CSV/Excel  |

## Supported Metadata Fields

| Metadata field           | CSV                                          | Excel                                         | DDI XML                                                  | Stata `.dta`                                                         | SPSS `.sav`                                           |
| ------------------------ | -------------------------------------------- | --------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| Variable names           | Supported via mapped columns                 | Supported via mapped columns                  | `<var name>` or `ID` fallback                            | Supported from `varnames`                                            | Supported from dictionary records                     |
| Variable labels          | Supported via mapped columns                 | Supported via mapped columns                  | `<labl>`                                                 | Supported from `variable_labels`                                     | Supported from variable records                       |
| Storage or declared type | Supported via mapped columns                 | Supported via mapped columns                  | `<varFormat>`, `type`, `intrvl`                          | Supported from variable type codes                                   | Supported as numeric or string width                  |
| Variable role            | Supported via mapped columns or detection    | Supported via mapped columns or detection     | Detected from names                                      | Detected from names                                                  | Detected from names                                   |
| Value labels             | Supported via mapped columns                 | Supported via mapped columns                  | `<catgry>` / `<catValu>` / `<labl>`                      | Value-label set names; limited MVP text labels in synthetic fixtures | Simple value-label records                            |
| Declared missing values  | Supported via mapped columns                 | Supported via mapped columns                  | Explicit missing categories and cautious label inference | Not fully decoded; extended missing requires manual review           | Simple user-missing values; range-based missing warns |
| Valid ranges             | Supported via mapped min/max columns         | Supported via mapped min/max columns          | `<valrng>` and `<range>`                                 | Not decoded in MVP                                                   | Not decoded in MVP                                    |
| Question text and notes  | Supported via notes/unmapped columns         | Supported via notes/unmapped columns          | `<txt>`, `<qstnLit>`, `<universe>`, `<notes>`            | File/variable notes only where available                             | File/variable notes only where available              |
| Variable groups          | Not native; preserved if provided as columns | Not native; preserved if provided as columns  | `<varGrp>`                                               | Not decoded in MVP                                                   | Not decoded in MVP                                    |
| File or study title      | Source filename                              | Source filename and sheet name where selected | Study title from `<titl>`                                | File label where available                                           | File label where available                            |
| Observation records      | Not applicable                               | Not applicable                                | Not applicable                                           | Not imported                                                         | Not imported                                          |

## Known Limitations

### CSV

- A variable-name column is required. Use headers such as `variable_name`,
  `name`, or `varname`.
- Column detection is heuristic. Review detected mappings before trusting the
  generated plan.
- Malformed value-label entries are skipped with warnings while valid entries
  are preserved.

### Excel

- The importer reads simple `.xlsx` worksheets, inline strings, shared strings,
  and scalar cell values.
- Complex workbook features such as formulas, merged headers, hidden sheets,
  pivot tables, and styled-only metadata are not interpreted.
- Malformed workbooks return a structured warning and should be exported as CSV
  or a simple `.xlsx` dictionary.

### DDI XML

- The importer targets common DDI Codebook structures, not full DDI Lifecycle
  coverage.
- Incomplete categories are warned about and skipped rather than guessed.
- Missing codes marked in DDI are preserved. Missing-code inference from labels
  is conservative and always warns.
- Unsupported XML structures should be preserved as source notes or surfaced as
  warnings where possible.

### Stata `.dta`

- The importer supports tagged v117-v119-style metadata sections where feasible.
- It extracts variable names, labels, storage types, display formats, variable
  order, file label, case count, and value-label set names.
- Binary value-label table decoding is limited.
- Extended missing values `.a` through `.z` cannot be confirmed without reading
  records, so the app warns users to review missing codes manually.
- Older or malformed files return the metadata-only fallback warning.

### SPSS `.sav`

- The importer reads classic SAV dictionary records before the data terminator.
- It extracts variable names, labels, storage types, display formats, simple
  value labels, simple user-missing values, file label, case count, and
  variable order where available.
- Range-based user-missing values produce a warning and require manual review.
- Long-name extension records, encoding edge cases, specialised records, and
  complex display metadata may require an exported dictionary.

## Safe Metadata Preparation

For confidential survey data, prefer metadata-only exports:

1. Open SPSS or Stata only in an approved environment.
2. Export a variable dictionary with names, labels, storage types, value labels,
   missing codes, valid ranges, and notes where available.
3. Save the dictionary as CSV or a simple `.xlsx` workbook.
4. Import that metadata dictionary into the app.
5. Review variable types, roles, value labels, missing codes, ranges, warnings,
   and generated syntax before use.

If direct package-file extraction fails, the app shows:

```text
Direct metadata extraction from this file was not possible. Export a metadata-only variable dictionary from SPSS or Stata to CSV/Excel, including variable names, labels, storage types, value labels, missing codes, valid ranges, and notes where available, then import that dictionary instead.
```

## Regression Fixtures

The test suite uses synthetic metadata only:

- CSV edge cases are generated inline in importer tests.
- Excel edge cases are generated as tiny in-memory `.xlsx` workbooks.
- DDI edge cases use small XML fixtures under `tests/fixtures/dictionaries`.
- Stata and SPSS edge cases are generated as tiny synthetic byte arrays in unit
  tests.

No real survey microdata is stored in the repository.
