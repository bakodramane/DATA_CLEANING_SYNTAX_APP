export const CITATION_SOURCE_TYPES = [
  'book',
  'journal_article',
  'official_guidance',
  'software_documentation',
  'working_paper',
  'website',
  'other',
] as const

export type CitationSourceType = (typeof CITATION_SOURCE_TYPES)[number]

export interface Citation {
  key: string
  title: string
  authorOrOrganisation: string
  year: number | string
  sourceType: CitationSourceType
  url?: string
  doi?: string
  note?: string
}
