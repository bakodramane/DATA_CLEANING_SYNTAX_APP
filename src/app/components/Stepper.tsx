import { useI18n } from '../../i18n/useI18n'
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
  const { t } = useI18n()

  return (
    <nav className="stepper" aria-label={t('workflow.aria')}>
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
            <span>{t(`workflow.${step.id}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}
