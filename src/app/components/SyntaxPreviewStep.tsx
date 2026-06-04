import { useMemo, useState } from 'react'
import type { TargetLanguage, ValidationResult } from '../../core'
import { useI18n } from '../../i18n/useI18n'
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
  const { t } = useI18n()
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

  if (!validation) {
    return (
      <div className="step-content">
        <div className="step-heading">
          <p className="eyebrow">{t('workflow.step', { number: 6 })}</p>
          <h2>{t('syntax.title')}</h2>
          <HelpText>{t('syntax.help')}</HelpText>
        </div>
        <p className="empty-state">{t('syntax.empty')}</p>
      </div>
    )
  }

  if (!validation.valid) {
    return (
      <div className="step-content">
        <div className="step-heading">
          <p className="eyebrow">{t('workflow.step', { number: 6 })}</p>
          <h2>{t('syntax.title')}</h2>
          <HelpText>{t('syntax.help')}</HelpText>
        </div>
        <p className="empty-state">{t('syntax.invalid')}</p>
      </div>
    )
  }

  return (
    <div className="step-content">
      <div className="step-heading">
        <p className="eyebrow">{t('workflow.step', { number: 6 })}</p>
        <h2>{t('syntax.title')}</h2>
        <HelpText>{t('syntax.help')}</HelpText>
      </div>

      <div
        className="tab-row"
        role="tablist"
        aria-label={t('syntax.languages')}
      >
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
            <span>
              {t('common.filename')}: {activeScript.filename}
            </span>
            <span>
              {t('common.extension')}: .{scriptExtensions[activeLanguage]}
            </span>
          </section>
          <WarningList
            title={t('syntax.rendererWarnings')}
            emptyMessage={t('syntax.noRendererWarnings')}
            messages={[
              ...activeScript.warnings,
              ...activeScript.unsupportedSteps.map(
                (step) => `${step.id}: ${step.reason}`,
              ),
            ]}
          />
          <CodePreview
            label={t('syntax.generatedScript', {
              language: languageLabels[activeLanguage],
            })}
            content={activeScript.content}
          />
          {scriptDownload ? <DownloadButton artifact={scriptDownload} /> : null}
        </>
      ) : (
        <p className="empty-state">{t('syntax.empty')}</p>
      )}
    </div>
  )
}
