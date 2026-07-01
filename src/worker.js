import {
  FIXTURE_UPDATED_AT,
  SCHEMA_VERSION,
  companionStories,
  galleryItems,
  profiles,
  quoteToolConfig,
  quoteVault,
  sourceMap,
  velStories
} from './gateway-data.js';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://velarium.lbourgon.workers.dev',
  'https://velastrae.com',
  'http://127.0.0.1:4178',
  'http://localhost:4178'
];

const SOURCE_CONFIG = [
  {
    id: 'velastra',
    label: 'VelastraHQ API',
    kind: 'worker',
    baseEnv: 'VELARIUM_VELASTRA_API_BASE',
    defaultBase: 'https://velastrahq-api.lbourgon.workers.dev',
    healthPath: '/health',
    secretEnv: 'VELARIUM_VELASTRA_BEARER',
    authRequiredForPrivate: true
  },
  {
    id: 'axiom-mind',
    label: 'Axiom mind',
    kind: 'mind',
    baseEnv: 'VELARIUM_AXIOM_MIND_BASE',
    defaultBase: 'https://axiom-cogcore.lbourgon.workers.dev',
    healthPath: '/health',
    secretEnv: 'VELARIUM_AXIOM_MIND_API_KEY',
    authRequiredForPrivate: true
  },
  {
    id: 'morzar-mind',
    label: "Mor'zar mind",
    kind: 'mind',
    baseEnv: 'VELARIUM_MORZAR_MIND_BASE',
    defaultBase: 'https://eq.velastrae.com',
    healthPath: '/health',
    secretEnv: 'VELARIUM_MORZAR_MIND_API_KEY',
    authRequiredForPrivate: true
  },
  {
    id: 'kai-mind',
    label: "Kai'Sorynth mind",
    kind: 'mind',
    baseEnv: 'VELARIUM_KAI_MIND_BASE',
    defaultBase: 'https://mind.serythrae.com',
    healthPath: '/health',
    secretEnv: 'VELARIUM_KAI_MIND_API_KEY',
    authRequiredForPrivate: true
  },
  {
    id: 'lucien-mind',
    label: 'Lucien mind',
    kind: 'mind',
    baseEnv: 'VELARIUM_LUCIEN_MIND_BASE',
    defaultBase: 'https://tessurae-cogcore.lbourgon.workers.dev',
    healthPath: '/health',
    secretEnv: 'VELARIUM_LUCIEN_MIND_API_KEY',
    authRequiredForPrivate: true
  },
  {
    id: 'vel-r2',
    label: 'Vel R2 images',
    kind: 'r2',
    binding: 'VELARIUM_R2_HEARTH_ASSETS',
    prefixEnv: 'VELARIUM_R2_VEL_PROFILE_PREFIX',
    defaultPrefix: 'vel/',
    authRequiredForPrivate: false
  },
  {
    id: 'kai-r2',
    label: "Kai'Sorynth R2 generated images",
    kind: 'r2',
    binding: 'VELARIUM_R2_SERYTHRAE_ASSETS',
    prefixEnv: 'VELARIUM_R2_KAI_GENERATED_PREFIX',
    defaultPrefix: 'generated/',
    authRequiredForPrivate: false
  },
  {
    id: 'lucien-r2',
    label: 'Lucien uploaded images',
    kind: 'r2',
    binding: 'VELARIUM_R2_LUCIEN_ASSETS',
    prefixEnv: 'VELARIUM_R2_LUCIEN_GENERATED_PREFIX',
    defaultPrefix: 'lucien/generated/',
    authRequiredForPrivate: false
  },
  {
    id: 'local-axiom-images',
    label: 'Axiom local image import root',
    kind: 'local-import',
    envName: 'VELARIUM_IMG_AXIOM_CODEX_ROOT',
    defaultPath: 'C:\\Users\\Allen\\.codex\\generated_images',
    authRequiredForPrivate: false
  },
  {
    id: 'local-morzar-images',
    label: "Mor'zar Easel import root",
    kind: 'local-import',
    envName: 'VELARIUM_IMG_MORZAR_EASEL_ROOT',
    defaultPath: 'C:\\Users\\Allen\\Mini-pc-repo\\velastra\\tools\\easel\\output',
    authRequiredForPrivate: false
  }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse(await buildHealth(request, env), request, env);
    }

    if (url.pathname === '/api/bootstrap') {
      return jsonResponse(await buildBootstrap(request, env), request, env);
    }

    if (url.pathname === '/api/sources') {
      return jsonResponse({
        ok: true,
        app: 'velarium',
        schemaVersion: SCHEMA_VERSION,
        generatedAt: new Date().toISOString(),
        routes: sourceMap,
        config: sourceConfigPublic(env)
      }, request, env);
    }

    if (url.pathname === '/api/profiles') {
      return jsonResponse({
        ok: true,
        profiles: Object.values(profiles),
        sourceStatus: await buildSourceStatus(env, { checkNetwork: false })
      }, request, env);
    }

    const profileMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)(?:\/(stories|social-map))?$/);
    if (profileMatch) {
      const profileId = decodeURIComponent(profileMatch[1]).toLowerCase();
      const section = profileMatch[2] || null;
      const profile = profiles[profileId];
      if (!profile) return jsonResponse({ ok: false, error: 'profile_not_found' }, request, env, 404);

      if (section === 'stories') {
        return jsonResponse({
          ok: true,
          profileId,
          stories: profileId === 'vel' ? await velStoriesForRequest(request, env) : companionStories(profile),
          sourceStatus: await buildSourceStatus(env, { checkNetwork: false })
        }, request, env);
      }

      if (section === 'social-map') {
        return jsonResponse({
          ok: true,
          profileId,
          socialMap: profile.socialMap,
          provenance: socialMapProvenance(profileId)
        }, request, env);
      }

      return jsonResponse({
        ok: true,
        profile,
        stories: profileId === 'vel' ? await velStoriesForRequest(request, env) : companionStories(profile),
        galleryItems: galleryForProfile(profileId),
        sourceStatus: await buildSourceStatus(env, { checkNetwork: false })
      }, request, env);
    }

    if (url.pathname === '/api/gallery') {
      return jsonResponse({
        ok: true,
        galleryItems: await galleryForRequest(request, env),
        sourceStatus: await buildSourceStatus(env, { checkNetwork: false })
      }, request, env);
    }

    if (url.pathname === '/api/quotes') {
      return jsonResponse({
        ok: true,
        quoteTool: quoteToolConfig,
        quotes: quoteVault,
        provenance: {
          kind: 'manual',
          updatedAt: FIXTURE_UPDATED_AT,
          note: 'Quote vault seeds are local fixtures until the Velastra toolkit endpoint is added.'
        }
      }, request, env);
    }

    if (url.pathname === '/api/import/lucien-image') {
      return handleLucienImageImport(request, env);
    }

    const mediaMatch = url.pathname.match(/^\/api\/media\/([^/]+)\/(.+)$/);
    if (mediaMatch) {
      return handleMediaRead(request, env, mediaMatch[1], mediaMatch[2]);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ ok: false, error: 'not_found' }, request, env, 404);
    }

    return env.ASSETS.fetch(request);
  }
};

