import type { DownloadArtifact } from '../state/workflowTypes'

interface DownloadButtonProps {
  artifact: DownloadArtifact
  disabled?: boolean
}

export function DownloadButton({
  artifact,
  disabled = false,
}: DownloadButtonProps) {
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
      Download {artifact.label}
    </button>
  )
}
