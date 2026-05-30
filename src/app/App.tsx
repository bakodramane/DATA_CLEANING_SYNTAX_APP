import './App.css'

const workflowSteps = [
  'Import metadata',
  'Review variables',
  'Build cleaning plan',
  'Render syntax',
] as const

const targetLanguages = ['SPSS v18', 'Stata v14', 'R', 'Python'] as const

function App() {
  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Application header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            DC
          </span>
          <div>
            <p className="eyebrow">Open-source survey tooling</p>
            <h1>Survey Microdata Cleaning Syntax Generator</h1>
          </div>
        </div>
        <span className="status-pill">Phase 0 scaffold</span>
      </header>

      <section className="workspace" aria-label="Workspace overview">
        <div className="workspace-main">
          <p className="section-label">Repository foundation</p>
          <h2>Offline-first app shell for transparent syntax generation</h2>
          <p className="workspace-copy">
            The project is ready for the core Cleaning Plan model, editable rule
            library, and version-aware renderers in later phases.
          </p>
        </div>

        <aside className="language-panel" aria-label="Target syntax languages">
          {targetLanguages.map((language) => (
            <span className="language-chip" key={language}>
              {language}
            </span>
          ))}
        </aside>
      </section>

      <section className="workflow-grid" aria-label="Workflow checkpoints">
        {workflowSteps.map((step, index) => (
          <article className="workflow-card" key={step}>
            <span className="workflow-number">{index + 1}</span>
            <h3>{step}</h3>
            <p>Planned</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