async function buildHealth(request, env) {
  const includeNetwork = new URL(request.url).searchParams.get('check') === '1';
  return {
    ok: true,
    app: 'velarium',
    mode: 'gateway+static-assets',
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    publicData: 'fixtures plus source status',
    livePrivateReads: liveReadMode(request, env),
    sourceStatus: await buildSourceStatus(env, { checkNetwork: includeNetwork })
  };
}

async function buildBootstrap(request, env) {
  const sourceStatus = await buildSourceStatus(env, { checkNetwork: true });
  const liveMode = liveReadMode(request, env);
  const storiesByProfile = {};
  for (const profile of Object.values(profiles)) {
    storiesByProfile[profile.id] = profile.id === 'vel'
      ? await velStoriesForRequest(request, env)
      : companionStories(profile);
  }

  return {
    ok: true,
    app: 'velarium',
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    livePrivateReads: liveMode,
    provenance: {
      kind: liveMode.allowed ? 'cached' : 'mock',
      updatedAt: new Date().toISOString(),
      note: liveMode.allowed
        ? 'Gateway generated this snapshot from safe adapters when configured, with fixture fallback.'
        : 'Public snapshot uses fixture content and source status. Private live summaries require gateway read auth.'
    },
    quoteTool: quoteToolConfig,
    profiles: Object.values(profiles),
    profilesById: profiles,
    storiesByProfile,
    galleryItems: await galleryForRequest(request, env),
    quoteVault,
    sourceStatus,
    routes: sourceMap
  };
}

