import type { TranslationDictionary } from '../types'

export const fr: TranslationDictionary = {
  'app.title': "Générateur de syntaxe d'apurement",
  'app.subtitle': "Flux d'apurement des données d'enquête",
  'app.offlineFirst': 'PWA utilisable hors ligne',
  'app.language': 'Langue',
  'app.language.english': 'English',
  'app.language.french': 'Français',
  'app.languageSelector': "Langue de l'interface",

  'common.back': 'Retour',
  'common.continue': 'Continuer',
  'common.add': 'Ajouter',
  'common.edit': 'Modifier',
  'common.remove': 'Supprimer',
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.copy': 'Copier',
  'common.copied': 'Copie',
  'common.download': 'Télécharger',
  'common.none': 'Aucun',
  'common.more': '{count} de plus',
  'common.noMinimum': 'pas de minimum',
  'common.noMaximum': 'pas de maximum',
  'common.to': 'a',
  'common.ready': 'Prêt',
  'common.review': 'À réviser',
  'common.warnings': 'Avertissements',
  'common.warning': 'Avertissement',
  'common.citations': 'Citations',
  'common.filename': 'Nom du fichier',
  'common.extension': 'Extension',

  'workflow.aria': 'Étapes du flux de travail',
  'workflow.project': 'Projet',
  'workflow.metadata': 'Métadonnées',
  'workflow.variables': 'Variables',
  'workflow.rules': 'Règles',
  'workflow.plan': "Plan d'apurement",
  'workflow.syntax': 'Syntaxe',
  'workflow.export': 'Exportation',
  'workflow.step': 'Étape {number}',

  'status.online': 'En ligne',
  'status.offline': 'Hors ligne',
  'status.optional.notConfigured':
    'En ligne : les mises a jour facultatives des modeles sont prevues pour une version ulterieure et ne sont pas encore configurees.',
  'status.optional.offline':
    'Mode hors ligne : les fonctions principales continuent de fonctionner localement. Les mises a jour facultatives des modeles ne sont pas disponibles.',

  'project.title': 'Informations sur le projet',
  'project.help':
    'Ces informations apparaissent dans le Plan d apurement, les scripts generes et le rapport de synthese.',
  'project.surveyName': 'Nom de l enquete ou du projet',
  'project.country': 'Pays ou organisation',
  'project.year': "Année de l'enquête",
  'project.notes': 'Notes du projet',
  'project.targetLanguages': 'Langages de syntaxe cibles',

  'metadata.title': 'Saisie des métadonnées',
  'metadata.help':
    'Collez ou importez un dictionnaire de donnees. Les colonnes inconnues sont conservees avec les metadonnees importees au lieu d etre ignorees.',
  'metadata.loadDemo':
    'Charger le dictionnaire de démonstration ménage/travail',
  'metadata.pasteCsv': 'Coller le texte CSV du dictionnaire',
  'metadata.importPastedCsv': 'Importer le CSV colle',
  'metadata.uploadLabel':
    'Importer des metadonnees CSV, Excel, DDI XML, Stata DTA ou SPSS SAV',
  'metadata.privacyTitle': 'Avertissement de confidentialité SPSS et Stata',
  'metadata.privacyAria': 'Avertissement de confidentialité SPSS et Stata',
  'metadata.privacyWarning':
    'Les fichiers SPSS et Stata peuvent contenir des microdonnees confidentielles. Cette application traite les fichiers localement dans votre navigateur et tente d extraire uniquement les metadonnees. Verifiez les regles de confidentialite de votre organisation avant d ouvrir des fichiers de donnees.',
  'metadata.privacyPreference':
    'Preferez les dictionnaires de metadonnees exportes lorsque les regles de confidentialite interdisent l ouverture de fichiers de donnees complets.',
  'metadata.importSummary': "Résumé de l'importation",
  'metadata.importedVariables': 'Variables importées',
  'metadata.dictionaryRows': 'Lignes du dictionnaire',
  'metadata.unmappedColumns': 'Colonnes non mappees conservees',
  'metadata.mappingTitle': 'Correspondance des colonnes détectée',
  'metadata.importWarnings': 'Avertissements d importation',
  'metadata.importError': 'Erreur d importation',
  'metadata.continueWithoutVariables':
    'Ajoutez, importez ou chargez au moins une variable avant de continuer.',
  'metadata.fileImportError':
    "Le fichier de métadonnées n'a pas pu être importé.",

  'manual.title': 'Saisie manuelle des variables',
  'manual.aria': 'Saisie manuelle des variables',
  'manual.help':
    'Ajoutez les variables une par une lorsqu aucun fichier de dictionnaire n est disponible. Les etiquettes de valeurs et les codes manquants acceptent des entrees comme 1=Homme; 2=Femme ou -8=Ne sait pas; -9=Refus.',
  'manual.variableName': 'Nom de la variable',
  'manual.variableLabel': 'Libellé de la variable',
  'manual.variableType': 'Type de variable',
  'manual.variableRole': 'Rôle de la variable',
  'manual.storageType': 'Type de stockage',
  'manual.allowedValues': 'Valeurs autorisees',
  'manual.valueLabels': 'Étiquettes de valeurs',
  'manual.missingCodes': 'Codes de valeurs manquantes',
  'manual.validMinimum': 'Minimum valide',
  'manual.validMaximum': 'Maximum valide',
  'manual.skipPatternNote': 'Note sur le filtre',
  'manual.userNotes': 'Notes utilisateur',
  'manual.selectType': 'Sélectionner un type',
  'manual.addVariable': 'Ajouter une variable manuelle',
  'manual.updateVariable': 'Mettre a jour la variable manuelle',
  'manual.cancelEdit': 'Annuler la modification',
  'manual.validationTitle': 'Validation de la saisie manuelle',
  'manual.variables': 'Variables manuelles',

  'variables.title': 'Revue des variables',
  'variables.help':
    'Verifiez le type et le role detectes. Les corrections mettent immediatement a jour les regles recommandees et la syntaxe generee.',
  'variables.empty': 'Importez les metadonnees avant de reviser les variables.',
  'variables.name': 'Nom',
  'variables.label': 'Libellé',
  'variables.type': 'Type',
  'variables.role': 'Rôle',
  'variables.valueLabels': 'Étiquettes de valeurs',
  'variables.missingCodes': 'Codes manquants',
  'variables.validRange': 'Intervalle valide',
  'variables.detectionNote': 'Note de détection',
  'variables.typeFor': 'Type pour {name}',
  'variables.roleFor': 'Role pour {name}',
  'variables.noDetectionNotes': 'Aucune note de detection enregistree.',

  'rules.title': 'Revue des règles recommandées',
  'rules.help':
    'Les regles recommandees privilegient le marquage et la revue. L imputation consiste a renseigner les valeurs manquantes au moyen d une methode statistique documentee.',
  'rules.empty': 'Importez des variables avant de reviser les regles.',
  'rules.groupSummary': '{recommended} recommandées, {blocked} bloquées',
  'rules.userReviewNeeded': 'Revue utilisateur requise',
  'rules.viewBlocked': 'Voir les règles bloquées et les explications',

  'plan.title': "Aperçu du Plan d'apurement",
  'plan.help':
    'Un Plan d apurement est une liste de controle independante du langage que les moteurs de rendu transforment en syntaxe SPSS, Stata, R et Python.',
  'plan.empty': 'Selectionnez des regles avant de previsualiser le plan.',
  'plan.summary': "Résumé du Plan d'apurement",
  'plan.variables': 'Variables',
  'plan.cleaningSteps': "Étapes d'apurement",
  'plan.validationStatus': 'Statut de validation',
  'plan.validationMessages': 'Messages de validation',
  'plan.step': 'Étape',
  'plan.type': 'Type',
  'plan.action': 'Action',
  'plan.rationale': 'Justification',

  'syntax.title': 'Aperçu de la syntaxe',
  'syntax.help':
    'Chaque script est genere a partir du meme Plan d apurement. Examinez les avertissements avant d utiliser une syntaxe en production.',
  'syntax.invalid':
    'Resolvez les erreurs de validation du Plan d apurement avant d exporter la syntaxe.',
  'syntax.languages': 'Langages de syntaxe',
  'syntax.rendererWarnings': 'Avertissements du moteur de rendu',
  'syntax.generatedScript': 'Script généré {language}',
  'syntax.empty': 'Aucun script n a encore ete genere.',

  'export.title': 'Exportation et téléchargement',
  'export.help':
    'Telechargez le Plan d apurement, la syntaxe generee et un resume en langage clair pour revue.',
  'export.blocked':
    'Les telechargements de syntaxe sont bloques jusqu a la resolution des erreurs de validation.',
  'export.empty': "Générez un Plan d'apurement avant l'exportation.",

  'download.cleaningPlanJson': "Plan d'apurement JSON",
  'download.summaryReport': 'Rapport de synthèse en langage clair',
  'download.script': 'Script {language}',

  'summary.defaultTitle': "Résumé du Plan d'apurement",
  'summary.project': 'Résumé du projet',
  'summary.country': 'Pays ou organisation',
  'summary.year': "Année de l'enquête",
  'summary.notProvided': 'Non renseigné',
  'summary.importedVariables': 'Variables importées',
  'summary.selectedSteps': "Étapes d'apurement sélectionnées",
  'summary.selectedRules': 'Règles sélectionnées',
  'summary.noRules': 'Aucune règle sélectionnée pour le moment.',
  'summary.cleaningSteps': "Étapes du Plan d'apurement",
  'summary.noSteps': "Aucune étape d'apurement n'a encore été générée.",
  'summary.warnings': 'Avertissements',
  'summary.noWarnings': "Aucun avertissement de validation n'a été signalé.",
  'summary.citations': 'Références',
  'summary.noCitations': 'Aucune',
  'summary.review': 'À examiner avant utilisation en production.',

  'type.binary': 'binaire',
  'type.continuous': 'continue',
  'type.count': 'denombrement',
  'type.date': 'date',
  'type.geographic_code': 'code geographique',
  'type.identifier': 'identifiant',
  'type.nominal': 'nominale',
  'type.ordinal': 'ordinale',
  'type.string': 'chaine',
  'type.time': 'heure',
  'type.weight': 'poids',

  'role.analysis': 'analyse',
  'role.identifier': 'identifiant',
  'role.metadata': 'metadonnees',
  'role.psu': 'unite primaire',
  'role.stratum': 'strate',
  'role.weight': 'poids',

  'action.delete': 'supprimer',
  'action.derive': 'deriver',
  'action.flag': 'marquer',
  'action.impute': 'imputer',
  'action.no_action': 'aucune action',
  'action.set_missing': 'declarer manquant',
  'action.winsorize': 'winsoriser',

  'stepType.audit_log': 'journal d audit',
  'stepType.consistency_check': 'controle de coherence',
  'stepType.domain_check': 'controle de domaine',
  'stepType.duplicate_id_check': 'controle des identifiants en double',
  'stepType.imputation': 'imputation',
  'stepType.import_declaration': 'declaration d importation',
  'stepType.missing_value_declaration': 'declaration des valeurs manquantes',
  'stepType.missingness_diagnosis': 'diagnostic des valeurs manquantes',
  'stepType.outlier_flag': 'marquage des valeurs atypiques',
  'stepType.range_check': 'controle d intervalle',
  'stepType.skip_pattern_check': 'controle de filtre',
  'stepType.structural_missing_check':
    'controle des valeurs manquantes structurelles',
  'stepType.summary_report': 'rapport de synthese',
  'stepType.variable_label': 'libelle de variable',
  'stepType.value_label': 'etiquette de valeur',

  'message.manual.nameRequired': 'Le nom de la variable est obligatoire.',
  'message.manual.invalidName':
    'Le nom de variable ne doit contenir que des lettres, des chiffres et des traits de soulignement, et ne doit pas commencer par un chiffre.',
  'message.manual.duplicateName': 'Ce nom de variable est deja utilise.',
  'message.manual.typeRequired': 'Le type de variable est obligatoire.',
  'message.manual.unsupportedType':
    'Le type de variable selectionne n est pas pris en charge.',
  'message.manual.unsupportedRole':
    'Le role de variable selectionne n est pas pris en charge.',
  'message.manual.invalidRange':
    'La valeur minimale ne peut pas etre superieure a la valeur maximale.',
  'message.packageFallback':
    'L extraction directe des metadonnees de ce fichier n a pas ete possible. Exportez depuis SPSS ou Stata un dictionnaire de variables contenant uniquement les metadonnees vers CSV/Excel, avec les noms de variables, libelles, types de stockage, etiquettes de valeurs, codes manquants, intervalles valides et notes disponibles, puis importez ce dictionnaire.',

  'rule.preserve_import_metadata.label': 'Conserver les metadonnees importees',
  'rule.preserve_import_metadata.description':
    'Documenter la ligne source du dictionnaire et les colonnes non mappees pour assurer la tracabilite.',
  'rule.preserve_import_metadata.rationale':
    'Les metadonnees importees doivent rester tracables afin que les analystes puissent reviser la maniere dont les champs du dictionnaire ont ete interpretes.',
  'rule.preserve_variable_label.label': 'Conserver le libelle de variable',
  'rule.preserve_variable_label.description':
    'Creer une syntaxe qui applique le libelle du codebook au jeu de donnees analytique.',
  'rule.preserve_variable_label.rationale':
    'Les libelles des variables d enquete conservent le sens du questionnaire et du dictionnaire pendant l analyse.',
  'rule.preserve_value_labels.label': 'Conserver les etiquettes de valeurs',
  'rule.preserve_value_labels.description':
    'Creer une syntaxe qui preserve les codes categoriels libelles.',
  'rule.preserve_value_labels.rationale':
    'Les etiquettes de valeurs documentent le sens des codes categoriels d enquete et reduisent les erreurs d interpretation.',
  'rule.declare_missing_codes.label':
    'Declarer les codes de valeurs manquantes',
  'rule.declare_missing_codes.description':
    'Creer une syntaxe pour documenter ou recoder les codes de valeurs manquantes declares.',
  'rule.declare_missing_codes.rationale':
    'Les codes de valeurs manquantes declares doivent etre explicites avant l analyse afin que la non-reponse ne soit pas traitee comme une donnee valide.',
  'rule.range_check_from_metadata.label':
    'Controle d intervalle a partir des metadonnees',
  'rule.range_check_from_metadata.description':
    'Signaler les valeurs hors du minimum et du maximum valides declares.',
  'rule.range_check_from_metadata.rationale':
    'Les valeurs situees hors des intervalles valides declares doivent etre marquees pour revue sans ecraser les donnees source.',
  'rule.non_negative_quantity_check.label':
    'Controle des quantites non negatives',
  'rule.non_negative_quantity_check.description':
    'Signaler les valeurs negatives pour les variables qui semblent etre des quantites non negatives.',
  'rule.non_negative_quantity_check.rationale':
    'Les denombrements et mesures de quantite d enquete sont generalement attendus comme non negatifs et doivent etre revises lorsqu ils sont negatifs.',
  'rule.domain_check_from_labels.label':
    'Controle de domaine a partir des valeurs libellees',
  'rule.domain_check_from_labels.description':
    'Signaler les valeurs categorielles absentes des etiquettes de valeurs ou des codes manquants declares.',
  'rule.domain_check_from_labels.rationale':
    'Les variables categorielles doivent etre controlees par rapport a leur domaine de codes documente avant l analyse.',
  'rule.string_blank_check.label': 'Controle des chaines vides',
  'rule.string_blank_check.description':
    'Signaler les chaines vides pour revue lorsque les champs texte sont analyses.',
  'rule.string_blank_check.rationale':
    'Les chaines vides peuvent representer une non-reponse item et doivent etre documentees avant l analyse.',
  'rule.string_length_check.label': 'Controle de longueur de chaine',
  'rule.string_length_check.description':
    'Signaler les chaines qui depassent les contraintes de longueur documentees.',
  'rule.string_length_check.rationale':
    'Les controles de longueur de chaine sont utiles lorsque le dictionnaire de donnees definit des longueurs de texte valides.',
  'rule.structural_missingness_check.label':
    'Proteger les valeurs manquantes structurelles',
  'rule.structural_missingness_check.description':
    'Signaler et documenter les regles de valeurs manquantes structurelles creees par des filtres valides.',
  'rule.structural_missingness_check.rationale':
    'Les valeurs manquantes structurelles proviennent d un routage valide du questionnaire et ne doivent pas etre traitees comme une non-reponse item ordinaire.',
  'rule.structural_missingness_check.warning.protect_structural_missingness':
    'Les valeurs manquantes structurelles doivent etre exclues de l imputation sauf si une revue avancee leve explicitement cette protection.',
  'rule.skip_pattern_check.label': 'Controle de filtre',
  'rule.skip_pattern_check.description':
    'Signaler les valeurs qui violent le routage documente du questionnaire.',
  'rule.skip_pattern_check.rationale':
    'Les dependances de filtre definissent quand une question est applicable et doivent etre controlees avant de traiter les valeurs manquantes.',
  'rule.duplicate_identifier_check.label':
    'Controle des identifiants en double',
  'rule.duplicate_identifier_check.description':
    'Verifier si les valeurs d identifiant sont dupliquees.',
  'rule.duplicate_identifier_check.rationale':
    'Les identifiants sont des cles d audit et de liaison; les doublons peuvent compromettre le couplage des enregistrements et doivent etre marques.',
  'rule.design_variable_protection_warning.label':
    'Avertissement de protection des variables de plan de sondage',
  'rule.design_variable_protection_warning.description':
    'Documenter que les variables de plan de sondage exigent une revue specialisee.',
  'rule.design_variable_protection_warning.rationale':
    'Les poids d enquete, strates et unites primaires influencent l inference fondee sur le plan de sondage et ne doivent pas etre modifies sans revue specialisee.',
  'rule.design_variable_protection_warning.warning.design_variable_review_required':
    'Les variables de plan de sondage ne doivent pas etre imputees, recodees ni traitees comme valeurs atypiques sans revue specialisee.',
  'rule.missingness_diagnosis_basic.label': 'Diagnostic des valeurs manquantes',
  'rule.missingness_diagnosis_basic.description':
    'Resumer le nombre et le pourcentage de valeurs manquantes.',
  'rule.missingness_diagnosis_basic.rationale':
    'Les resumes des valeurs manquantes aident a distinguer les enregistrements complets, incomplets et structurellement manquants avant les decisions de traitement.',
  'rule.date_plausibility_check.label': 'Controle de plausibilite des dates',
  'rule.date_plausibility_check.description':
    'Signaler les dates situees hors d une plage plausible documentee.',
  'rule.date_plausibility_check.rationale':
    'Les variables de date doivent etre controlees par rapport a des bornes plausibles propres a l enquete lorsqu elles sont documentees.',
  'rule.date_chronology_consistency_check.label':
    'Controle de coherence chronologique',
  'rule.date_chronology_consistency_check.description':
    'Proposer des controles chronologiques lorsque des variables de date liees existent.',
  'rule.date_chronology_consistency_check.rationale':
    'Les dates liees doivent etre revisees pour leur coherence chronologique uniquement lorsque l ordre attendu est connu.',
  'rule.outlier_tukey_flag.label':
    'Marquage des valeurs atypiques par la methode de Tukey',
  'rule.outlier_tukey_flag.description':
    'Signaler les valeurs numeriques atypiques au moyen des bornes de boite a moustaches de Tukey.',
  'rule.outlier_tukey_flag.rationale':
    'Les bornes de Tukey fournissent un premier marquage transparent des valeurs numeriques inhabituelles sans suppression ni modification des donnees.',
  'rule.outlier_mad_flag.label':
    'Marquage robuste des valeurs atypiques par MAD',
  'rule.outlier_mad_flag.description':
    'Signaler les valeurs numeriques atypiques au moyen de la deviation absolue mediane.',
  'rule.outlier_mad_flag.rationale':
    'Les marquages fondes sur la deviation absolue mediane sont robustes aux valeurs extremes et doivent etre revises plutot que traites automatiquement.',
  'rule.outlier_adjusted_boxplot_flag.label':
    'Marquage des valeurs atypiques par boite ajustee',
  'rule.outlier_adjusted_boxplot_flag.description':
    'Marquage robuste prevu pour les variables numeriques asymetriques.',
  'rule.outlier_adjusted_boxplot_flag.rationale':
    'Les boites ajustees peuvent etre preferables pour les variables asymetriques, mais le rendu actuel les marque comme option specialisee planifiee.',
  'rule.outlier_adjusted_boxplot_flag.warning.planned_outlier_method':
    'Le rendu de la boite ajustee est planifie et doit etre traite comme partiellement pris en charge.',
  'rule.outlier_hidiroglou_berthelot_flag.label':
    'Marquage Hidiroglou-Berthelot des valeurs atypiques',
  'rule.outlier_hidiroglou_berthelot_flag.description':
    'Methode de valeurs atypiques prevue pour les enquetes aupres des entreprises avec taille ou periode precedente.',
  'rule.outlier_hidiroglou_berthelot_flag.rationale':
    'Les methodes Hidiroglou-Berthelot exigent une revue specialisee et des variables auxiliaires de taille ou de periode precedente.',
  'rule.outlier_hidiroglou_berthelot_flag.warning.specialist_outlier_method':
    'Cette regle exige une variable de taille ou de periode precedente et ne fait pas partie du chemin de rendu MVP.',
  'rule.outlier_treatment_review_only.label':
    'Traitement des valeurs atypiques sur revue uniquement',
  'rule.outlier_treatment_review_only.description':
    'Documenter que les decisions de traitement ne doivent pas etre automatiques.',
  'rule.outlier_treatment_review_only.rationale':
    'Le traitement des valeurs atypiques peut modifier les estimations et doit etre une decision explicite du reviseur, non une action automatique par defaut.',
  'rule.outlier_treatment_review_only.warning.treatment_requires_user_action':
    'Ne pas supprimer, plafonner, winsoriser ni declarer des valeurs manquantes sans revue utilisateur explicite.',
  'rule.impute_continuous_mice_pmm.label':
    'Imputation MICE par appariement predictif moyen',
  'rule.impute_continuous_mice_pmm.description':
    'Utiliser MICE avec appariement predictif moyen lorsque des variables auxiliaires sont disponibles.',
  'rule.impute_continuous_mice_pmm.rationale':
    'L imputation multiple avec des predicteurs appropries peut soutenir la production de jeux de donnees prets pour l analyse en presence de non-reponse partielle.',
  'rule.impute_binary_logistic_mice.label':
    'Imputation MICE logistique binaire',
  'rule.impute_binary_logistic_mice.description':
    'Utiliser un modele d imputation de type logistique pour la non-reponse partielle binaire lorsque des predicteurs sont disponibles.',
  'rule.impute_binary_logistic_mice.rationale':
    'L imputation binaire doit utiliser un modele adapte aux resultats a deux categories et etre revue avant utilisation en production.',
  'rule.impute_nominal_multinomial_mice.label':
    'Imputation MICE multinomiale nominale',
  'rule.impute_nominal_multinomial_mice.description':
    'Utiliser une approche d imputation multinomiale pour la non-reponse partielle nominale lorsque le logiciel le permet.',
  'rule.impute_nominal_multinomial_mice.rationale':
    'L imputation nominale exige un modele categoriel et une revue attentive de la prevalence des categories et des predicteurs.',
  'rule.impute_nominal_multinomial_mice.warning.categorical_imputation_support_varies':
    'La prise en charge de l imputation multinomiale par les moteurs de rendu est partielle et la syntaxe generee peut exiger une adaptation utilisateur.',
  'rule.impute_ordinal_mice.label': 'Imputation MICE ordinale',
  'rule.impute_ordinal_mice.description':
    'Utiliser une approche ordinale ou logistique pour les categories ordonnees lorsque le logiciel le permet.',
  'rule.impute_ordinal_mice.rationale':
    'L imputation ordinale doit preserver les hypotheses d ordre et etre revue avant utilisation en production.',
  'rule.impute_ordinal_mice.warning.ordinal_model_review_required':
    'La prise en charge de l imputation ordinale varie selon le logiciel et exige une revue du modele.',
  'rule.impute_hot_deck_donor.label': 'Imputation par donneur hot deck',
  'rule.impute_hot_deck_donor.description':
    'Envisager l imputation par donneur lorsque les contraintes de production rendent l imputation multiple peu pratique.',
  'rule.impute_hot_deck_donor.rationale':
    'L imputation par donneur peut etre pratique en production, mais exige des classes de donneurs bien definies et une revue.',
  'rule.impute_regression_warning.label':
    'Avertissement sur l imputation par regression',
  'rule.impute_regression_warning.description':
    'N envisager l imputation par regression que comme option documentee, dependante du modele et revue.',
  'rule.impute_regression_warning.rationale':
    'L imputation par regression peut sous-estimer l incertitude si elle est appliquee naivement et doit etre proposee avec un avertissement clair.',
  'rule.impute_regression_warning.warning.regression_imputation_uncertainty_warning':
    'Une imputation par regression unique peut sous-estimer l incertitude et n equivaut pas a une inference par imputation multiple complete.',
  'rule.impute_median_fill_discouraged.label':
    'Remplissage par la mediane deconseille',
  'rule.impute_median_fill_discouraged.description':
    'Documenter le remplissage par la mediane comme option simple mais deconseillee pour les valeurs numeriques manquantes.',
  'rule.impute_median_fill_discouraged.rationale':
    'Le remplissage par la mediane est simple, mais peut deformer les relations et ne doit etre utilise qu apres revue explicite.',
  'rule.impute_median_fill_discouraged.warning.simple_fill_discouraged':
    'Les methodes de remplissage simple peuvent deformer la variance et les relations; privilegier les diagnostics ou une imputation fondee.',
  'rule.impute_mode_fill_discouraged.label':
    'Remplissage par le mode deconseille',
  'rule.impute_mode_fill_discouraged.description':
    'Documenter le remplissage par le mode comme option simple mais deconseillee pour les valeurs categorielles manquantes.',
  'rule.impute_mode_fill_discouraged.rationale':
    'Le remplissage par le mode peut surestimer les categories dominantes et ne doit etre utilise qu apres revue explicite.',
  'rule.impute_mode_fill_discouraged.warning.simple_fill_discouraged':
    'Les methodes de remplissage simple peuvent deformer les distributions de categories; privilegier les diagnostics ou une imputation fondee.',
  'rule.date_imputation_specialist_review.label':
    'Revue specialisee pour l imputation des dates',
  'rule.date_imputation_specialist_review.description':
    'Ne pas recommander l imputation des dates par defaut; exiger une revue specialisee.',
  'rule.date_imputation_specialist_review.rationale':
    'L imputation des dates peut creer une chronologie invalide et ne doit pas etre automatisee par defaut.',
  'rule.date_imputation_specialist_review.warning.date_imputation_not_recommended':
    'L imputation des dates n est pas recommandee par defaut et exige une revue specialisee.',
  'rule.audit_log_basic.label': 'Creer des champs de journal d audit',
  'rule.audit_log_basic.description':
    'Documenter les indicateurs generes et les decisions de revue.',
  'rule.audit_log_basic.rationale':
    'Les champs d audit documentent les marquages et les decisions de revue sans ecraser les valeurs source.',
  'rule.summary_report_basic.label': 'Creer un rapport de synthese',
  'rule.summary_report_basic.description':
    'Resumer les controles proposes, les avertissements et les hypotheses.',
  'rule.summary_report_basic.rationale':
    'Un rapport de synthese en langage clair appuie la documentation transparente de l enquete et la transmission aux reviseurs.',

  'blockedRule.rule_excluded_by_user':
    'La regle « {rule} » n est pas selectionnee dans la configuration actuelle.',
  'blockedRule.missing_required_metadata':
    'La regle « {rule} » exige des metadonnees qui ne sont pas disponibles pour {variable}.',
  'blockedRule.variable_type_not_applicable':
    'La regle « {rule} » n est pas applicable au type de variable de {variable}.',
  'blockedRule.variable_role_not_applicable':
    'La regle « {rule} » n est pas applicable au role de {variable}.',
  'blockedRule.identifier_imputation':
    'Les identifiants ne doivent pas etre imputes, car leur modification peut compromettre le couplage des enregistrements et les pistes d audit.',
  'blockedRule.structural_missing_imputation':
    'Les valeurs manquantes structurelles proviennent de filtres valides et ne doivent pas etre traitees comme une non-reponse partielle.',
  'blockedRule.design_variable_imputation':
    'Les poids, strates et unites primaires sont des variables de plan de sondage et ne doivent pas etre imputes sans revue specialisee.',
  'blockedRule.imputation_disabled':
    'Les regles d imputation sont desactivees dans le contexte actuel du moteur de regles.',
  'blockedRule.invalid_outlier_variable_type':
    'Les methodes de Tukey et MAD concernent des variables numeriques continues ou de denombrement; elles ne sont pas pertinentes pour les variables nominales, ordinales, binaires, texte, date ou identifiant.',
  'blockedRule.weight_outlier_requires_specialist_review':
    'Les poids d enquete sont des variables de plan de sondage et ne doivent pas recevoir un traitement arbitraire des valeurs atypiques sans revue specialisee.',
  'blockedRule.specialist_mode_required':
    'La regle « {rule} » exige un mode de revue specialisee avant de pouvoir etre proposee.',
  'blockedRule.advanced_mode_required':
    'La regle « {rule} » exige le mode avance avant de pouvoir etre proposee.',
}
