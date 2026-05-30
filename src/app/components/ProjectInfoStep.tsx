import type { TargetLanguage } from '../../core'
import { languageLabels } from '../state/appState'
import type { ProjectMetadata } from '../state/workflowTypes'
import { HelpText } from './HelpText'

interface ProjectInfoStepProps {
  project: ProjectMetadata
  onChange: (project: ProjectMetadata) => void
}

export function ProjectInfoStep({ project, onChange }: ProjectInfoStepProps) {
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
        <p className="eyebrow">Step 1</p>
        <h2>Project information</h2>
        <HelpText>
          These details appear in the Cleaning Plan, generated scripts, and
          summary report.
        </HelpText>
      </div>

      <div className="form-grid">
        <label>
          <span>Survey or project name</span>
          <input
            value={project.surveyName}
            onChange={(event) => updateField('surveyName', event.target.value)}
          />
        </label>
        <label>
          <span>Country or organisation</span>
          <input
            value={project.countryOrOrganisation}
            onChange={(event) =>
              updateField('countryOrOrganisation', event.target.value)
            }
          />
        </label>
        <label>
          <span>Survey year</span>
          <input
            value={project.surveyYear}
            onChange={(event) => updateField('surveyYear', event.target.value)}
          />
        </label>
        <label className="wide-field">
          <span>Project notes</span>
          <textarea
            rows={4}
            value={project.notes}
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </label>
      </div>

      <fieldset className="language-selector">
        <legend>Target syntax languages</legend>
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
