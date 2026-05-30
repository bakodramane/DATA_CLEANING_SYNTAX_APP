import { useMemo, useState } from 'react'
import type { TargetLanguage, ValidationResult } from '../../core'
import { languageLabels, scriptExtensions } from '../state/appState'
import type {
  DownloadArtifact,
  RenderedScriptsByLanguage,
} from '../state/workflowTypes'
import { CodePreview } from './CodePreview'
import { DownloadButton } from './DownloadButton'
import { HelpText } from './HelpText'
import { WarningList } from './WarningList'

interface SyntaxPreviewStepProps {
  targetLanguages: TargetLanguage[]
  renderedScripts: RenderedScriptsByLanguage
  validation?: ValidationResult
  downloads: DownloadArtifact[]
}

export function SyntaxPreviewStep({
  targetLanguages,
  renderedScripts,
  validation,
  downloads,
}: SyntaxPreviewStepProps) {
  const [activeLanguage, setActiveLanguage] = useState<TargetLanguage>(
    targetLanguages[0] ?? 'r',
  )
  const availableLanguages: TargetLanguage[] =
    targetLanguages.length > 0 ? targetLanguages : ['r']
  const activeScript =
    renderedScripts[activeLanguage] ?? renderedScripts[availableLanguages[0]]
  const scriptDownload = useMemo(
    () =>
      downloads.find(
        (artifact) =>
          artifact.id === `${activeScript?.language ?? activeLanguage}-script`,
      ),
    [activeLanguage, activeScript?.language, downloads],
  )

  if (!validation?.valid) {
    return (
      <div className="step-content">
        <div className="step-heading">
          <p className="eyebrow">Step 6</p>
          <h2>Syntax preview</h2>
        </div>
        <p className="empty-state">
          Resolve Cleaning Plan validation errors before exporting syntax.
        </p>
      </div>
    )
  }

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">Step 6</p>
        <h2>Syntax preview</h2>
        <HelpText>
          Each script is generated from the same Cleaning Plan. Review warnings
          before using any syntax in production.
        </HelpText>
      </div>

      <div className="tab-row" role="tablist" aria-label="Syntax languages">
        {availableLanguages.map((language) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeLanguage === language}
            className="tab-button"
            data-active={activeLanguage === language}
            key={language}
            onClick={() => setActiveLanguage(language)}
          >
            {languageLabels[language]}
          </button>
        ))}
      </div>

      {activeScript ? (
        <>
          <section className="script-meta">
            <span>Filename: {activeScript.filename}</span>
            <span>Extension: .{scriptExtensions[activeLanguage]}</span>
          </section>
          <WarningList
            title="Renderer warnings"
            messages={[
              ...activeScript.warnings,
              ...activeScript.unsupportedSteps.map(
                (step) => `${step.id}: ${step.reason}`,
              ),
            ]}
          />
          <CodePreview
            label={`${languageLabels[activeLanguage]} generated script`}
            content={activeScript.content}
          />
          {scriptDownload ? <DownloadButton artifact={scriptDownload} /> : null}
        </>
      ) : (
        <p className="empty-state">No script has been generated yet.</p>
      )}
    </div>
  )
}
