import type { CleaningStep } from '../core'
import { translateStepRationale } from './ruleText'
import type { LanguageCode, TranslationValues } from './types'

type RendererCommentDictionary = Record<string, string>

const en: RendererCommentDictionary = {
  'title.banner':
    '=============================================================================',
  'title.name': 'Survey Microdata Cleaning Syntax',
  'title.target.spss': 'Generated target: SPSS v18 command syntax',
  'title.target.stata': 'Generated target: Stata v14 do-file syntax',
  'title.target.r': 'Generated target: R',
  'title.target.python': 'Generated target: Python script',
  'title.timestamp': 'Generation timestamp: {generatedAt}',
  'title.plan': 'Cleaning Plan: {title}',
  'title.planId': 'Cleaning Plan ID: {id}',
  'title.planVersion': 'Cleaning Plan version: {version}',
  'title.versionAssumption.spss':
    'Version assumption: IBM SPSS Statistics v18 command syntax',
  'title.versionAssumption.stata': 'Version assumption: Stata v14',
  'title.versionAssumption.python':
    'Version assumption: pandas/numpy plus scikit-learn for practical imputation',
  'title.versionNote.r':
    'Version note: first-release R renderer; review package versions before use.',
  'title.assumptions': 'Assumptions:',
  'title.noAssumptions': 'No assumptions were recorded in the Cleaning Plan',
  'title.reviewWarning': 'Review this generated syntax before production use',
  'title.noOverwrite.spss':
    'No records are deleted and source variables are not overwritten by validation checks',
  'title.noOverwrite.flags':
    'No records are deleted and validation checks write flag variables',
  'title.rBlackBox':
    'The script flags and documents issues; it must not be treated as a black box.',

  'step.separator':
    '-----------------------------------------------------------------------------',
  'step.id': 'Step ID: {id}',
  'step.type': 'Step type: {type}',
  'step.variables': 'Variables: {variables}',
  'step.none': 'None',
  'step.rationale': 'Rationale: {rationale}',
  'step.citation': 'Citation: {citations}',
  'step.reviewRequirement': 'Review requirement: {requirement}',
  'step.requiresReview': 'Requires user review',
  'step.automatic': 'Automatic step',
  'citation.none': 'None provided',

  'packages.required': 'Required packages:',
  'packages.rInstall': 'install.packages(c("dplyr", "labelled", "mice"))',
  'packages.pythonInstall': 'pip install pandas numpy scikit-learn statsmodels',
  'packages.expectedInput.r':
    'Expected input: a data frame named `{dataFrameName}`.',
  'packages.rename.r':
    'Rename your imported survey dataset to this object before running the script,',
  'packages.regenerate.r':
    'or regenerate the script with a different data frame name.',
  'packages.expectedInput.python':
    'Expected input: a pandas DataFrame named {dataFrameName}.',

  'comment.variableLabel': 'Variable label: {variable}',
  'comment.valueLabels': 'Value labels: {variable}',
  'comment.declaredMissingCodes':
    'Declared missing codes for {variable}: {values}',
  'comment.spssMissingPreserve':
    'SPSS user-missing declarations preserve original values; no source variable is overwritten',
  'comment.stataMvdecode':
    'mvdecode converts declared nonresponse codes to Stata system missing; review before running',
  'comment.pythonRecodedMissing':
    'These are recoded to np.nan for Python analysis. Review before running.',
  'comment.rRecodedMissing':
    'These are recoded to NA for R analysis. Review before running.',
  'comment.structuralCondition': 'Structural-missing condition: {condition}',
  'comment.applicableWhen': 'Applicable when: {condition}',
  'comment.flagCondition': 'Flag condition: {condition}',
  'comment.duplicateNoDelete.spss':
    'Duplicate identifier checks sort cases to tag duplicates; no records are deleted.',
  'comment.duplicateNoDelete':
    'Duplicate identifier checks tag records; no records are deleted.',
  'comment.spssImputationReview':
    'Review imputation models and structural missingness before running this syntax',
  'comment.spssImputationExclusions':
    'Identifier variables and structural missing values are excluded from imputation templates',
  'comment.spssImputationInspect':
    'After imputation, inspect generated imputed datasets before analysis',
  'comment.stataImputationReview':
    'Multiple imputation model choices require analyst review',
  'comment.stataStructuralExclusion':
    'Structural missing values must be excluded before imputation',
  'comment.stataIdentifierExclusion':
    'Identifier variables are excluded from mi register imputed lists',
  'comment.stataPoolingGuidance':
    'Example pooling guidance, to be adapted by the analyst:',
  'comment.rImputationReview':
    'Multiple imputation requires careful methodological review.',
  'comment.rMiceDefaults':
    'This MVP uses mice() with simple default methods and does not automate model selection.',
  'comment.rStructuralExclusion':
    'Structural missing values must be excluded before imputation.',
  'comment.rIdentifierExclusion':
    'Identifier variables are excluded from imputation methods.',
  'comment.rAnalysisGuidance':
    'Example analysis and pooling guidance, to be adapted by the analyst:',
  'comment.pythonVariableLabels':
    'pandas does not preserve SPSS/Stata-style variable labels natively; labels are stored in a dictionary.',
  'comment.pythonValueLabels':
    'pandas category/value labels are stored here as metadata dictionaries for analyst review.',
  'comment.pythonSingleDataset':
    'A single completed Python dataset is not equivalent to full Rubin-style multiple-imputation inference.',
  'comment.pythonPoolingWorkflow':
    'Use statsmodels or a specialised workflow when analysis pooling is required.',
  'comment.pythonImputationExclusions':
    'Identifier variables and structural missing values are excluded from imputation examples.',
  'comment.pythonPoolingGuidance':
    'Pooling guidance: fit models separately across multiple imputations and pool estimates.',
  'comment.pythonNotFullMi':
    'Do not treat completed_data_example as full multiple-imputation inference.',
  'comment.reviewGeneratedFlags':
    'Review generated flag_* variables and preserve reviewer decisions outside the source variables.',
  'comment.noSummaryVariables':
    'No variables were listed for the summary report step.',
  'comment.spssMadPlaceholder':
    'Replace the placeholder median and MAD values for {variable} after review',
  'comment.spssMadThreshold':
    'Example threshold: absolute robust z-score greater than {threshold}',
  'comment.spssMadIf':
    'IF (NOT MISSING({variable}) AND <{variable}_mad> > 0 AND ABS({variable} - <{variable}_median>) / <{variable}_mad> > {threshold}) {flag} = 1',
  'comment.spssTukeyPlaceholder':
    'Review quartiles for {variable}; replace placeholders before running the IF command',
  'comment.spssTukeyMultiplier': 'Tukey multiplier: {multiplier}',
  'comment.spssTukeyIf':
    'IF (NOT MISSING({variable}) AND ({variable} < <{variable}_lower_tukey> OR {variable} > <{variable}_upper_tukey>)) {flag} = 1',
}

