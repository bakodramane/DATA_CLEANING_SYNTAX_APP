import type { ReactNode } from 'react'
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
  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Application header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            DC
          </span>
          <div>
            <p className="eyebrow">Survey data-cleaning workflow</p>
            <h1>Cleaning Syntax Generator</h1>
          </div>
        </div>
        <span className="status-pill">Phase 6 wizard</span>
      </header>

      <Stepper
        activeStep={activeStep}
        completedSteps={completedSteps}
        steps={steps}
        onSelectStep={onSelectStep}
      />

      <section className="step-panel">{children}</section>
    </main>
  )
}
