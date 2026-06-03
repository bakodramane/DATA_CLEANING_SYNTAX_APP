import { useI18n } from '../../i18n/useI18n'
import { languageLabels } from '../state/appState'
import type { DownloadArtifact } from '../state/workflowTypes'

interface DownloadButtonProps {
  artifact: DownloadArtifact
  disabled?: boolean
}

export function DownloadButton({
  artifact,
  disabled = false,
}: DownloadButtonProps) {
  const { t } = useI18n()
  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: artifact.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = artifact.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      className="secondary-button"
      type="button"
      onClick={handleDownload}
      disabled={disabled}
    >
      {t('common.download')} {translatedDownloadLabel(artifact, t)}
    </button>
  )
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

  const language = artifact.id.replace(/-script$/, '')
  const label = languageLabels[language as keyof typeof languageLabels]

  return label ? t('download.script', { language: label }) : artifact.label
}
