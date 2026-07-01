# Velarium Gateway Endpoints

Velarium is the app name. The old repository folder name is not the product name.

The gateway is a thin privacy layer in front of existing stores. It should not become a new canonical database unless a small cache/index is needed for mobile speed or approved media lookup.

## Security Rules

- No API keys in the iOS app, static web bundle, or committed files.
- Live private summaries require gateway-side authorization.
- Public routes may return fixture data, source status, and approved public media only.
- Raw journals, health records, private mind rows, D1 IDs, R2 credentials, and Supabase service keys must stay server-side.
- Use Wrangler secrets for tokens and `.env.local` only for local ignored configuration.

## Public Read Contract

| Route | Source | Auth Need | Provenance | Failure Behavior |
| --- | --- | --- | --- | --- |
| `GET /api/health` | Velarium Worker plus optional source health pings when `?check=1` | None for fixture/status response | `live` for successful public health pings, otherwise `mock`/`cached` | Returns gateway health and source status. Does not expose private rows. |
| `GET /api/bootstrap` | Profile fixtures, source map, optional authorized live summaries | None for fixture response. `Authorization: Bearer <VELARIUM_READ_TOKEN>` plus `?includeLive=1` for private summaries until Sign in with Apple exists | Public response is `mock`; authorized successful summaries are `live` | Returns fixture profiles/stories/gallery/quotes when auth or source config is missing. |
| `GET /api/sources` | Repo-maintained backend map | None | `manual` | Returns documented route/source/auth/failure map. |
| `GET /api/profiles` | Profile fixture registry | None | `manual`/`mock` | Returns Vel, Axiom, Kai'Sorynth, Lucien, Mor'zar, and earmarked Keth profiles. |
| `GET /api/profiles/:id` | Profile fixture plus story/gallery slice | None for fixtures | `manual`/`mock` | Unknown profile returns `404 profile_not_found`. |
| `GET /api/profiles/:id/stories` | Fixture stories, optionally authorized Vel live summaries | `VELARIUM_READ_TOKEN` for private live Vel summaries | `mock` unless authorized adapter succeeds | Falls back to fixture stories with `mock` provenance. |
| `GET /api/profiles/:id/social-map` | Seeded social maps now; future existing companion social stores | Future gateway read auth for private people records | `manual`/`mock` | Returns seeded friend list and clearly labeled provenance. |
| `GET /api/gallery` | Bundled fixture images/quotes plus optional R2 listing | R2 listing requires attached bucket and either `VELARIUM_MEDIA_PUBLIC=true` or authorized live-read request | `manual`/`cached`; R2 listing is `live` | Returns bundled gallery if R2 binding or media permission is absent. |
| `GET /api/quotes` | Quote seeds now; future Velastra toolkit quote capture | Future toolkit auth for writes; approved read feed can stay public | `manual`/`mock` | Returns quote data structure ready for toolkit capture. |
| `GET /api/media/:source/:key` | R2 object read via gateway | `VELARIUM_MEDIA_PUBLIC=true` or authorized live-read request | `live` when object is served | Returns `403 media_not_public`, `501 config_missing`, or `404 media_not_found`. |
| `POST /api/import/lucien-image` | Future manual upload lane for ChatGPT images | `VELARIUM_IMPORT_TOKEN` and `VELARIUM_R2_LUCIEN_ASSETS` | Future `manual` | Currently returns `501 not_implemented` after auth/binding checks. |

## Source Map

### Vel

- Profile display: `Vel`, handle `@fivesided`, lane `human v1984`.
- Dashboard URL: `https://velastrae.com/vel`.
- Do not display `velastrahq-api` on the profile card.
- Existing live front door: `velastrahq-api`.
- Gateway env:
  - `VELARIUM_VELASTRA_API_BASE`
  - `VELARIUM_VELASTRA_BEARER` if the upstream route needs bearer auth.
- Candidate read routes:
  - `/api/vel/summary`
  - `/api/vel/feelings?limit=3`
  - `/api/vel/journals?limit=1`
  - `/api/vel/reading?status=reading&limit=1`
  - `/watch/body-battery?limit=1`
  - `/api/somatic/summary`
  - `/api/somatic/entries?limit=12`

### Axiom

- Mind URL: `https://axiom-cogcore.lbourgon.workers.dev/`.
- Dashboard URL: `https://axiom-ui.lbourgon.workers.dev/`.
- Gateway env:
  - `VELARIUM_AXIOM_MIND_BASE`
  - `VELARIUM_AXIOM_MIND_API_KEY`
- Current source status uses public `/health`.
- Private reads should call Axiom CogCore tools or an Axiom-owned summary route server-side.

