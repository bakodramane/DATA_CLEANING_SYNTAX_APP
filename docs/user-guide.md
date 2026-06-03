# User Guide

This guide explains the local workflow for statisticians and survey staff using
the Survey Data Cleaning Syntax Generator.

The app generates syntax from metadata. It does not clean a dataset directly and
it does not run SPSS, Stata, R, or Python code.

The public demo is available at:

```text
https://bakodramane.github.io/DATA_CLEANING_SYNTAX_APP/
```

## Workflow

### 1. Start A New Project

Open the app and begin on the Project step. A project is the working context for
one survey dictionary and one generated Cleaning Plan.

### 2. Enter Project Information

Enter the survey name, country or organisation, survey year, notes, and target
syntax languages. The survey name is used in generated file names and report
headings.

### 3. Load The Demo Dictionary

Use **Load demo household survey dictionary** to try the workflow without
providing your own metadata. The demo works offline after the first successful
app load.

### 4. Paste Or Upload A CSV Dictionary

Paste CSV dictionary text into the metadata box, or upload a local `.csv` file.
The app detects common dictionary columns such as variable name, label, type,
role, value labels, missing codes, and valid ranges. Unknown columns are kept as
source metadata for auditability.

### 5. Upload An Excel Dictionary

Upload a local `.xlsx` dictionary when the metadata is stored in a spreadsheet.
The app reads the workbook in the browser. The file is not uploaded to a server.

### 6. Upload A DDI XML Codebook

Upload a local `.xml` DDI Codebook file when the survey metadata is documented
in IHSN or World Bank-style XML. The app reads the XML in the browser and does
not upload it to a server.

The MVP importer extracts common Codebook metadata: study title, variable names,
labels, question or description text, universe notes, value labels, marked or
conservatively inferred missing codes, valid ranges, variable groups, and DDI
source notes. It warns when the XML is invalid, when the file does not look like
a DDI Codebook, or when a category or variable has partial metadata.

Review imported DDI variables carefully. Detected types, roles, missing codes,
and valid ranges are metadata-derived suggestions and may need correction in
Variable review. Missing categories marked in DDI, such as
`<catgry missing="Y">`, are imported as declared missing codes. Labels such as
`Don't know`, `Refused`, `Not stated`, `Not applicable`, `Missing`, and
`No response` may be inferred as missing codes with a warning so they can be
reviewed.

This is not full DDI lifecycle support. It focuses on practical DDI Codebook
metadata import and does not support every DDI version or edge case.

### 7. Upload Stata Or SPSS Package Files

Upload a local `.dta` or `.sav` file only when your confidentiality rules allow
the file to be opened in the browser. SPSS and Stata files may contain full
confidential microdata. The app processes files locally, attempts to extract
metadata only, does not upload files, and does not add observation-level values
to app state.

Prefer exported metadata dictionaries when confidentiality rules prohibit
opening full data files. The safe fallback workflow is to export a variable
dictionary from Stata or SPSS, save it as CSV or Excel, and import that
dictionary instead. See [Importer Support Matrix](importer-support-matrix.md)
and [Importing SPSS And Stata Metadata](importing-spss-stata.md) for support
details and fallback guidance.

Current Stata `.dta` support is conservative. The MVP parser reads tagged
v117-v119-style metadata sections for variable names, variable labels, storage
types, display formats, variable order, file label, case count, and value-label
set names. Binary value-label tables and extended missing-value semantics may
not be fully decoded, so the app warns users to review value labels and missing
codes manually or import an exported dictionary.

Current SPSS `.sav` support reads classic SAV dictionary records before the
data terminator. It extracts variable names, labels, storage types, display
formats, simple value labels, simple declared user-missing values, file label,
case count, and variable order where available. Range-based or specialised SAV
metadata may produce warnings and require an exported dictionary.

If direct metadata extraction is not possible, the app shows this fallback
message:

```text
Direct metadata extraction from this file was not possible. Export a metadata-only variable dictionary from SPSS or Stata to CSV/Excel, including variable names, labels, storage types, value labels, missing codes, valid ranges, and notes where available, then import that dictionary instead.
```

