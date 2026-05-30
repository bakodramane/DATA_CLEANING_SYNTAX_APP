import type { WorkflowStep, WorkflowStepId } from '../state/workflowTypes'

interface StepperProps {
  steps: WorkflowStep[]
  activeStep: WorkflowStepId
  completedSteps: WorkflowStepId[]
  onSelectStep: (step: WorkflowStepId) => void
}

export function Stepper({
  steps,
  activeStep,
  completedSteps,
  onSelectStep,
}: StepperProps) {
  return (
    <nav className="stepper" aria-label="Workflow steps">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep
        const isComplete = completedSteps.includes(step.id)

        return (
          <button
            type="button"
            className="stepper-button"
            aria-current={isActive ? 'step' : undefined}
            data-active={isActive}
            data-complete={isComplete}
            key={step.id}
            onClick={() => onSelectStep(step.id)}
          >
            <span className="stepper-number">{index + 1}</span>
            <span>{step.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
