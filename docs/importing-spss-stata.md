# Importing SPSS And Stata Metadata

SPSS `.sav` and Stata `.dta` files may contain full confidential microdata.
Use direct package-file import only when your organisation allows the file to be
opened locally in the browser. When rules prohibit opening full data files,
export a metadata-only dictionary from SPSS or Stata and import that CSV or
Excel file instead.

## Privacy Model

- Files are processed locally in the browser.
- Files are not uploaded to a server.
- The app has no backend, telemetry, analytics, authentication, cloud storage,
  or remote logging.
- Importers attempt to extract metadata only.
- Observation-level records are not imported into app state.
- Generated Cleaning Plans and scripts are created locally and are exported only
  when the user downloads them.

## Stata DTA Support

The Phase 12 Stata importer is an MVP for tagged v117-v119-style DTA metadata.
It attempts to extract:

- variable names;
- variable labels;
- storage types;
- display formats;
- variable order;
- file label;
- case count;
- value-label set names;
- source notes.

The importer does not inspect observation records. Binary value-label table
decoding and extended missing-value semantics are limited in this MVP. When
those details are required, export a metadata dictionary from Stata and import
the dictionary as CSV or Excel. See the
[Importer Support Matrix](importer-support-matrix.md) for exact field coverage
by format.

## SPSS SAV Support

The Phase 12 SPSS importer reads classic SAV dictionary records before the data
terminator. It attempts to extract:

- variable names;
- variable labels;
- numeric or string storage type;
- display formats;
- simple value labels;
- simple declared user-missing values;
- variable order;
- file label;
- case count;
- source notes.

Range-based user-missing values, long-name extension records, encoding edge
cases, and specialised SAV records may produce warnings. If metadata extraction
is incomplete, use an exported dictionary.

## Safe Fallback Workflow

If direct metadata extraction is not possible, the app shows:

```text
Direct metadata extraction from this file was not possible. Export a metadata-only variable dictionary from SPSS or Stata to CSV/Excel, including variable names, labels, storage types, value labels, missing codes, valid ranges, and notes where available, then import that dictionary instead.
```

A safe exported-dictionary workflow is:

1. Open the file in SPSS or Stata only in an approved environment.
2. Export or copy a variable dictionary that contains names, labels, storage
   types, value labels, missing codes, valid ranges, and notes.
3. Save the dictionary as CSV or Excel.
4. Import that CSV or Excel dictionary into this app.
5. Review detected types, roles, missing codes, and value labels before
   generating syntax.

In SPSS, `DISPLAY DICTIONARY.` or the Data File Information output can be used
as a starting point for a metadata-only dictionary. In Stata, `describe` and
`label list` can be used as starting points for variable and value-label
metadata. Exact export steps vary by organisation, software version, and
approved disclosure-control workflow.

## Current Limitations

- The app generates syntax only; it does not execute scripts.
- The app does not profile or summarise observation-level data.
- Stata value-label table decoding is limited.
- Stata extended missing values require manual review unless provided in an
  exported dictionary.
- SPSS specialised extension records may require manual review.
- Direct import is a convenience path, not a substitute for an approved
  metadata-export process.
