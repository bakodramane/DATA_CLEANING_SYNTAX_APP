export const corePackage = {
  name: 'Survey Microdata Cleaning Syntax Generator Core',
  phase: 'phase-1',
  offlineFirst: true,
} as const

export * from './cleaning-plan'
export * from './fixtures'
export * from './models'
export * from './validation'
