import type { ValidationResult } from '../../core'
import { useI18n } from '../../i18n/useI18n'
import { languageLabels } from '../state/appState'
import type { DownloadArtifact } from '../state/workflowTypes'
import { DownloadButton } from './DownloadButton'
import { HelpText } from './HelpText'

interface ExportStepProps {
  downloads: DownloadArtifact[]
  validation?: ValidationResult
}

export function ExportStep({ downloads, validation }: ExportStepProps) {
  const { t } = useI18n()
  const syntaxBlocked = validation !== undefined && !validation.valid

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 7 })}</p>
        <h2>{t('export.title')}</h2>
        <HelpText>{t('export.help')}</HelpText>
      </div>

      {syntaxBlocked ? (
        <p className="blocked-export">{t('export.blocked')}</p>
      ) : null}

      {downloads.length === 0 ? (
        <p className="empty-state">{t('export.empty')}</p>
      ) : (
        <div className="download-list">
          {downloads.map((artifact) => (
            <article className="download-row" key={artifact.id}>
              <div>
                <h3>{translatedDownloadLabel(artifact, t)}</h3>
                <p>{translatedDownloadDescription(artifact, t)}</p>
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

function translatedDownloadDescription(
  artifact: DownloadArtifact,
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (artifact.id === 'cleaning-plan-json') {
    return t('download.cleaningPlanJsonDescription')
  }

  if (artifact.id === 'summary-report') {
    return t('download.summaryReportDescription')
  }

  const descriptionKeyById: Record<string, string> = {
    'spss18-script': 'download.spssScriptDescription',
    'stata14-script': 'download.stataDoFileDescription',
    'r-script': 'download.rScriptDescription',
    'python-script': 'download.pythonScriptDescription',
  }
  const descriptionKey = descriptionKeyById[artifact.id]

  return descriptionKey ? t(descriptionKey) : artifact.filename
}

function translatedDownloadLabel(
  artifact: DownloadArtifact,
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (artifact.id === 'cleaning-plan-json') {
    return t('download.cleaningPlanJson')
  }

  if (artifact.id === 'summary-report') {
    return t('download.summaryReport')
  }

  const labelKeyById: Record<string, string> = {
    'spss18-script': 'download.spssSyntax',
    'stata14-script': 'download.stataDoFile',
    'r-script': 'download.rScript',
    'python-script': 'download.pythonScript',
  }
  const labelKey = labelKeyById[artifact.id]

  if (labelKey) {
    return t(labelKey)
  }

  const language = artifact.id.replace(/-script$/, '')
  const label = languageLabels[language as keyof typeof languageLabels]

  return label ? t('download.script', { language: label }) : artifact.label
}
