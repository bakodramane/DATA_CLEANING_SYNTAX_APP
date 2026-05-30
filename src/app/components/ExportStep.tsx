import type { ValidationResult } from '../../core'
import type { DownloadArtifact } from '../state/workflowTypes'
import { DownloadButton } from './DownloadButton'
import { HelpText } from './HelpText'

interface ExportStepProps {
  downloads: DownloadArtifact[]
  validation?: ValidationResult
}

export function ExportStep({ downloads, validation }: ExportStepProps) {
  const syntaxBlocked = validation !== undefined && !validation.valid

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">Step 7</p>
        <h2>Export and download</h2>
        <HelpText>
          Download the Cleaning Plan, generated syntax, and a plain-language
          summary for review.
        </HelpText>
      </div>

      {syntaxBlocked ? (
        <p className="blocked-export">
          Syntax downloads are blocked until validation errors are resolved.
        </p>
      ) : null}

      {downloads.length === 0 ? (
        <p className="empty-state">
          Generate a Cleaning Plan before exporting.
        </p>
      ) : (
        <div className="download-list">
          {downloads.map((artifact) => (
            <article className="download-row" key={artifact.id}>
              <div>
                <h3>{artifact.label}</h3>
                <p>{artifact.filename}</p>
              </div>
              <DownloadButton artifact={artifact} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