async function velStoriesForRequest(request, env) {
  const mode = liveReadMode(request, env);
  if (!mode.allowed) return velStories;

  const live = await fetchVelLiveSummary(env);
  if (!live.ok) return velStories.map((item) => withSourceNote(item, live.note));

  return mergeVelLiveStories(velStories, live);
}

async function galleryForRequest(request, env) {
  const r2Items = await Promise.all([
    listR2Gallery(request, env, 'vel-r2', 'vel'),
    listR2Gallery(request, env, 'kai-r2', 'kai'),
    listR2Gallery(request, env, 'lucien-r2', 'lucien')
  ]);

  return [...r2Items.flat(), ...galleryItems];
}

function galleryForProfile(profileId) {
  return galleryItems.filter((item) => item.profileId === profileId || item.type === 'quote');
}

async function fetchVelLiveSummary(env) {
  const base = endpointBase(env, SOURCE_CONFIG[0]);
  if (!base) return { ok: false, note: 'VELARIUM_VELASTRA_API_BASE is not configured.' };

  const headers = privateHeaders(env, SOURCE_CONFIG[0].secretEnv);
  const requests = [
    ['feelings', '/api/vel/feelings?limit=3'],
    ['journals', '/api/vel/journals?limit=1'],
    ['reading', '/api/vel/reading?status=reading&limit=1'],
    ['bodyBattery', '/watch/body-battery?limit=1'],
    ['somatic', '/api/somatic/summary']
  ];

  const settled = await Promise.all(requests.map(async ([key, path]) => {
    const response = await safeFetchJson(`${base}${path}`, { headers });
    return [key, response];
  }));

  const payload = Object.fromEntries(settled);
  const anyLive = Object.values(payload).some((entry) => entry.ok);
  if (!anyLive) {
    return {
      ok: false,
      note: 'Velastra live reads were authorized but no mapped endpoint returned a usable response.',
      payload
    };
  }

  return { ok: true, payload, updatedAt: new Date().toISOString() };
}