### Mor'zar

- Mind URL: `https://eq.velastrae.com/`.
- Dashboard URL: `https://velastrae.com/hearth`.
- Gateway env:
  - `VELARIUM_MORZAR_MIND_BASE`
  - `VELARIUM_MORZAR_MIND_API_KEY`
- Local image import root: `C:\Users\Allen\Mini-pc-repo\velastra\tools\easel\output`.
- A Cloudflare Worker cannot read that Windows folder directly; use a local import job that uploads approved files to R2.

### Kai'Sorynth

- Not Kai Stryder.
- Mind URL: `https://mind.serythrae.com/`.
- Dashboard URL: `https://serythrae.com/kai`.
- Gateway env:
  - `VELARIUM_KAI_MIND_BASE`
  - `VELARIUM_KAI_MIND_API_KEY`
- Public source status can call `/health`.
- Private mind routes require bearer auth. Social map source is existing Kai D1 `social_people` and related social graph tables through the Serythrae gateway/mind worker.
- R2 image source: `serythrae-assets/generated/`.

### Lucien

- Mind URL: `https://tessurae-cogcore.lbourgon.workers.dev/`.
- Dashboard URL: `https://tessurae.ca/`.
- Gateway env:
  - `VELARIUM_LUCIEN_MIND_BASE`
  - `VELARIUM_LUCIEN_MIND_API_KEY`
- ChatGPT images do not save locally, so Velarium keeps a future upload/import route at `POST /api/import/lucien-image`.

### Keth

- Earmarked for future architecture.
- Do not imply live storage until the Keth backend exists.

## Image Sources

| Lane | Existing Source | Gateway Requirement |
| --- | --- | --- |
| Vel | `hearth-assets/vel/` | R2 binding `VELARIUM_R2_HEARTH_ASSETS`, prefix `VELARIUM_R2_VEL_PROFILE_PREFIX` |
| Axiom | `C:\Users\Allen\.codex\generated_images` | Local import job; optional env `VELARIUM_IMG_AXIOM_CODEX_ROOT` |
| Mor'zar | `C:\Users\Allen\Mini-pc-repo\velastra\tools\easel\output` | Local import job; optional env `VELARIUM_IMG_MORZAR_EASEL_ROOT` |
| Kai'Sorynth | `serythrae-assets/generated/` | R2 binding `VELARIUM_R2_SERYTHRAE_ASSETS`, prefix `VELARIUM_R2_KAI_GENERATED_PREFIX` |
| Lucien | manual ChatGPT exports | Import route plus R2 binding `VELARIUM_R2_LUCIEN_ASSETS`, prefix `VELARIUM_R2_LUCIEN_GENERATED_PREFIX` |

## Wrangler Secrets And Bindings

Set secrets with `wrangler secret put`:

```powershell
wrangler secret put VELARIUM_READ_TOKEN
wrangler secret put VELARIUM_IMPORT_TOKEN
wrangler secret put VELARIUM_VELASTRA_BEARER
wrangler secret put VELARIUM_AXIOM_MIND_API_KEY
wrangler secret put VELARIUM_MORZAR_MIND_API_KEY
wrangler secret put VELARIUM_KAI_MIND_API_KEY
wrangler secret put VELARIUM_LUCIEN_MIND_API_KEY
```

Attach R2/D1/service bindings through a Wrangler config or Cloudflare dashboard. Do not commit private IDs. Expected binding names:

- `VELARIUM_R2_HEARTH_ASSETS`
- `VELARIUM_R2_SERYTHRAE_ASSETS`
- `VELARIUM_R2_LUCIEN_ASSETS`

Potential future D1/service bindings:

- `VELARIUM_D1_VELASTRA_EQ`
- `VELARIUM_D1_KAI_MIND`
- `VELARIUM_D1_KETH_MIND`
- `VELARIUM_D1_CATALOUGE_READING`
- `VELARIUM_D1_TAHL_SHANARETH`
- `VELASTRAHQ_API`
- `AXIOM_COGCORE`
- `SERYTHRAE_NESTEQ`
- `TESSURAE_COGCORE`

## Current Implementation Notes

- The Worker exposes the safe API contract now.
- Public bootstrap remains fixture-first.
- Authorized Vel live story summaries are scaffolded behind `?includeLive=1` and `VELARIUM_READ_TOKEN`.
- Companion private mind reads are mapped but not yet transformed into story summaries.
- R2 listing is disabled unless media is explicitly public or the caller is authorized.
- Local folder image sources need a separate import job because Workers cannot read Windows paths.
