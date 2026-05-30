# User Guide

This guide explains the local workflow for statisticians using the application.

## Workflow

1. Enter project information and choose target syntax languages.
2. Paste a CSV dictionary, upload a CSV/XLSX dictionary, or load the demo
   household survey dictionary.
3. Review imported variables and correct detected type or role when needed.
4. Review recommended cleaning rules and blocked-rule explanations.
5. Preview the language-neutral Cleaning Plan and validation messages.
6. Preview SPSS v18, Stata v14, R, and Python syntax.
7. Download the Cleaning Plan JSON, scripts, and summary report.

## Offline Use

Open the app once while online so the browser can cache the app shell. After
that first successful load, supported browsers can reopen the app offline. The
demo dictionary, local pasted/uploaded dictionaries, rule review, Cleaning Plan
generation, syntax preview, and downloads all work locally.

The app does not upload dictionaries, Cleaning Plans, or generated scripts to a
server. Downloaded outputs are created in the browser from the current in-memory
workflow.

## Plain-Language Notes

- Structural missing means a value is missing because the question was correctly
  skipped.
- Outlier means a value is unusually high or low and should be reviewed.
- Imputation means filling in missing values using a documented statistical
  method.

Generated syntax must be reviewed before production use.