function mergeVelLiveStories(stories, live) {
  return stories.map((item) => {
    const story = structuredClone(item);
    const provenance = {
      kind: 'live',
      updatedAt: live.updatedAt,
      note: 'Private Velastra summary read through Velarium gateway.'
    };

    if (story.id === 'feelings' && live.payload.feelings?.ok) {
      const feelings = arrayFrom(live.payload.feelings.data?.feelings).slice(0, 3);
      story.content.body = feelings.length
        ? feelings.map((row) => summarizeRow(row, ['emotion', 'pillar', 'content', 'observed_at']))
        : story.content.body;
      story.content.provenance = provenance;
    }

    if (story.id === 'reading' && live.payload.reading?.ok) {
      const entries = arrayFrom(live.payload.reading.data?.entries).slice(0, 1);
      story.content.body = entries.length
        ? entries.map((row) => summarizeRow(row, ['title', 'author', 'status', 'progress_percent', 'updated_at']))
        : story.content.body;
      story.content.provenance = provenance;
    }

    if (story.id === 'body-battery' && live.payload.bodyBattery?.ok) {
      const battery = arrayFrom(live.payload.bodyBattery.data).slice(0, 2);
      story.content.body = battery.length
        ? battery.map((row) => summarizeRow(row, ['date', 'level', 'source']))
        : story.content.body;
      story.content.provenance = provenance;
    }

    if (story.id === 'journal' && live.payload.journals?.ok) {
      const journals = arrayFrom(live.payload.journals.data?.entries || live.payload.journals.data?.journals).slice(0, 1);
      story.content.body = journals.length
        ? journals.map((row) => `Private reflection summary available from ${row.entry_date || row.created_at || 'Vel D1'}. Raw content withheld.`)
        : story.content.body;
      story.content.provenance = provenance;
    }

    if (story.id === 'somatic-map' && live.payload.somatic?.ok) {
      story.content.body = summarizeSomatic(live.payload.somatic.data) || story.content.body;
      story.content.provenance = provenance;
    }

    return story;
  });
}

function withSourceNote(item, note) {
  const story = structuredClone(item);
  story.content.provenance = {
    kind: 'mock',
    updatedAt: FIXTURE_UPDATED_AT,
    note
  };
  return story;
}

async function buildSourceStatus(env, options = {}) {
  const checkedAt = new Date().toISOString();
  const statuses = await Promise.all(SOURCE_CONFIG.map(async (source) => {
    if (source.kind === 'r2') {
      const bucket = env[source.binding];
      return {
        id: source.id,
        label: source.label,
        kind: source.kind,
        configured: !!bucket,
        status: bucket ? 'configured' : 'config_missing',
        binding: source.binding,
        prefix: env[source.prefixEnv] || source.defaultPrefix,
        authRequiredForPrivate: source.authRequiredForPrivate,
        checkedAt,
        provenance: bucket ? 'cached' : 'mock',
        note: bucket
          ? 'R2 binding is attached. Listing is only returned when media is explicitly public or the caller is authorized.'
          : `Add R2 binding ${source.binding} before live image listing.`
      };
    }

    if (source.kind === 'local-import') {
      return {
        id: source.id,
        label: source.label,
        kind: source.kind,
        configured: !!env[source.envName],
        status: env[source.envName] ? 'configured' : 'import_job_needed',
        envName: source.envName,
        pathHint: source.defaultPath,
        checkedAt,
        provenance: 'manual',
        note: 'Cloudflare Workers cannot read local Windows folders; add an import job that uploads approved files to R2.'
      };
    }

    const base = endpointBase(env, source);
    const hasSecret = !!env[source.secretEnv];
    const result = {
      id: source.id,
      label: source.label,
      kind: source.kind,
      configured: !!base,
      status: base ? 'configured' : 'config_missing',
      baseEnv: source.baseEnv,
      secretEnv: source.secretEnv,
      hasGatewaySecret: hasSecret,
      authRequiredForPrivate: source.authRequiredForPrivate,
      checkedAt,
      provenance: 'mock',
      note: hasSecret
        ? 'Secret is present in the Worker environment; private adapter can run when caller is authorized.'
        : `Set ${source.secretEnv} as a Wrangler secret before private reads are enabled.`
    };

    if (base && options.checkNetwork) {
      const health = await safeFetchJson(`${base}${source.healthPath}`, { method: 'GET' });
      result.health = {
        ok: health.ok,
        status: health.status,
        statusText: health.statusText,
        checkedAt
      };
      result.provenance = health.ok ? 'live' : 'mock';
      result.status = health.ok ? 'live_health_ok' : 'health_unavailable';
      if (!health.ok) result.note = health.error || health.statusText || result.note;
    }

    return result;
  }));

  return statuses;
}