### 8. Add Variables Manually

Use manual variable entry when no dictionary file is available. Add each
variable with a name, label, type, role, and optional details such as storage
type, value labels, missing-value codes, valid range, allowed values,
skip-pattern note, and user notes.

Value labels can be typed in common formats:

```text
1=Male; 2=Female
1: Male, 2: Female
1 Male | 2 Female
```

Missing codes can be typed as labels or simple lists:

```text
-8=Don't know; -9=Refused
-8, -9
```

The app validates manual entries before adding them. It reports missing names,
invalid names, duplicate names, missing types, malformed label text, and ranges
where the minimum is greater than the maximum. Manual variables can be edited or
removed from the Metadata step, and their type or role can still be corrected in
Variable review.

### 9. Review Imported Or Manual Variables

Review each imported variable, including name, label, detected type, detected
role, value labels, missing codes, valid ranges, and detection notes.

### 10. Correct Variable Types And Roles

Adjust the detected type or role when needed. Corrections immediately update
recommended rules and the generated Cleaning Plan.

### 11. Review Recommended Rules

Recommended rules are metadata-driven checks or documentation steps. They may
include variable labels, value labels, range checks, domain checks, missingness
diagnosis, duplicate identifier checks, or outlier flags.

### 12. Understand Blocked Rules

Blocked rules are shown when a rule is not suitable for a variable. For example,
identifier variables are protected from imputation, and survey design variables
require specialist review before modification.

### 13. Preview The Cleaning Plan

The Cleaning Plan is a language-neutral JSON representation of the selected
steps, variables, assumptions, warnings, citations, and renderer capability
information. It is the audit-friendly bridge between metadata and generated
syntax.

### 14. Preview Generated Syntax

Preview generated SPSS v18, Stata v14, R, and Python syntax. Syntax is heavily
commented so analysts can see which metadata and rule rationale produced each
step.

Some renderer features are intentionally partial. The syntax preview and
downloads include warning comments when a step is a review template or needs
analyst adaptation. See the [Renderer Support Matrix](renderer-support-matrix.md)
for exact support by step type and language.

### 15. Download Scripts And Reports

Download generated scripts and the plain-language summary report from the Export
step. Downloads are browser-generated files and are not cached as remote server
responses.

### 16. Save The Cleaning Plan JSON

Save the Cleaning Plan JSON with the generated scripts. It records the selected
rules, assumptions, warnings, citations, and renderer capability information
used to produce the syntax.

### 17. Reuse The Cleaning Plan

The current release exports the Cleaning Plan JSON for review and archival use.
Future releases may add richer import or comparison workflows for saved plans.

## Plain-Language Terms

- **Variable type**: the kind of values a variable contains, such as continuous,
  count, binary, nominal, ordinal, string, date, time, weight, identifier, or
  geographic code.
- **Variable role**: how the variable is used in survey processing, such as
  identifier, weight, stratum, primary sampling unit, analysis, auxiliary,
  derived, or metadata.
- **Structural missingness**: a value is missing because the questionnaire route
  made the question not applicable, such as a valid skip pattern.
- **Outlier**: a value that is unusually high, low, or otherwise unexpected and
  should be reviewed before treatment.
- **Imputation**: filling missing values using a documented method. The app
  treats imputation as review-required because it can affect estimates.
- **Cleaning Plan**: the language-neutral plan that records variables, selected
  cleaning steps, assumptions, warnings, citations, and renderer support.
- **Renderer**: code that converts the Cleaning Plan into SPSS, Stata, R, or
  Python syntax.
- **Rule**: a transparent recommendation for a check, flag, warning, label, or
  treatment step based on imported metadata.

## Offline Use

Open the app once while online so the browser can cache the app shell. After
that first successful load, supported browsers can reopen the app offline. The
demo dictionary, pasted/uploaded dictionaries, rule review, Cleaning Plan
generation, syntax preview, and downloads all work locally.

Generated syntax must be reviewed before production use.