const fr: RendererCommentDictionary = {
  'title.banner':
    '=============================================================================',
  'title.name': "Syntaxe d'apurement des microdonnées d'enquête",
  'title.target.spss': 'Cible générée : syntaxe de commandes SPSS v18',
  'title.target.stata': 'Cible générée : fichier do Stata v14',
  'title.target.r': 'Cible générée : R',
  'title.target.python': 'Cible générée : script Python',
  'title.timestamp': 'Horodatage de génération : {generatedAt}',
  'title.plan': "Plan d'apurement : {title}",
  'title.planId': "ID du Plan d'apurement : {id}",
  'title.planVersion': "Version du Plan d'apurement : {version}",
  'title.versionAssumption.spss':
    'Hypothèse de version : syntaxe de commandes IBM SPSS Statistics v18',
  'title.versionAssumption.stata': 'Hypothèse de version : Stata v14',
  'title.versionAssumption.python':
    'Hypothèse de version : pandas/numpy plus scikit-learn pour une imputation pratique',
  'title.versionNote.r':
    'Note de version : premier générateur R; vérifier les versions des paquets avant utilisation.',
  'title.assumptions': 'Hypothèses :',
  'title.noAssumptions':
    "Aucune hypothèse n'a été enregistrée dans le Plan d'apurement",
  'title.reviewWarning':
    'Examiner cette syntaxe générée avant toute utilisation en production',
  'title.noOverwrite.spss':
    'Aucun enregistrement n est supprimé et les variables source ne sont pas écrasées par les contrôles de validation',
  'title.noOverwrite.flags':
    'Aucun enregistrement n est supprimé et les contrôles de validation écrivent des variables indicatrices',
  'title.rBlackBox':
    'Le script signale et documente les problèmes; il ne doit pas être traité comme une boîte noire.',

  'step.separator':
    '-----------------------------------------------------------------------------',
  'step.id': "ID de l'étape : {id}",
  'step.type': "Type d'étape : {type}",
  'step.variables': 'Variables : {variables}',
  'step.none': 'Aucune',
  'step.rationale': 'Justification : {rationale}',
  'step.citation': 'Référence : {citations}',
  'step.reviewRequirement': 'Exigence de revue : {requirement}',
  'step.requiresReview': 'Revue utilisateur requise',
  'step.automatic': 'Étape automatique',
  'citation.none': 'Aucune référence fournie',

  'packages.required': 'Paquets requis :',
  'packages.rInstall': 'install.packages(c("dplyr", "labelled", "mice"))',
  'packages.pythonInstall': 'pip install pandas numpy scikit-learn statsmodels',
  'packages.expectedInput.r':
    'Entrée attendue : un data frame nommé `{dataFrameName}`.',
  'packages.rename.r':
    "Renommer le jeu de données d'enquête importé avec ce nom avant d'exécuter le script,",
  'packages.regenerate.r':
    'ou régénérer le script avec un autre nom de data frame.',
  'packages.expectedInput.python':
    'Entrée attendue : un pandas DataFrame nommé {dataFrameName}.',

  'comment.variableLabel': 'Libellé de variable : {variable}',
  'comment.valueLabels': 'Étiquettes de valeurs : {variable}',
  'comment.declaredMissingCodes':
    'Codes de valeurs manquantes déclarés pour {variable} : {values}',
  'comment.spssMissingPreserve':
    'Les déclarations SPSS de valeurs utilisateur manquantes préservent les valeurs originales; aucune variable source n est écrasée',
  'comment.stataMvdecode':
    'mvdecode convertit les codes de non-réponse déclarés en valeurs manquantes système Stata; examiner avant exécution',
  'comment.pythonRecodedMissing':
    'Ces codes sont recodés en np.nan pour l analyse Python. Examiner avant exécution.',
  'comment.rRecodedMissing':
    'Ces codes sont recodés en NA pour l analyse R. Examiner avant exécution.',
  'comment.structuralCondition':
    'Condition de valeur manquante structurelle : {condition}',
  'comment.applicableWhen': 'Applicable lorsque : {condition}',
  'comment.flagCondition': 'Condition de marquage : {condition}',
  'comment.duplicateNoDelete.spss':
    'Les contrôles des identifiants en double trient les observations pour marquer les doublons; aucun enregistrement n est supprimé.',
  'comment.duplicateNoDelete':
    'Les contrôles des identifiants en double marquent les enregistrements; aucun enregistrement n est supprimé.',
  'comment.spssImputationReview':
    "Examiner les modèles d'imputation et les valeurs manquantes structurelles avant d'exécuter cette syntaxe",
  'comment.spssImputationExclusions':
    "Les variables d'identification et les valeurs manquantes structurelles sont exclues des modèles d'imputation",
  'comment.spssImputationInspect':
    'Après imputation, inspecter les jeux de données imputés générés avant analyse',
  'comment.stataImputationReview':
    "Les choix de modèle d'imputation multiple exigent une revue par l analyste",
  'comment.stataStructuralExclusion':
    'Les valeurs manquantes structurelles doivent être exclues avant imputation',
  'comment.stataIdentifierExclusion':
    'Les variables d identification sont exclues des listes mi register imputed',
  'comment.stataPoolingGuidance':
    "Exemple de consigne de combinaison, à adapter par l'analyste :",
  'comment.rImputationReview':
    "L'imputation multiple exige une revue méthodologique attentive.",
  'comment.rMiceDefaults':
    'Ce MVP utilise mice() avec des méthodes simples par défaut et n automatise pas la sélection du modèle.',
  'comment.rStructuralExclusion':
    'Les valeurs manquantes structurelles doivent être exclues avant imputation.',
  'comment.rIdentifierExclusion':
    "Les variables d'identification sont exclues des méthodes d'imputation.",
  'comment.rAnalysisGuidance':
    "Exemple d'analyse et de combinaison, à adapter par l'analyste :",
  'comment.pythonVariableLabels':
    'pandas ne préserve pas nativement les libellés de variables de type SPSS/Stata; les libellés sont stockés dans un dictionnaire.',
  'comment.pythonValueLabels':
    'Les étiquettes de catégories/valeurs pandas sont stockées ici comme dictionnaires de métadonnées pour revue par l analyste.',
  'comment.pythonSingleDataset':
    "Un seul jeu de données Python complété n'est pas équivalent à une inférence complète par imputation multiple de type Rubin.",
  'comment.pythonPoolingWorkflow':
    'Utiliser statsmodels ou un flux spécialisé lorsqu une combinaison des analyses est nécessaire.',
  'comment.pythonImputationExclusions':
    "Les variables d'identification et les valeurs manquantes structurelles sont exclues des exemples d'imputation.",
  'comment.pythonPoolingGuidance':
    'Consigne de combinaison : ajuster les modèles séparément sur plusieurs imputations et combiner les estimations.',
  'comment.pythonNotFullMi':
    'Ne pas traiter completed_data_example comme une inférence complète par imputation multiple.',
  'comment.reviewGeneratedFlags':
    'Examiner les variables flag_* générées et conserver les décisions de revue en dehors des variables source.',
  'comment.noSummaryVariables':
    "Aucune variable n'a été listée pour l'étape de rapport de synthèse.",
  'comment.spssMadPlaceholder':
    'Remplacer les valeurs indicatives de médiane et de MAD pour {variable} après revue',
  'comment.spssMadThreshold':
    'Exemple de seuil : score z robuste absolu supérieur à {threshold}',
  'comment.spssMadIf':
    'IF (NOT MISSING({variable}) AND <{variable}_mad> > 0 AND ABS({variable} - <{variable}_median>) / <{variable}_mad> > {threshold}) {flag} = 1',
  'comment.spssTukeyPlaceholder':
    'Examiner les quartiles pour {variable}; remplacer les espaces réservés avant d exécuter la commande IF',
  'comment.spssTukeyMultiplier': 'Multiplicateur de Tukey : {multiplier}',
  'comment.spssTukeyIf':
    'IF (NOT MISSING({variable}) AND ({variable} < <{variable}_lower_tukey> OR {variable} > <{variable}_upper_tukey>)) {flag} = 1',
}

