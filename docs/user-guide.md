# User Guide

This guide explains the local workflow for statisticians and survey staff using
the Survey Data Cleaning Syntax Generator.

The app generates syntax from metadata. It does not clean a dataset directly and
it does not run SPSS, Stata, R, or Python code.

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

### 6. Review Imported Variables

Review each imported variable, including name, label, detected type, detected
role, value labels, missing codes, valid ranges, and detection notes.

### 7. Correct Variable Types And Roles

Adjust the detected type or role when needed. Corrections immediately update
recommended rules and the generated Cleaning Plan.

### 8. Review Recommended Rules

Recommended rules are metadata-driven checks or documentation steps. They may
include variable labels, value labels, range checks, domain checks, missingness
diagnosis, duplicate identifier checks, or outlier flags.

### 9. Understand Blocked Rules

Blocked rules are shown when a rule is not suitable for a variable. For example,
identifier variables are protected from imputation, and survey design variables
require specialist review before modification.

### 10. Preview The Cleaning Plan

The Cleaning Plan is a language-neutral JSON representation of the selected
steps, variables, assumptions, warnings, citations, and renderer capability
information. It is the audit-friendly bridge between metadata and generated
syntax.

### 11. Preview Generated Syntax

Preview generated SPSS v18, Stata v14, R, and Python syntax. Syntax is heavily
commented so analysts can see which metadata and rule rationale produced each
step.

### 12. Download Scripts And Reports

Download generated scripts and the plain-language summary report from the Export
step. Downloads are browser-generated files and are not cached as remote server
responses.

### 13. Save The Cleaning Plan JSON

Save the Cleaning Plan JSON with the generated scripts. It records the selected
rules, assumptions, warnings, citations, and renderer capability information
used to produce the syntax.

### 14. Reuse The Cleaning Plan

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