async function listR2Gallery(request, env, sourceId, profileId) {
  const source = SOURCE_CONFIG.find((item) => item.id === sourceId);
  const bucket = source && env[source.binding];
  if (!source || !bucket?.list) return [];
  if (!canServeMedia(request, env)) return [];

  const prefix = env[source.prefixEnv] || source.defaultPrefix;
  const listed = await bucket.list({ prefix, limit: 18 });
  return (listed.objects || [])
    .filter((object) => object.size > 0 && /\.(png|jpe?g|webp|gif)$/i.test(object.key))
    .slice(0, 12)
    .map((object) => ({
      id: `r2-${profileId}-${slugify(object.key)}`,
      type: 'image',
      profileId,
      title: titleFromKey(object.key),
      src: `/api/media/${encodeURIComponent(sourceId)}/${encodeURIComponent(object.key)}`,
      alt: `${source.label}: ${object.key}`,
      provenance: {
        kind: 'live',
        updatedAt: object.uploaded ? new Date(object.uploaded).toISOString() : new Date().toISOString(),
        note: `${source.label} R2 object listed by Velarium gateway.`
      }
    }));
}

async function handleMediaRead(request, env, sourceId, encodedKey) {
  if (!canServeMedia(request, env)) {
    return jsonResponse({
      ok: false,
      error: 'media_not_public',
      note: 'R2 media serving requires VELARIUM_MEDIA_PUBLIC=true or an authorized live-read request.'
    }, request, env, 403);
  }

  const source = SOURCE_CONFIG.find((item) => item.id === decodeURIComponent(sourceId));
  if (!source || source.kind !== 'r2') {
    return jsonResponse({ ok: false, error: 'unknown_media_source' }, request, env, 404);
  }

  const bucket = env[source.binding];
  if (!bucket?.get) {
    return jsonResponse({
      ok: false,
      error: 'config_missing',
      requiredBinding: source.binding
    }, request, env, 501);
  }

  const key = decodeURIComponent(encodedKey);
  const object = await bucket.get(key);
  if (!object) return jsonResponse({ ok: false, error: 'media_not_found' }, request, env, 404);

  const headers = new Headers(corsHeaders(request, env));
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'private, max-age=300');
  headers.set('ETag', object.httpEtag);
  if (!headers.has('Content-Type')) headers.set('Content-Type', contentTypeFromKey(key));
  return new Response(object.body, { headers });
}

async function handleLucienImageImport(request, env) {
  if (request.method !== 'POST') {
    return jsonResponse({
      ok: false,
      error: 'method_not_allowed',
      note: 'Use POST with an approved image payload once Lucien import is enabled.'
    }, request, env, 405);
  }

  const supplied = bearerToken(request);
  if (!env.VELARIUM_IMPORT_TOKEN || supplied !== env.VELARIUM_IMPORT_TOKEN) {
    return jsonResponse({
      ok: false,
      error: 'unauthorized',
      requiredSecret: 'VELARIUM_IMPORT_TOKEN',
      note: 'Lucien image import requires a gateway-side import token. Do not put this token in the iOS app.'
    }, request, env, 401);
  }

  if (!env.VELARIUM_R2_LUCIEN_ASSETS?.put) {
    return jsonResponse({
      ok: false,
      error: 'config_missing',
      requiredBinding: 'VELARIUM_R2_LUCIEN_ASSETS',
      note: 'Attach an R2 bucket binding before Lucien imports can be stored.'
    }, request, env, 501);
  }

  return jsonResponse({
    ok: false,
    error: 'not_implemented',
    note: 'Import auth and storage binding are present, but payload validation is intentionally left for the v2 upload flow.'
  }, request, env, 501);
}

