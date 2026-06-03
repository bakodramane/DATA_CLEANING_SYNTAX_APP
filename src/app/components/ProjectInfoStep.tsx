import type { TargetLanguage } from '../../core'
import { useI18n } from '../../i18n/useI18n'
import { languageLabels } from '../state/appState'
import type { ProjectMetadata } from '../state/workflowTypes'
import { HelpText } from './HelpText'

interface ProjectInfoStepProps {
  project: ProjectMetadata
  onChange: (project: ProjectMetadata) => void
}

export function ProjectInfoStep({ project, onChange }: ProjectInfoStepProps) {
  const { t } = useI18n()
  const updateField = (field: keyof ProjectMetadata, value: string) => {
    onChange({ ...project, [field]: value })
  }

  const toggleLanguage = (language: TargetLanguage, selected: boolean) => {
    const targetLanguages = selected
      ? [...project.targetLanguages, language]
      : project.targetLanguages.filter((candidate) => candidate !== language)

    onChange({ ...project, targetLanguages })
  }

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 1 })}</p>
        <h2>{t('project.title')}</h2>
        <HelpText>{t('project.help')}</HelpText>
      </div>

      <div className="form-grid">
        <label>
          <span>{t('project.surveyName')}</span>
          <input
            value={project.surveyName}
            onChange={(event) => updateField('surveyName', event.target.value)}
          />
        </label>
        <label>
          <span>{t('project.country')}</span>
          <input
            value={project.countryOrOrganisation}
            onChange={(event) =>
              updateField('countryOrOrganisation', event.target.value)
            }
          />
        </label>
        <label>
          <span>{t('project.year')}</span>
          <input
            value={project.surveyYear}
            onChange={(event) => updateField('surveyYear', event.target.value)}
          />
        </label>
        <label className="wide-field">
          <span>{t('project.notes')}</span>
          <textarea
            rows={4}
            value={project.notes}
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </label>
      </div>

      <fieldset className="language-selector">
        <legend>{t('project.targetLanguages')}</legend>
        {(Object.keys(languageLabels) as TargetLanguage[]).map((language) => (
          <label className="checkbox-row" key={language}>
            <input
              type="checkbox"
              checked={project.targetLanguages.includes(language)}
              onChange={(event) =>
                toggleLanguage(language, event.target.checked)
              }
            />
            <span>{languageLabels[language]}</span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}
