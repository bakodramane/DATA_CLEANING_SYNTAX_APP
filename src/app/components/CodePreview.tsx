import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'

interface CodePreviewProps {
  content: string
  label: string
}

export function CodePreview({ content, label }: CodePreviewProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const copyContent = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="code-preview">
      <div className="code-preview-toolbar">
        <span>{label}</span>
        <button
          className="secondary-button"
          type="button"
          onClick={copyContent}
        >
          {copied ? t('common.copied') : t('common.copy')}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{content}</code>
      </pre>
    </div>
  )
}
