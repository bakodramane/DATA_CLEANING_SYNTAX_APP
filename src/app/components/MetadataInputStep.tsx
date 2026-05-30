import type { DictionaryImportResult } from '../../importers'
import { HelpText } from './HelpText'
import { WarningList } from './WarningList'

interface MetadataInputStepProps {
  csvText: string
  importResult?: DictionaryImportResult
  onCsvTextChange: (value: string) => void
  onImportCsv: () => void
  onLoadDemo: () => void
  onImportFile: (file: File) => Promise<void>
}

export function MetadataInputStep({
  csvText,
  importResult,
  onCsvTextChange,
  onImportCsv,
  onLoadDemo,
  onImportFile,
}: MetadataInputStepProps) {
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
        <p className="eyebrow">Step 2</p>
        <h2>Metadata input</h2>
        <HelpText>
          Paste or upload a data dictionary. Unknown columns are kept with the
          imported metadata instead of being discarded.
        </HelpText>
      </div>

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onLoadDemo}>
          Load demo household survey dictionary
        </button>
      </div>

      <label className="wide-field">
        <span>Paste CSV dictionary text</span>
        <textarea
          rows={10}
          value={csvText}
          onChange={(event) => onCsvTextChange(event.target.value)}
          placeholder="variable_name,variable_label,data_type,role"
        />
      </label>

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onImportCsv}>
          Import pasted CSV
        </button>
        <label className="file-control">
          <span>Upload CSV or Excel dictionary</span>
          <input
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => void uploadFile(event.target.files)}
          />
        </label>
      </div>

      {importResult ? (
        <section className="summary-band" aria-label="Import summary">
          <div>
            <span className="metric-value">
              {importResult.importedVariableCount}
            </span>
            <span className="metric-label">Imported variables</span>
          </div>
          <div>
            <span className="metric-value">
              {importResult.originalRowCount}
            </span>
            <span className="metric-label">Dictionary rows</span>
          </div>
          <div>
            <span className="metric-value">
              {importResult.unmappedColumns.length}
            </span>
            <span className="metric-label">Unmapped columns preserved</span>
          </div>
        </section>
      ) : null}

      {importResult ? (
        <section className="mapping-list" aria-label="Detected column mapping">
          <h3>Detected column mapping</h3>
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

      <WarningList title="Import warnings" messages={warningMessages} />
    </div>
  )
}
