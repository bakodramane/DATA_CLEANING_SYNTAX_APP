import type { TranslationDictionary } from '../types'

export const en: TranslationDictionary = {
  'app.title': 'Cleaning Syntax Generator',
  'app.subtitle': 'Survey data-cleaning workflow',
  'app.offlineFirst': 'Offline-first PWA',
  'app.language': 'Language',
  'app.language.english': 'English',
  'app.language.french': 'Francais',
  'app.languageSelector': 'Interface language',

  'common.back': 'Back',
  'common.continue': 'Continue',
  'common.add': 'Add',
  'common.edit': 'Edit',
  'common.remove': 'Remove',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.download': 'Download',
  'common.none': 'None',
  'common.more': '{count} more',
  'common.noMinimum': 'no minimum',
  'common.noMaximum': 'no maximum',
  'common.to': 'to',
  'common.ready': 'Ready',
  'common.review': 'Review',
  'common.warnings': 'Warnings',
  'common.warning': 'Warning',
  'common.citations': 'Citations',
  'common.filename': 'Filename',
  'common.extension': 'Extension',

  'workflow.aria': 'Workflow steps',
  'workflow.project': 'Project',
  'workflow.metadata': 'Metadata',
  'workflow.variables': 'Variables',
  'workflow.rules': 'Rules',
  'workflow.plan': 'Cleaning Plan',
  'workflow.syntax': 'Syntax',
  'workflow.export': 'Export',
  'workflow.step': 'Step {number}',

  'status.online': 'Online',
  'status.offline': 'Offline',
  'status.optional.notConfigured':
    'Online: optional template-pack updates are planned for a later version and are not configured yet.',
  'status.optional.offline':
    'Offline mode: core features continue to work locally. Optional template-pack updates are unavailable.',

  'project.title': 'Project information',
  'project.help':
    'The project name appears in generated scripts, file names, and the summary report so reviewers can identify the work.',
  'project.surveyName': 'Survey or project name',
  'project.country': 'Country or organisation',
  'project.year': 'Survey year',
  'project.notes': 'Project notes',
  'project.targetLanguages': 'Target syntax languages',

  'metadata.title': 'Metadata input',
  'metadata.help':
    'Paste CSV text, upload a local dictionary, load the demo, or add variables manually. Files are processed locally in your browser.',
  'metadata.loadDemo': 'Load demo household survey dictionary',
  'metadata.pasteCsv': 'Paste CSV dictionary text',
  'metadata.importPastedCsv': 'Import pasted CSV',
  'metadata.uploadLabel':
    'Upload CSV, Excel, DDI XML, Stata DTA, or SPSS SAV metadata',
  'metadata.privacyTitle': 'SPSS and Stata privacy warning',
  'metadata.privacyAria': 'SPSS and Stata privacy warning',
  'metadata.privacyWarning':
    "SPSS and Stata files may contain confidential microdata. This app processes files locally in your browser and attempts to extract metadata only. Review your organisation's confidentiality rules before opening data files.",
  'metadata.privacyPreference':
    'Prefer exported metadata dictionaries when confidentiality rules prohibit opening full data files.',
  'metadata.importSummary': 'Import summary',
  'metadata.importedVariables': 'Imported variables',
  'metadata.dictionaryRows': 'Dictionary rows',
  'metadata.unmappedColumns': 'Unmapped columns preserved',
  'metadata.mappingTitle': 'Detected column mapping',
  'metadata.importWarnings': 'Import warnings',
  'metadata.noImportWarnings':
    'No import warnings. Continue to Variable review and check the detected type and role.',
  'metadata.importError': 'Import error',
  'metadata.continueWithoutVariables':
    'Add, import, or load at least one variable before continuing.',
  'metadata.fileImportError': 'The metadata file could not be imported.',

  'manual.title': 'Manual variable entry',
  'manual.aria': 'Manual variable entry',
  'manual.help':
    "Add variables one by one when no dictionary file is available. Value labels and missing codes accept entries like 1=Male; 2=Female or -8=Don't know; -9=Refused.",
  'manual.variableName': 'Variable name',
  'manual.variableLabel': 'Variable label',
  'manual.variableType': 'Variable type',
  'manual.variableRole': 'Variable role',
  'manual.storageType': 'Storage type',
  'manual.allowedValues': 'Allowed values',
  'manual.valueLabels': 'Value labels',
  'manual.missingCodes': 'Missing-value codes',
  'manual.validMinimum': 'Valid minimum',
  'manual.validMaximum': 'Valid maximum',
  'manual.skipPatternNote': 'Skip-pattern note',
  'manual.userNotes': 'User notes',
  'manual.selectType': 'Select type',
  'manual.addVariable': 'Add manual variable',
  'manual.updateVariable': 'Update manual variable',
  'manual.cancelEdit': 'Cancel edit',
  'manual.validationTitle': 'Manual-entry validation',
  'manual.variables': 'Manual variables',

  'variables.title': 'Variable review',
  'variables.help':
    'Check each type and role because they determine which review rules and syntax are recommended.',
  'variables.empty':
    'No variables are ready to review yet. Add a manual variable, import a dictionary, or load the demo from Metadata input.',
  'variables.name': 'Name',
  'variables.label': 'Label',
  'variables.type': 'Type',
  'variables.role': 'Role',
  'variables.valueLabels': 'Value labels',
  'variables.missingCodes': 'Missing codes',
  'variables.validRange': 'Valid range',
  'variables.detectionNote': 'Detection note',
  'variables.typeFor': 'Type for {name}',
  'variables.roleFor': 'Role for {name}',
  'variables.noDetectionNotes': 'No detection notes recorded.',

  'rules.title': 'Rule recommendation review',
  'rules.help':
    'Rules are recommendations for reviewer-approved checks and documentation, not automatic cleaning actions.',
  'rules.empty':
    'No rule recommendations are available yet. Import or add variables, then return to this step.',
  'rules.noneSelected':
    'No rules are selected for this variable. Select the checks to include before previewing the plan.',
  'rules.groupSummary': '{recommended} recommended, {blocked} blocked',
  'rules.userReviewNeeded': 'User review needed',
  'rules.methodWarnings': 'Methodological warning',
  'rules.viewBlocked': 'View blocked rules and explanations',
  'rules.noBlocked':
    'No blocked rules for this variable. Continue reviewing selected recommendations.',

  'plan.title': 'Cleaning Plan preview',
  'plan.help':
    'The Cleaning Plan is an auditable list of proposed checks, actions, assumptions, warnings, and citations.',
  'plan.empty':
    'No Cleaning Plan has been generated yet. Import variables, review rules, then continue to this step.',
  'plan.summary': 'Cleaning Plan summary',
  'plan.variables': 'Variables',
  'plan.cleaningSteps': 'Cleaning steps',
  'plan.validationStatus': 'Validation status',
  'plan.validationMessages': 'Validation messages',
  'plan.validationErrors': 'Validation errors',
  'plan.validationWarnings': 'Validation warnings',
  'plan.noValidationErrors':
    'No validation errors. The plan can be previewed and rendered.',
  'plan.noValidationWarnings':
    'No validation warnings. Continue to Syntax preview and review the generated scripts.',
  'plan.step': 'Step',
  'plan.type': 'Type',
  'plan.action': 'Action',
  'plan.rationale': 'Rationale',

  'syntax.title': 'Syntax preview',
  'syntax.help':
    'Each script is generated from the same Cleaning Plan and must be reviewed before production use.',
  'syntax.invalid':
    'Resolve Cleaning Plan validation errors before exporting syntax.',
  'syntax.languages': 'Syntax languages',
  'syntax.rendererWarnings': 'Renderer warnings',
  'syntax.generatedScript': '{language} generated script',
  'syntax.empty':
    'No syntax preview has been generated yet. Generate a valid Cleaning Plan and keep at least one target language selected.',
  'syntax.noRendererWarnings':
    'No renderer warnings for this script. Review the full code before production use.',

  'export.title': 'Export and download',
  'export.help':
    'Download the reusable Cleaning Plan, generated scripts, and a plain-language summary for review.',
  'export.blocked':
    'Syntax downloads are blocked until validation errors are resolved.',
  'export.empty': 'Generate a Cleaning Plan before exporting.',

  'download.cleaningPlanJson': 'Cleaning Plan JSON',
  'download.cleaningPlanJsonDescription':
    'Reusable project configuration for audit, review, or later comparison.',
  'download.spssSyntax': 'SPSS syntax',
  'download.spssScriptDescription': 'Script for SPSS v18.',
  'download.stataDoFile': 'Stata do-file',
  'download.stataDoFileDescription': 'Script for Stata v14.',
  'download.rScript': 'R script',
  'download.rScriptDescription': 'Script for R.',
  'download.pythonScript': 'Python script',
  'download.pythonScriptDescription': 'Script for Python.',
  'download.summaryReport': 'Plain-language summary report',
  'download.summaryReportDescription':
    'Plain-language documentation for reviewer sign-off and handover.',
  'download.script': '{language} script',

  'summary.defaultTitle': 'Cleaning Plan Summary',
  'summary.project': 'Project summary',
  'summary.country': 'Country or organisation',
  'summary.year': 'Survey year',
  'summary.notProvided': 'Not provided',
  'summary.importedVariables': 'Imported variables',
  'summary.selectedSteps': 'Selected cleaning steps',
  'summary.selectedRules': 'Selected rules',
  'summary.noRules': 'No rules selected yet.',
  'summary.cleaningSteps': 'Cleaning Plan steps',
  'summary.noSteps': 'No cleaning steps generated yet.',
  'summary.warnings': 'Warnings',
  'summary.noWarnings': 'No validation warnings were reported.',
  'summary.citations': 'Citations',
  'summary.noCitations': 'None',
  'summary.review': 'Generated syntax must be reviewed before production use.',

  'type.binary': 'binary',
  'type.continuous': 'continuous',
  'type.count': 'count',
  'type.date': 'date',
  'type.geographic_code': 'geographic code',
  'type.identifier': 'identifier',
  'type.nominal': 'nominal',
  'type.ordinal': 'ordinal',
  'type.string': 'string',
  'type.time': 'time',
  'type.weight': 'weight',

  'role.analysis': 'analysis',
  'role.identifier': 'identifier',
  'role.metadata': 'metadata',
  'role.psu': 'PSU',
  'role.stratum': 'stratum',
  'role.weight': 'weight',

  'action.delete': 'delete',
  'action.derive': 'derive',
  'action.flag': 'flag',
  'action.impute': 'impute',
  'action.no_action': 'no action',
  'action.set_missing': 'set missing',
  'action.winsorize': 'winsorize',

  'stepType.audit_log': 'audit log',
  'stepType.consistency_check': 'consistency check',
  'stepType.domain_check': 'domain check',
  'stepType.duplicate_id_check': 'duplicate identifier check',
  'stepType.imputation': 'imputation',
  'stepType.import_declaration': 'import declaration',
  'stepType.missing_value_declaration': 'missing-value declaration',
  'stepType.missingness_diagnosis': 'missingness diagnosis',
  'stepType.outlier_flag': 'outlier flag',
  'stepType.range_check': 'range check',
  'stepType.skip_pattern_check': 'skip-pattern check',
  'stepType.structural_missing_check': 'structural missingness check',
  'stepType.summary_report': 'summary report',
  'stepType.variable_label': 'variable label',
  'stepType.value_label': 'value label',

  'message.manual.nameRequired': 'The variable name is required.',
  'message.manual.invalidName':
    'Variable names should contain only letters, numbers and underscores, and should not start with a number.',
  'message.manual.duplicateName': 'This variable name is already used.',
  'message.manual.typeRequired': 'The variable type is required.',
  'message.manual.unsupportedType':
    'The selected variable type is not supported.',
  'message.manual.unsupportedRole':
    'The selected variable role is not supported.',
  'message.manual.invalidRange':
    'The minimum value cannot be greater than the maximum value.',
  'message.packageFallback':
    'Direct metadata extraction from this file was not possible. Export a metadata-only variable dictionary from SPSS or Stata to CSV/Excel, including variable names, labels, storage types, value labels, missing codes, valid ranges, and notes where available, then import that dictionary instead.',
}
