import { translateKnownMessage } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'

interface WarningListProps {
  title?: string
  messages: string[]
}

export function WarningList({ title, messages }: WarningListProps) {
  const { language, t } = useI18n()
  const resolvedTitle = title ?? t('common.warnings')

  if (messages.length === 0) {
    return null
  }

  return (
    <section className="warning-list" aria-label={resolvedTitle}>
      <h3>{resolvedTitle}</h3>
      <ul>
        {messages.map((message) => (
          <li key={message}>{translateKnownMessage(language, message)}</li>
        ))}
      </ul>
    </section>
  )
}
