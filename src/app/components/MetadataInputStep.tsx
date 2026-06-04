import type { DictionaryImportResult } from '../../importers'
import type { SurveyVariable } from '../../core'
import { useI18n } from '../../i18n/useI18n'
import type {
  ManualVariableFormValues,
  ManualVariableSaveResult,
} from '../state/manualEntry'
import { HelpText } from './HelpText'
import { ManualVariableEntry } from './ManualVariableEntry'
import { WarningList } from './WarningList'

interface MetadataInputStepProps {
  csvText: string
  importResult?: DictionaryImportResult
  variables: SurveyVariable[]
  onCsvTextChange: (value: string) => void
  onImportCsv: () => void
  onLoadDemo: () => void
  onImportFile: (file: File) => Promise<void>
  onSaveManualVariable: (
    formValues: ManualVariableFormValues,
    editingName?: string,
  ) => ManualVariableSaveResult
  onRemoveManualVariable: (variableName: string) => void
}

export function MetadataInputStep({
  csvText,
  importResult,
  variables,
  onCsvTextChange,
  onImportCsv,
  onLoadDemo,
  onImportFile,
  onSaveManualVariable,
  onRemoveManualVariable,
}: MetadataInputStepProps) {
  const { t } = useI18n()
  const uploadFile = async (fileList: FileList | null) => {
    const file = fileList?.[0]

    if (file) {
      await onImportFile(file)
    }
  }

  const warningMessages =
    importResult?.warnings.map((warning) => warning.message) ?? []

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 2 })}</p>
        <h2>{t('metadata.title')}</h2>
        <HelpText>{t('metadata.help')}</HelpText>
      </div>

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onLoadDemo}>
          {t('metadata.loadDemo')}
        </button>
      </div>

      <label className="wide-field">
        <span>{t('metadata.pasteCsv')}</span>
        <textarea
          rows={10}
          value={csvText}
          onChange={(event) => onCsvTextChange(event.target.value)}
          placeholder="variable_name,variable_label,data_type,role"
        />
      </label>

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onImportCsv}>
          {t('metadata.importPastedCsv')}
        </button>
        <label className="file-control">
          <span>{t('metadata.uploadLabel')}</span>
          <input
            type="file"
            accept=".csv,.xlsx,.xml,.dta,.sav,text/csv,application/xml,text/xml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-stata,application/x-spss-sav"
            onChange={(event) => void uploadFile(event.target.files)}
          />
        </label>
      </div>

      <section
        className="privacy-warning"
        aria-label={t('metadata.privacyAria')}
      >
        <h3>{t('metadata.privacyTitle')}</h3>
        <p>{t('metadata.privacyWarning')}</p>
        <p>{t('metadata.privacyPreference')}</p>
      </section>

      {importResult ? (
        <section
          className="summary-band"
          aria-label={t('metadata.importSummary')}
        >
          <div>
            <span className="metric-value">
              {importResult.importedVariableCount}
            </span>
            <span className="metric-label">
              {t('metadata.importedVariables')}
            </span>
          </div>
          <div>
            <span className="metric-value">
              {importResult.originalRowCount}
            </span>
            <span className="metric-label">{t('metadata.dictionaryRows')}</span>
          </div>
          <div>
            <span className="metric-value">
              {importResult.unmappedColumns.length}
            </span>
            <span className="metric-label">
              {t('metadata.unmappedColumns')}
            </span>
          </div>
        </section>
      ) : null}

      {importResult ? (
        <section
          className="mapping-list"
          aria-label={t('metadata.mappingTitle')}
        >
          <h3>{t('metadata.mappingTitle')}</h3>
          <dl>
            {Object.entries(importResult.columnMapping.mappedColumns).map(
              ([concept, columnName]) => (
                <div key={concept}>
                  <dt>{concept}</dt>
                  <dd>{columnName}</dd>
                </div>
              ),
            )}
          </dl>
        </section>
      ) : null}

      <WarningList
        title={t('metadata.importWarnings')}
        emptyMessage={importResult ? t('metadata.noImportWarnings') : undefined}
        messages={warningMessages}
      />

      <ManualVariableEntry
        variables={variables}
        onSaveVariable={onSaveManualVariable}
        onRemoveVariable={onRemoveManualVariable}
      />
    </div>
  )
}
