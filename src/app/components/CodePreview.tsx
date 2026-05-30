import { useState } from 'react'

interface CodePreviewProps {
  content: string
  label: string
}

export function CodePreview({ content, label }: CodePreviewProps) {
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
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{content}</code>
      </pre>
    </div>
  )
}
