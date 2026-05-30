interface WarningListProps {
  title?: string
  messages: string[]
}

export function WarningList({
  title = 'Warnings',
  messages,
}: WarningListProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <section className="warning-list" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  )
}