const rendererCommentDictionaries: Record<
  LanguageCode,
  RendererCommentDictionary
> = {
  en,
  fr,
}

export function rendererComment(
  language: LanguageCode | undefined,
  key: string,
  values: TranslationValues = {},
): string {
  const selectedLanguage = language ?? 'en'
  const template =
    rendererCommentDictionaries[selectedLanguage][key] ??
    rendererCommentDictionaries.en[key] ??
    key

  return interpolate(template, values)
}

export function rendererCitationKeys(
  language: LanguageCode | undefined,
  citationKeys: string[],
): string {
  return citationKeys.length > 0
    ? citationKeys.join(', ')
    : rendererComment(language, 'citation.none')
}

export function rendererStepRationale(
  language: LanguageCode | undefined,
  step: CleaningStep,
): string {
  return language && language !== 'en'
    ? translateStepRationale(language, step)
    : step.rationale
}

export function rendererReviewRequirement(
  language: LanguageCode | undefined,
  requiresReview: boolean,
): string {
  return rendererComment(
    language,
    requiresReview ? 'step.requiresReview' : 'step.automatic',
  )
}

export function rendererWarning(
  language: LanguageCode | undefined,
  message: string,
): string {
  return `${rendererComment(language, 'warning.prefix')} ${rendererWarningMessage(
    language,
    message,
  )}`
}

