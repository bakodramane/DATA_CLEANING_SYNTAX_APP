import type { ReactNode } from 'react'

interface HelpTextProps {
  children: ReactNode
}

export function HelpText({ children }: HelpTextProps) {
  return <p className="help-text">{children}</p>
}
