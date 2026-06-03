import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSelector } from './LanguageSelector'
import { OfflineStatusIndicator } from './OfflineStatusIndicator'
import { Stepper } from './Stepper'
import type { WorkflowStep, WorkflowStepId } from '../state/workflowTypes'

interface LayoutProps {
  activeStep: WorkflowStepId
  completedSteps: WorkflowStepId[]
  steps: WorkflowStep[]
  onSelectStep: (step: WorkflowStepId) => void
  children: ReactNode
}

export function Layout({
  activeStep,
  completedSteps,
  steps,
  onSelectStep,
  children,
}: LayoutProps) {
  const { t } = useI18n()

  return (
    <main className="app-shell">
      <header className="topbar" aria-label={t('app.title')}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            DC
          </span>
          <div>
            <p className="eyebrow">{t('app.subtitle')}</p>
            <h1>{t('app.title')}</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <LanguageSelector />
          <span className="status-pill">{t('app.offlineFirst')}</span>
        </div>
      </header>

      <Stepper
        activeStep={activeStep}
        completedSteps={completedSteps}
        steps={steps}
        onSelectStep={onSelectStep}
      />

      <OfflineStatusIndicator />

      <section className="step-panel">{children}</section>
    </main>
  )
}
