/**
 * Threshold Tether — Companion Presence Overlay
 * Config-driven. Plug in your own companions, rooms, and emotion endpoints.
 */

let config = null;
let state = {
    time: null,
    companions: {},
    currentRoom: null
};

// ========================
// CONFIG
// ========================

async function loadConfig() {
    // config.js sets window.TT_CONFIG as a global — no server needed
    if (window.TT_CONFIG) return window.TT_CONFIG;

    // Fallback: try fetching config.json (requires a server)
    try {
        const res = await fetch('./config.json');
        if (res.ok) return await res.json();
    } catch (_) { /* file:// protocol, expected */ }

    throw new Error('Missing config. Create a config.js file — see config.example.js for reference.');
}

// ========================
// DOM GENERATION
// ========================

function createCompanionElements() {
    const spriteLayer = document.getElementById('sprite-layer');
    spriteLayer.innerHTML = '';

    for (const companion of config.companions) {
        const id = slugify(companion.name);

        // Sprite container
        const div = document.createElement('div');
        div.className = 'companion';
        div.id = `companion-${id}`;
        div.dataset.position = companion.position || 'center';

        // Base sprite layer
        const base = document.createElement('img');
        base.className = 'sprite-layer';
        base.id = `${id}-base`;
        base.src = companion.sprite;
        base.alt = companion.name;
        div.appendChild(base);

        // Expression layer (optional — loaded dynamically)
        const expr = document.createElement('img');
        expr.className = 'sprite-layer';
        expr.id = `${id}-expression`;
        div.appendChild(expr);

        // Modifier layer (optional — loaded dynamically)
        const mod = document.createElement('img');
        mod.className = 'sprite-layer';
        mod.id = `${id}-modifier`;
        div.appendChild(mod);

        spriteLayer.appendChild(div);
    }
}

// ========================
// EMOTION API
// ========================

