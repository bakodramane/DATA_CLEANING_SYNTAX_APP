# Offline Mode

The application is a static Progressive Web App. It does not require a backend
server for the core workflow.

## What Works Offline

After the first successful online load, the following features continue to work
without internet access:

- load the built-in demo household survey dictionary;
- paste a CSV dictionary;
- upload a local CSV or XLSX dictionary;
- review and correct variable types and roles;
- review recommended and blocked cleaning rules;
- generate a Cleaning Plan;
- preview SPSS v18, Stata v14, R, and Python syntax;
- download Cleaning Plan JSON, scripts, and the summary report.

## First Load Requirement

The browser needs one successful online load to install the service worker and
cache the app shell. After that, the service worker can serve the cached app
shell during offline reloads.

## Installation

In a supported browser:

1. Open the app while online.
2. Use the browser install action, often shown in the address bar or browser
   menu.
3. Reopen the installed app later, including when offline.

Browser install prompts vary. Some browsers show an install icon in the address
bar; others expose installation through a menu.

## What Is Cached

The production service worker caches the built app shell and static assets
emitted by Vite, including HTML, JavaScript, CSS, icons, manifest files, and
other bundled assets needed to reopen the app.

## What Is Not Cached

The service worker is not designed to cache user-uploaded dictionaries,
generated Cleaning Plans, generated scripts, or summary reports as network
responses. Downloads are created locally in the browser from the current
in-memory workflow.

## User Data Handling

Uploaded dictionaries and generated outputs stay in the browser. The app does
not upload user dictionaries, Cleaning Plans, generated scripts, or summary
reports to a server. The project has no backend, authentication, telemetry,
analytics, cloud storage, or remote logging.

## Offline Indicator Limitations

The app shows an Online/Offline indicator based on the browser's online status
events. Browser offline status can be imperfect. For example, stopping a local
preview server may prove that the cached app shell reloads, while the browser
still reports the device as online.

## Updates

The service worker is configured for safe automatic update checks. When a new
version is deployed, the browser can download the updated app shell while online
and use it on a later load. Users may need to refresh or reopen the installed
app depending on browser behavior.

## Optional Online Updates

The current release includes only a safe placeholder for future optional
template or rule-pack updates. It does not fetch remote packs, use the GitHub
API, send telemetry, or upload user data. When offline, the app reports that
optional updates are unavailable while core local features continue to work.

## Static Hosting Notes

The production build is emitted to `dist/`. The default Vite base path is
relative (`./`) for static hosting and GitHub Pages subpaths. If a deployment
workflow needs an explicit GitHub Pages base path, set `VITE_BASE_PATH` before
building:

```powershell
$env:VITE_BASE_PATH='/DATA_CLEANING_SYNTAX_APP/'
npm run build
```

## Limitations

- No DDI XML, SPSS `.sav`, or Stata `.dta` metadata import yet.
- No AI-assisted codebook interpretation.
- No backend, authentication, cloud storage, telemetry, or analytics.
- No execution of generated SPSS, Stata, R, or Python scripts.
- Browser support for install prompts and offline indicators varies by
  platform.
