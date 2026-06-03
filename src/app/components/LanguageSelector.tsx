import { availableLanguages, type LanguageCode } from '../../i18n'
import { useI18n } from '../../i18n/useI18n'

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()

  return (
    <label className="ui-language-selector">
      <span>{t('app.language')}</span>
      <select
        aria-label={t('app.languageSelector')}
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      >
        {availableLanguages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