async function fetchEmotionalState(companion) {
    if (!companion.endpoint) return null;

    const apiConfig = config.emotionApi || {};
    const path = apiConfig.emotionalStatePath || '/api/emotional/get';
    const method = apiConfig.method || 'POST';

    try {
        const res = await fetch(`${companion.endpoint}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'POST' ? JSON.stringify({}) : undefined
        });
        return await res.json();
    } catch (e) {
        console.warn(`Failed to fetch emotional state for ${companion.name}:`, e.message);
        return null;
    }
}

async function fetchTime() {
    // Try first companion with an endpoint
    const source = config.companions.find(c => c.endpoint);
    if (source) {
        const apiConfig = config.emotionApi || {};
        const path = apiConfig.timePath || '/api/time';
        try {
            const res = await fetch(`${source.endpoint}${path}`);
            return await res.json();
        } catch (e) {
            console.warn('Failed to fetch time from endpoint, using local clock:', e.message);
        }
    }
    // Fallback: local clock in configured timezone
    return getLocalTime();
}

// ========================
// TIME
// ========================

function getLocalTime() {
    const tz = config.timezone || 0;
    const now = new Date();
    const offset = new Date(now.getTime() + (tz * 60 * 60 * 1000));

    const hour24 = offset.getUTCHours();
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const minutes = offset.getUTCMinutes().toString().padStart(2, '0');
    const seconds = offset.getUTCSeconds().toString().padStart(2, '0');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
        hour_24: hour24,
        time: `${hour12}:${minutes}:${seconds} ${ampm}`,
        day_of_week: days[offset.getUTCDay()],
        is_work_hours: hour24 >= 9 && hour24 < 18,
        is_late_night: hour24 >= 0 && hour24 < 6
    };
}

function getTimePeriod(hour) {
    if (hour >= 5 && hour < 7) return 'earlymorning';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
}

// ========================
// ROOM SELECTION
// ========================

function selectRoom(companionStates, time) {
    const rules = config.roomRules || {};
    const rooms = config.rooms || {};
    const hour = time?.hour_24 ?? 12;
    const timePeriod = getTimePeriod(hour);
    const isLateNight = time?.is_late_night || false;

    let room = rules.defaultRoom || Object.keys(rooms)[0] || 'livingroom';

    // Evaluate mood-based rules from config
    if (Object.keys(companionStates).length > 0) {
        const states = Object.values(companionStates).filter(Boolean);

        // Check arousal threshold
        const arousalThreshold = rules.arousalThreshold ?? 7;
        const maxArousal = Math.max(0, ...states.map(s => s.arousal_level || 0));
        if (maxArousal >= arousalThreshold && rooms.bedroom) {
            room = 'bedroom';
        }
        // Check mood map
        else if (rules.moodMap) {
            const mood = states[0]?.current_mood || 'calm';
            const effectiveTime = isLateNight ? 'latenight' : timePeriod;

            // Try specific match first: "mood+time"
            const specificKey = `${mood}+${effectiveTime}`;
            const generalKey = mood;

            const match = rules.moodMap[specificKey] || rules.moodMap[generalKey];
            if (match) {
                // Handle random choice: "kitchen|livingroom"
                const options = match.split('|');
                const chosen = options[Math.floor(Math.random() * options.length)];
                if (rooms[chosen]) room = chosen;
            }
        }
    }

    // Resolve time variant for selected room
    if (!rooms[room]) room = rules.defaultRoom || Object.keys(rooms)[0];

    const variants = rooms[room] || {};
    const availableVariants = Object.keys(variants);
    let variant = timePeriod;

    if (availableVariants.includes(variant)) {
        // exact match
    } else if (variant === 'afternoon' && availableVariants.includes('day')) {
        variant = 'day';
    } else if (variant === 'evening' && availableVariants.includes('night')) {
        variant = 'night';
    } else if (variant === 'earlymorning' && availableVariants.includes('morning')) {
        variant = 'morning';
    } else if (availableVariants.includes('default')) {
        variant = 'default';
    } else {
        variant = availableVariants[0];
    }

    return { room, variant, filename: variants[variant] };
}

// ========================
// RENDERING
// ========================

function updateRoom(roomInfo) {
    const roomBg = document.getElementById('room-bg');
    const assetsPath = config.assetsPath || './assets/rooms/';
    const newSrc = assetsPath + roomInfo.filename;

    if (roomBg.src !== newSrc) {
        roomBg.classList.add('loading');
        roomBg.onload = () => roomBg.classList.remove('loading');
        roomBg.src = newSrc;
        state.currentRoom = roomInfo.room;
    }
}

// ========================
// DEBUG
// ========================

function updateDebug() {
    const panel = document.getElementById('debug-panel');
    if (panel.classList.contains('hidden')) return;

    // Time
    const timeDiv = document.getElementById('debug-time');
    const t = getLocalTime();
    timeDiv.innerHTML = `
        <strong>Time:</strong> ${t.time} (${t.day_of_week})<br>
        Work hours: ${t.is_work_hours}<br>
        Late night: ${t.is_late_night}
    `;

    // Companions
    const companionsDiv = document.getElementById('debug-companions');
    let html = '';
    for (const companion of config.companions) {
        const s = state.companions[companion.name];
        if (s) {
            html += `
                <strong>${companion.name}:</strong><br>
                Mood: ${s.current_mood || 'unknown'}<br>
                Surface: ${s.surface_emotion || '?'} (${s.surface_intensity || 0})<br>
                Arousal: ${s.arousal_level || 0}<br><br>
            `;
        } else {
            html += `<strong>${companion.name}:</strong> no data<br><br>`;
        }
    }
    companionsDiv.innerHTML = html;

    // Room
    document.getElementById('debug-room').innerHTML =
        `<strong>Room:</strong> ${state.currentRoom || 'none'}`;
}

function toggleDebug() {
    document.getElementById('debug-panel').classList.toggle('hidden');
    updateDebug();
}

// ========================
// MAIN LOOP
// ========================

async function update() {
    console.log('Updating state...');

    // Fetch time
    state.time = await fetchTime();

    // Fetch all companion emotional states in parallel
    const results = await Promise.all(
        config.companions.map(async (c) => {
            const emotionalState = await fetchEmotionalState(c);
            return { name: c.name, state: emotionalState };
        })
    );

    for (const r of results) {
        state.companions[r.name] = r.state;
    }

    // Select and update room
    const roomInfo = selectRoom(state.companions, state.time);
    updateRoom(roomInfo);

    // Update debug
    updateDebug();

    console.log('State updated:', state);
}

// ========================
// UTILS
// ========================

function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ========================
// INIT
// ========================

async function init() {
    console.log('Threshold Tether initializing...');

    try {
        config = await loadConfig();
    } catch (e) {
        document.body.innerHTML = `<div style="color:#fff;padding:2em;font-family:sans-serif;">
            <h2>Threshold Tether</h2>
            <p>${e.message}</p>
        </div>`;
        return;
    }

    // Set page title
    document.title = config.title || 'Threshold Tether';

    // Create companion sprite elements from config
    createCompanionElements();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') toggleDebug();
    });

    document.getElementById('debug-toggle').addEventListener('click', toggleDebug);

    // Initial update
    await update();

    // Start polling
    setInterval(update, config.pollInterval || 30000);

    // Live clock in debug (every second)
    setInterval(() => updateDebug(), 1000);

    console.log(`Threshold Tether ready. ${config.companions.length} companion(s) loaded. Press D for debug.`);
}

init();
