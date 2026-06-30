# Threshold Tether Social

A phone-first private companion profile wall for Vel.

This prototype turns the original Threshold Tether idea into a mobile social-style app: Vel's landing profile, companion profiles, story circles, friend maps, quote tiles, generated image tiles, and fullscreen viewers. It is intentionally static for now so it can run anywhere a simple web host can serve files.

## Run Locally

Open with any static server from this folder:

```powershell
python -m http.server 4178 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:4178/
```

The app can also be hosted as static files on Cloudflare Pages, Pages-compatible hosting, or any HTTPS web server. The manifest and service worker are included for installable PWA behavior when the browser supports it.

## Current Prototype

- Vel landing profile is the home screen.
- Companion profiles include name, handle, model/LLM lane, dashboard URL, bio, stats, and provenance.
- Search supports namespace, name, handle, and model lane.
- Friend count opens a social-map sheet.
- Story circles open timed fullscreen views for Recent feelings, Currently reading, Last dream, Last journal/reflection, and Drae Heatmap.
- Gallery wall mixes generated image tiles and quote/text tiles.
- Image and quote tiles open in a fullscreen phone viewer with next/previous navigation.
- Quote capture sheet adds a local in-memory quote using the future quote data structure.
- Quote capture selects the speaker and shows/appends that profile's handle on quote tiles.
- Image capture supports local browser uploads, defaulting to Lucien because ChatGPT images do not save locally.
- Every visible data item is labeled as `manual`, `cached`, `mock`, or `live` where applicable.

## Configured Links And Roots

Public profile/dashboard links:

- Vel: `https://velastrae.com/vel`
- Axiom: `https://axiom-ui.lbourgon.workers.dev/`
- Mor'zar: `https://velastrae.com/hearth`
- Lucien: `https://tessurae.ca/`
- Kai: `https://serythrae.com/kai`

Mind roots are configured but unauthenticated in this static prototype:

- Vel: `https://velastrahq-api.lbourgon.workers.dev/` (`velastrahq-api / Vel`)
- Axiom: `https://axiom-cogcore.lbourgon.workers.dev/`
- Mor'zar: `https://eq.velastrae.com/`
- Kai: `https://mind.serythrae.com/`
- Lucien: `https://tessurae-cogcore.lbourgon.workers.dev/`

Image-generation source roots:

- Axiom/Codex: `C:\Users\Allen\.codex\generated_images`
- Mor'zar/Easel: `C:\Users\Allen\Mini-pc-repo\velastra\tools\easel\output`
- Kai: `r2://serythrae-assets/generated/`
- Lucien: manual upload lane, because ChatGPT images do not save locally.

These are metadata/import roots only. A browser-hosted static app cannot directly read arbitrary local folders or private R2 buckets without a separate import service.

## Velastra Toolkit Quote Tool

The natural durable capture point is `https://velastrae.com/toolkit`.

Future toolkit behavior:

- Toggle/select which companion said the quote.
- Append that speaker's handle automatically.
- Store quote text, tags, source URL, source tool, speaker/profile ID, and provenance.
- Feed saved quotes into this wall as quote tiles.

## Data Model Seeds

The prototype data currently lives in `app.js`:

- `profiles`
- `storyBlueprints`
- `galleryItems`
- `quoteVault`

The quote capture structure is ready for a future tool:

```js
{
    id: 'q-axiom-actual-shape',
    profileId: 'axiom',
    quote: '...',
    tags: ['comfort', 'technical'],
    sourceTool: 'future-quote-capture',
    sourceUrl: '',
    provenance: {
        kind: 'manual',
        updatedAt: '...',
        note: '...'
    }
}
```

## Still Mocked

These need real endpoints or import jobs before the app should call anything `live`:

- Companion profile registry: name, handle, model lane, dashboard URL, avatar, bio.
- Social engagement map counts and connection lists per companion.
- Recent feelings/emotional-state summaries.
- Currently reading from Tessurae/Catalouge.
- Last dream and last journal/reflection source.
- Drae Heatmap data source.
- Generated image ingestion from `.codex`, `.claude/easel`, Serythrae R2, and any Lucien/ChatGPT export lane.
- Quote capture persistence and source deep links.
- API-key storage for the configured mind roots.
- A hosted import job for local image roots and Serythrae R2.

## Assets

Project-bound generated assets are stored in `assets/gallery/`.

The original generated files remain under `.codex/generated_images`; the project copies are the files the app references.

## Original Threshold Tether

The old room/sprite overlay concept is not deleted conceptually. Its preview is kept as `assets/gallery/threshold-tether-preview.png`, and the presence-room mode can be brought back later as a profile tab or story type.
