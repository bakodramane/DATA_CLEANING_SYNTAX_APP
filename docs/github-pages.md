# GitHub Pages Deployment

The app is a static Vite build and can be hosted on GitHub Pages.

## Build Output

Production files are emitted to:

```text
dist/
```

The build includes:

- `index.html`;
- hashed JavaScript and CSS assets;
- `manifest.webmanifest`;
- `sw.js`;
- Workbox service-worker assets;
- icons and favicon files.

## Base Path

The current Vite configuration uses:

```ts
base: process.env.VITE_BASE_PATH ?? './'
```

The relative default (`./`) is safe for GitHub Pages subpath deployments such as:

```text
https://<user>.github.io/DATA_CLEANING_SYNTAX_APP/
```

If a deployment needs an explicit base path, set `VITE_BASE_PATH` before
building:

```powershell
$env:VITE_BASE_PATH='/DATA_CLEANING_SYNTAX_APP/'
npm run build
```

## Repository Setup

In GitHub:

1. Open repository settings.
2. Go to **Pages**.
3. Set the source to **GitHub Actions**.
4. Run the manual **Deploy GitHub Pages** workflow from the Actions tab.

## Workflow

The optional Pages workflow is manual (`workflow_dispatch`) so a normal push to
`main` does not deploy automatically. It builds the app with `npm ci` and
`npm run build`, uploads `dist/`, and deploys it using the standard GitHub Pages
actions.

No repository secrets are required. The workflow uses the default GitHub token
with `pages: write` and `id-token: write` permissions for deployment. The app is
static and does not upload user dictionaries, generated scripts, or other user
data during deployment.

The workflow has not been run as part of Phase 9. To deploy, run **Deploy GitHub
Pages** manually from the Actions tab after enabling GitHub Pages with **GitHub
Actions** as the source.

## Release Reminder

Before running a public deployment:

- complete the release checklist;
- verify the production preview locally;
- confirm offline reload after first load;
- confirm generated downloads still work;
- verify remaining references marked `NEEDS_VERIFICATION` are acceptable for the
  release context.