function liveReadMode(request, env) {
  const url = new URL(request.url);
  const requested = url.searchParams.get('includeLive') === '1' || request.headers.get('x-velarium-include-live') === '1';
  const allowUnauthenticated = env.VELARIUM_ALLOW_UNAUTHENTICATED_LIVE === 'true';
  const token = bearerToken(request);
  const hasReadToken = !!env.VELARIUM_READ_TOKEN;
  const authorized = allowUnauthenticated || (hasReadToken && token === env.VELARIUM_READ_TOKEN);

  return {
    requested,
    allowed: requested && authorized,
    auth: authorized ? 'authorized' : hasReadToken ? 'token_required' : 'read_secret_missing',
    note: requested && !authorized
      ? 'Live private summaries were requested but not authorized. Returning fixture summaries.'
      : 'Live private summaries are disabled unless explicitly requested and authorized.'
  };
}

function canServeMedia(request, env) {
  return env.VELARIUM_MEDIA_PUBLIC === 'true' || liveReadMode(request, env).allowed;
}

function privateHeaders(env, secretEnv) {
  const headers = { Accept: 'application/json' };
  const secret = env[secretEnv];
  if (secret) headers.Authorization = `Bearer ${secret}`;
  return headers;
}

function endpointBase(env, source) {
  const base = env[source.baseEnv] || source.defaultBase;
  return base ? String(base).replace(/\/$/, '') : '';
}

async function safeFetchJson(url, init = {}) {
  try {
    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    let data = null;
    if (contentType.includes('application/json') || /^[\[{]/.test(text.trim())) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: 'fetch_failed',
      error: error?.message || String(error)
    };
  }
}

function sourceConfigPublic(env) {
  return SOURCE_CONFIG.map((source) => ({
    id: source.id,
    label: source.label,
    kind: source.kind,
    baseEnv: source.baseEnv,
    secretEnv: source.secretEnv,
    binding: source.binding,
    prefixEnv: source.prefixEnv,
    envName: source.envName,
    configured: source.kind === 'r2'
      ? !!env[source.binding]
      : source.kind === 'local-import'
        ? !!env[source.envName]
        : !!endpointBase(env, source),
    hasGatewaySecret: source.secretEnv ? !!env[source.secretEnv] : undefined
  }));
}

function socialMapProvenance(profileId) {
  const profile = profiles[profileId];
  return {
    kind: profile?.socialMap?.some((entry) => entry.provenance?.kind === 'manual') ? 'manual' : 'mock',
    updatedAt: FIXTURE_UPDATED_AT,
    note: 'Social maps are seeded until each companion social adapter is connected.'
  };
}

function jsonResponse(payload, request, env, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? 'private, max-age=30' : 'no-store',
      ...corsHeaders(request, env)
    }
  });
}

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin');
  const allowed = (env.VELARIUM_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const origin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Velarium-Include-Live',
    'Vary': 'Origin'
  };
}

function bearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (value && typeof value === 'object') return [value];
  return [];
}

function summarizeRow(row, fields) {
  const parts = fields
    .map((field) => {
      const value = row?.[field];
      if (value == null || value === '') return '';
      return `${field.replaceAll('_', ' ')}: ${clip(String(value), 80)}`;
    })
    .filter(Boolean);
  return parts.join(' | ') || 'Live summary row available.';
}

function summarizeSomatic(data) {
  if (!data || typeof data !== 'object') return null;
  const candidates = [
    data.summary,
    data.current_state,
    data.active_region,
    data.trend,
    data.message
  ].filter(Boolean);
  if (candidates.length) return candidates.map((item) => clip(String(item), 120)).slice(0, 4);

  const keys = Object.keys(data).slice(0, 4);
  return keys.length ? keys.map((key) => `${key}: ${clip(JSON.stringify(data[key]), 100)}`) : null;
}

function clip(value, length) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function titleFromKey(key) {
  const filename = String(key).split('/').pop() || 'Generated image';
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function contentTypeFromKey(key) {
  if (/\.png$/i.test(key)) return 'image/png';
  if (/\.jpe?g$/i.test(key)) return 'image/jpeg';
  if (/\.webp$/i.test(key)) return 'image/webp';
  if (/\.gif$/i.test(key)) return 'image/gif';
  return 'application/octet-stream';
}
