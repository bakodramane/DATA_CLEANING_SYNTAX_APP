import { translateKnownMessage } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'

interface WarningListProps {
  title?: string
  emptyMessage?: string
  messages: string[]
  tone?: 'warning' | 'error'
}

export function WarningList({
  title,
  emptyMessage,
  messages,
  tone = 'warning',
}: WarningListProps) {
  const { language, t } = useI18n()
  const resolvedTitle = title ?? t('common.warnings')

  if (messages.length === 0 && !emptyMessage) {
    return null
  }

  return (
    <section
      className="warning-list"
      data-empty={messages.length === 0}
      data-tone={tone}
      aria-label={resolvedTitle}
    >
      <h3>{resolvedTitle}</h3>
      {messages.length > 0 ? (
        <ul>
          {messages.map((message) => (
            <li key={message}>{translateKnownMessage(language, message)}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </section>
  )
}