export function rendererWarningMessage(
  language: LanguageCode | undefined,
  message: string,
): string {
  if (language !== 'fr') {
    return message
  }

  const exact = frenchWarningMessages[message]
  if (exact) {
    return exact
  }

  return translateFrenchDynamicWarning(message)
}

const warningPrefixes: Record<LanguageCode, string> = {
  en: 'WARNING:',
  fr: 'AVERTISSEMENT :',
}

en['warning.prefix'] = warningPrefixes.en
fr['warning.prefix'] = warningPrefixes.fr

const frenchWarningMessages: Record<string, string> = {
  'SPSS structural-missing checks are rendered as review flags only; values are not recoded or imputed.':
    'Les contrôles SPSS de valeurs manquantes structurelles sont rendus uniquement comme indicateurs de revue; les valeurs ne sont ni recodées ni imputées.',
  'Stata structural-missing checks are rendered as review flags only; values are not recoded or imputed.':
    'Les contrôles Stata de valeurs manquantes structurelles sont rendus uniquement comme indicateurs de revue; les valeurs ne sont ni recodées ni imputées.',
  'R structural-missing checks are rendered as review flags only; values are not recoded or imputed.':
    'Les contrôles R de valeurs manquantes structurelles sont rendus uniquement comme indicateurs de revue; les valeurs ne sont ni recodées ni imputées.',
  'Python structural-missing checks are rendered as review flags only; values are not recoded or imputed.':
    'Les contrôles Python de valeurs manquantes structurelles sont rendus uniquement comme indicateurs de revue; les valeurs ne sont ni recodées ni imputées.',
  'SPSS skip-pattern checks use simple applicability conditions and only flag possible routing violations.':
    'Les contrôles SPSS de filtre utilisent des conditions simples d applicabilité et marquent seulement les violations possibles du routage.',
  'Stata skip-pattern checks use simple applicability conditions and only flag possible routing violations.':
    'Les contrôles Stata de filtre utilisent des conditions simples d applicabilité et marquent seulement les violations possibles du routage.',
  'R skip-pattern checks use simple applicability conditions and only flag possible routing violations.':
    'Les contrôles R de filtre utilisent des conditions simples d applicabilité et marquent seulement les violations possibles du routage.',
  'Python skip-pattern checks use simple applicability conditions and only flag possible routing violations.':
    'Les contrôles Python de filtre utilisent des conditions simples d applicabilité et marquent seulement les violations possibles du routage.',
  'SPSS consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.':
    "Les contrôles SPSS de cohérence sont rendus uniquement lorsque le Plan d'apurement fournit une condition simple de marquage.",
  'Stata consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.':
    "Les contrôles Stata de cohérence sont rendus uniquement lorsque le Plan d'apurement fournit une condition simple de marquage.",
  'R consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.':
    "Les contrôles R de cohérence sont rendus uniquement lorsque le Plan d'apurement fournit une condition simple de marquage.",
  'Python consistency checks are rendered only when the Cleaning Plan supplies a simple flag condition.':
    "Les contrôles Python de cohérence sont rendus uniquement lorsque le Plan d'apurement fournit une condition simple de marquage.",
  'SPSS multiple imputation requires the relevant SPSS functionality and analyst review':
    "L'imputation multiple SPSS exige la fonctionnalité SPSS pertinente et une revue par l analyste.",
  'IterativeImputer is experimental in scikit-learn and must be reviewed before production use.':
    'IterativeImputer est expérimental dans scikit-learn et doit être examiné avant toute utilisation en production.',
  'Structural missing values were requested for imputation and have been blocked.':
    "Des valeurs manquantes structurelles ont été demandées pour l'imputation et ont été bloquées.",
}

