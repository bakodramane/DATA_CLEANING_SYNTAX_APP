import type { Citation } from '../core'
import { loadDefaultCitations } from './defaultRules'

export function getDefaultRuleCitations(): Citation[] {
  return loadDefaultCitations()
}

export function getCitationsForKeys(
  citationKeys: string[],
  citations: Citation[] = loadDefaultCitations(),
): Citation[] {
  const requestedKeys = new Set(citationKeys)

  return citations.filter((citation) => requestedKeys.has(citation.key))
}
