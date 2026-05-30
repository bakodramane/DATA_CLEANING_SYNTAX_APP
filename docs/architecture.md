# Architecture

The application is a local-first static Progressive Web App built with React,
Vite, and TypeScript.

The intended flow is:

```text
metadata importers
        |
variable model
        |
Cleaning Plan builder
        |
rule library
        |
language-specific renderers
        |
SPSS / Stata / R / Python scripts
```

The Cleaning Plan is the central abstraction. The core package must not depend
on the UI, network services, telemetry, or hosted storage.

## Static PWA Shell

The production build is emitted to `dist/` by Vite. Phase 7 uses
`vite-plugin-pwa` to generate:

- `manifest.webmanifest` for installability metadata;
- `sw.js` and Workbox assets for offline app-shell caching;
- relative static asset paths so GitHub Pages subpath deployments can be
  supported.

The service worker precaches the built app shell and static assets. User uploads
and generated downloads are handled in browser memory and are not remote
network requests, so they are not cached as server responses.

For GitHub Pages, the default Vite base is relative (`./`). If a deployment
workflow needs an explicit base path, set `VITE_BASE_PATH` during build, for
example:

```powershell
$env:VITE_BASE_PATH='/DATA_CLEANING_SYNTAX_APP/'
npm run build
```

No backend, authentication, telemetry, analytics, cloud storage, or script
execution service is part of the architecture.