function translateFrenchDynamicWarning(message: string): string {
  const unsupportedStep = message.match(
    /^Step type "([^"]+)" is not yet supported by the current (.+) renderer\.$/,
  )
  if (unsupportedStep) {
    return `Étape non prise en charge : le type d'étape "${unsupportedStep[1]}" n'est pas encore implémenté par le générateur ${unsupportedStep[2]}.`
  }

  const noValueLabels = message.match(
    /^Variable "([^"]+)" has no value labels to render\.$/,
  )
  if (noValueLabels) {
    return `La variable "${noValueLabels[1]}" n'a pas d'étiquettes de valeurs à rendre.`
  }

  const noMissingCodes = message.match(
    /^Variable "([^"]+)" has no declared missing codes to (render|recode)\.$/,
  )
  if (noMissingCodes) {
    return `La variable "${noMissingCodes[1]}" n'a pas de codes de valeurs manquantes déclarés à rendre.`
  }

  const noRange = message.match(
    /^Range check "([^"]+)" has no min or max for "([^"]+)"\.$/,
  )
  if (noRange) {
    return `Le contrôle d'intervalle "${noRange[1]}" n'a ni minimum ni maximum pour "${noRange[2]}".`
  }

  const noDomain = message.match(
    /^Domain check "([^"]+)" has no allowed values for "([^"]+)"\.$/,
  )
  if (noDomain) {
    return `Le contrôle de domaine "${noDomain[1]}" n'a pas de valeurs autorisées pour "${noDomain[2]}".`
  }

  const outlierType = message.match(
    /^Outlier method "([^"]+)" is only rendered for continuous or count variables; "([^"]+)" is ([^.]+)\.$/,
  )
  if (outlierType) {
    return `La méthode de valeurs atypiques "${outlierType[1]}" est rendue uniquement pour les variables continues ou de dénombrement; "${outlierType[2]}" est de type ${outlierType[3]}.`
  }

  const spssOutlierTemplate = message.match(
    /^SPSS v18 ([^ ]+) outlier thresholds are emitted as a review template; verify thresholds before running production syntax\.$/,
  )
  if (spssOutlierTemplate) {
    return `Les seuils SPSS v18 de valeurs atypiques (${spssOutlierTemplate[1]}) sont émis comme modèle de revue; vérifier les seuils avant d'exécuter la syntaxe de production.`
  }

  const unsupportedOutlier = message.match(
    /^Outlier method "([^"]+)" is not supported by the current (.+) renderer; no deletion, capping, or winsorisation (syntax|code) was generated\.$/,
  )
  if (unsupportedOutlier) {
    return `La méthode de valeurs atypiques "${unsupportedOutlier[1]}" n'est pas prise en charge par le générateur ${unsupportedOutlier[2]}; aucune syntaxe de suppression, de plafonnement ou de winsorisation n'a été générée.`
  }

  const noStructuralTarget = message.match(
    /^Structural-missing step "([^"]+)" has no target variable to flag\.$/,
  )
  if (noStructuralTarget) {
    return `L'étape de valeurs manquantes structurelles "${noStructuralTarget[1]}" n'a pas de variable cible à marquer.`
  }

  const noStructuralCondition = message.match(
    /^Structural-missing step "([^"]+)" has no condition; review the Cleaning Plan notes manually\.$/,
  )
  if (noStructuralCondition) {
    return `L'étape de valeurs manquantes structurelles "${noStructuralCondition[1]}" n'a pas de condition; examiner manuellement les notes du Plan d'apurement.`
  }

  const noSkipTarget = message.match(
    /^Skip-pattern step "([^"]+)" has no target variable to flag\.$/,
  )
  if (noSkipTarget) {
    return `L'étape de filtre "${noSkipTarget[1]}" n'a pas de variable cible à marquer.`
  }

  const noSkipCondition = message.match(
    /^Skip-pattern step "([^"]+)" has no applicability condition; review the questionnaire routing manually\.$/,
  )
  if (noSkipCondition) {
    return `L'étape de filtre "${noSkipCondition[1]}" n'a pas de condition d applicabilité; examiner manuellement le routage du questionnaire.`
  }

  const noConsistencyCondition = message.match(
    /^Consistency check "([^"]+)" has no condition; no executable flag was generated\.$/,
  )
  if (noConsistencyCondition) {
    return `Le contrôle de cohérence "${noConsistencyCondition[1]}" n'a pas de condition; aucun indicateur exécutable n'a été généré.`
  }

  const noDuplicateIds = message.match(
    /^Duplicate ID check "([^"]+)" has no identifier variables\.$/,
  )
  if (noDuplicateIds) {
    return `Le contrôle des identifiants en double "${noDuplicateIds[1]}" n'a pas de variables d'identification.`
  }

  const noImputationVariables = message.match(
    /^Imputation step "([^"]+)" has no variables (?:suitable for (.+)|that can be rendered for mice\(\))\.$/,
  )
  if (noImputationVariables) {
    return `L'étape d'imputation "${noImputationVariables[1]}" n'a pas de variables adaptées à ce générateur.`
  }

  const identifierExcluded = message.match(
    /^Identifier variable "([^"]+)" was excluded from imputation\.$/,
  )
  if (identifierExcluded) {
    return `La variable d'identification "${identifierExcluded[1]}" a été exclue de l'imputation.`
  }

  const categoricalMice = message.match(
    /^Categorical variable "([^"]+)" uses a mice categorical method; review category prevalence and model fit before production use\.$/,
  )
  if (categoricalMice) {
    return `La variable catégorielle "${categoricalMice[1]}" utilise une méthode catégorielle de mice; examiner la prévalence des catégories et l'ajustement du modèle avant utilisation en production.`
  }

  const categoricalPython = message.match(
    /^Categorical variable "([^"]+)" is included in a numeric IterativeImputer example; review encoding and model fit before production use\.$/,
  )
  if (categoricalPython) {
    return `La variable catégorielle "${categoricalPython[1]}" est incluse dans un exemple numérique IterativeImputer; examiner le codage et l'ajustement du modèle avant utilisation en production.`
  }

  const auditPartial = message.match(
    /^(SPSS|Stata|R|Python) audit-log support is partial: this section documents review guidance but does not create a separate audit table\.$/,
  )
  if (auditPartial) {
    return `La prise en charge du journal d'audit par ${auditPartial[1]} est partielle : cette section documente les consignes de revue mais ne crée pas de table d'audit séparée.`
  }

  const summaryPartial = message.match(
    /^(SPSS|Stata|R|Python) summary-report support is partial: basic summaries are emitted for review, not a publication-ready report\.$/,
  )
  if (summaryPartial) {
    return `La prise en charge du rapport de synthèse par ${summaryPartial[1]} est partielle : des résumés simples sont émis pour revue, pas un rapport prêt pour publication.`
  }

  const stataExtended = message.match(
    /^Stata extended missing values \((.+)\) were detected for "([^"]+)"; review them because mvdecode is intended for declared nonresponse codes\.$/,
  )
  if (stataExtended) {
    return `Des valeurs manquantes étendues Stata (${stataExtended[1]}) ont été détectées pour "${stataExtended[2]}"; les examiner car mvdecode vise les codes de non-réponse déclarés.`
  }

  return message
}

function interpolate(template: string, values: TranslationValues): string {
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  )
}
