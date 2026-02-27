const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');

const DEFAULT_API_BASE_URL = 'https://overfast-api.tekrop.fr';
const DEFAULT_OUTPUT_DIR = 'public';
const CACHE_DIR = '.cache';
const CACHE_FILE = 'overfast.json';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const ENDPOINTS = ['heroes', 'roles', 'gamemodes', 'maps'];

/* ════════════════════════════════════════════
   Utility Functions
   ════════════════════════════════════════════ */

function parseArgs(args) {
    const options = { outputDir: DEFAULT_OUTPUT_DIR, baseUrl: DEFAULT_API_BASE_URL, useCache: true };
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === '--no-cache') { options.useCache = false; continue; }
        if (arg === '--base-url' && args[i + 1]) { options.baseUrl = args[i + 1]; i += 1; continue; }
        if (arg === '--output' && args[i + 1]) { options.outputDir = args[i + 1]; i += 1; continue; }
        if (!arg.startsWith('--')) options.outputDir = arg;
    }
    return options;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(http, endpoint, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try { return (await http.get(`/${endpoint}`)).data; }
        catch (e) { if (attempt === retries) throw e; await sleep(500 * Math.pow(2, attempt)); }
    }
}

async function loadCache(cachePath) {
    try {
        const parsed = JSON.parse(await fs.readFile(cachePath, 'utf8'));
        if (!parsed?.timestamp || !parsed?.data || Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
        return parsed.data;
    } catch { return null; }
}

async function writeCache(cachePath, payload) {
    try {
        await fs.mkdir(path.dirname(cachePath), { recursive: true });
        await fs.writeFile(cachePath, JSON.stringify({ timestamp: Date.now(), data: payload }, null, 2));
    } catch (e) { console.warn('Cache write failed:', e.message); }
}

const safeArray = v => Array.isArray(v) ? v : [];
const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

async function fetchAllData({ baseUrl, useCache }) {
    const http = axios.create({ baseURL: baseUrl, timeout: 10000, headers: { 'User-Agent': 'OverWatched/3.0' } });
    const cachePath = path.join(CACHE_DIR, CACHE_FILE);
    const cached = useCache ? await loadCache(cachePath) : null;
    let usedCache = false;
    const results = {};
    for (const ep of ENDPOINTS) {
        try { results[ep] = await fetchWithRetry(http, ep, 2); }
        catch (e) {
            if (cached?.[ep]) { results[ep] = cached[ep]; usedCache = true; console.warn(`Cached ${ep}:`, e.message); }
            else { results[ep] = []; console.error(`Failed ${ep}:`, e.message); }
        }
    }
    if (useCache) await writeCache(cachePath, results);
    return { ...results, usedCache };
}

/* ════════════════════════════════════════════
   SVG Icon Library
   ════════════════════════════════════════════ */

function getRoleIcon(role) {
    const icons = {
        tank: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16 2.667l-10.667 5.333v6.667c0 6.147 4.56 11.893 10.667 13.333 6.107-1.44 10.667-7.186 10.667-13.333V8L16 2.667zm0 14.666V5.333l8 4v5.333c0 4.267-3.2 8.267-8 9.6V17.333z"/></svg>',
        damage: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M24.267 13.733L16 8l-8.267 5.733L16 19.467l8.267-5.734zm-16.534 0L16 19.467l8.267-5.734L16 8l-8.267 5.733zm8.534 11.734l8.266-5.734L16 13.733l-8.267 5.733L16 25.467z"/></svg>',
        support: '<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M22.667 14.667v-4h-4V6h-5.334v4.667h-4v4h4v4.666h5.334v-4.666h4zm-6.667 12c6.627 0 12-5.373 12-12s-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12z"/></svg>'
    };
    return icons[role?.toLowerCase()] || '';
}

const SVG_ICONS = {
    search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    chart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    users: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    map: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    crosshair: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>',
    trophy: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    sword: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>',
    heart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
};

/* ════════════════════════════════════════════
   CSS Generation — THE BIG ONE
   ════════════════════════════════════════════ */

function generateStyles() {
    return `
/* ═══ Design System ═══ */
:root {
    color-scheme: light dark;
    --bg: #f0f2f7;
    --bg-deep: #e4e7ef;
    --surface: #ffffff;
    --surface-strong: #e8ecf4;
    --surface-glass: rgba(255,255,255,0.6);
    --text: #0f1419;
    --muted: #5b6472;
    --brand: #f06414;
    --brand-strong: #d45510;
    --brand-glow: rgba(240, 100, 20, 0.35);
    --brand-subtle: rgba(240, 100, 20, 0.08);
    --accent: #22c55e;
    --border: rgba(15, 20, 25, 0.1);
    --border-strong: rgba(15, 20, 25, 0.18);
    --shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
    --shadow-lg: 0 20px 60px rgba(15, 23, 42, 0.12);
    --shadow-glow: 0 0 40px rgba(240, 100, 20, 0.15);
    --tank: #3b82f6;
    --damage: #ef4444;
    --support: #22c55e;
    --tank-bg: rgba(59, 130, 246, 0.1);
    --damage-bg: rgba(239, 68, 68, 0.1);
    --support-bg: rgba(34, 197, 94, 0.1);
    --tank-glow: rgba(59,130,246,0.2);
    --damage-glow: rgba(239,68,68,0.2);
    --support-glow: rgba(34,197,94,0.2);
    --noise: 0.03;
    --tier-s: #ff6a00; --tier-a: #22c55e; --tier-b: #3b82f6; --tier-c: #a855f7; --tier-d: #6b7280;
    --radius: 16px;
    --radius-lg: 24px;
}

[data-theme="dark"] {
    --bg: #060a12;
    --bg-deep: #040810;
    --surface: #0c1220;
    --surface-strong: #141e30;
    --surface-glass: rgba(12,18,32,0.7);
    --text: #eaf0f6;
    --muted: #7a8da0;
    --brand: #ff7b2e;
    --brand-strong: #ff9652;
    --brand-glow: rgba(255, 123, 46, 0.30);
    --brand-subtle: rgba(255, 123, 46, 0.08);
    --accent: #34d399;
    --border: rgba(148, 163, 184, 0.10);
    --border-strong: rgba(148, 163, 184, 0.18);
    --shadow: 0 8px 32px rgba(0,0,0,0.5);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.6);
    --shadow-glow: 0 0 60px rgba(255,123,46,0.12);
    --tank-bg: rgba(59,130,246,0.12);
    --damage-bg: rgba(239,68,68,0.12);
    --support-bg: rgba(34,197,94,0.12);
    --noise: 0.04;
}

/* ═══ Animations ═══ */
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideModal { from { opacity:0; transform:scale(.93) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }
@keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
@keyframes donutFill { from { stroke-dasharray: 0 251.2; } }

@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes borderGlow { 0%,100%{border-color:rgba(240,100,20,0.3)} 50%{border-color:rgba(240,100,20,0.6)} }

/* ═══ Base ═══ */
*,*::before,*::after { box-sizing:border-box; }
body {
    font-family:"DM Sans","Segoe UI",system-ui,sans-serif;
    background:var(--bg); color:var(--text); margin:0; padding:0; line-height:1.6;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}
body::before {
    content:''; position:fixed; inset:0; opacity:var(--noise); pointer-events:none; z-index:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat:repeat; background-size:256px;
}
body>* { position:relative; z-index:1; }
h1,h2,h3,h4,h5,h6,.nav-link,.btn,.badge,.hero-name-role { font-family:"Rajdhani","Segoe UI",system-ui,sans-serif; letter-spacing:.02em; }
::selection { background:var(--brand); color:#fff; }
.container { width:min(1200px,92vw); margin:0 auto; }
.hidden { display:none!important; }
.muted { color:var(--muted); margin:0; }

/* ═══ Header ═══ */
header { padding:1.5rem 0 1rem; }
.header-bar {
    display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;
}
.header-brand { display:flex; align-items:center; gap:.75rem; }
.header-brand h1 {
    font-size:1.6rem; font-weight:700; margin:0; text-transform:uppercase; letter-spacing:.08em;
    color:var(--brand);
}
.header-brand .version-pill {
    font-size:.65rem; padding:.15rem .5rem; border-radius:999px;
    background:var(--brand-subtle); color:var(--brand); font-weight:700;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:uppercase; letter-spacing:.06em;
    border:1px solid color-mix(in srgb, var(--brand) 20%, transparent);
}
.header-actions { display:flex; gap:.5rem; }

/* ═══ Buttons ═══ */
.btn {
    border:none; border-radius:var(--radius); padding:.55rem 1.2rem; font-weight:700; font-size:.85rem;
    cursor:pointer; transition:all .25s cubic-bezier(.4,0,.2,1); text-transform:uppercase; letter-spacing:.04em;
    display:inline-flex; align-items:center; gap:.4rem;
}
.btn-brand {
    background:var(--brand); color:#fff; box-shadow:0 4px 16px var(--brand-glow);
}
.btn-brand:hover { background:var(--brand-strong); transform:translateY(-2px); box-shadow:0 8px 24px var(--brand-glow); }
.btn-ghost {
    background:var(--surface-strong); color:var(--text); border:1px solid var(--border);
}
.btn-ghost:hover { border-color:var(--brand); color:var(--brand); transform:translateY(-1px); }
.btn-sm { padding:.4rem .85rem; font-size:.78rem; border-radius:10px; }
.btn:focus-visible, input:focus-visible, select:focus-visible, .nav-link:focus-visible {
    outline:2px solid var(--brand); outline-offset:2px;
}

/* ═══ Navigation ═══ */
nav {
    position:sticky; top:0; z-index:20;
    backdrop-filter:blur(20px) saturate(1.5); -webkit-backdrop-filter:blur(20px) saturate(1.5);
    background:color-mix(in srgb, var(--bg) 82%, transparent);
    border-bottom:1px solid var(--border);
}
.nav-inner { display:flex; align-items:center; gap:.35rem; padding:.6rem 0; overflow-x:auto; }
.nav-link {
    border:none; background:transparent; padding:.45rem .85rem; border-radius:10px;
    color:var(--muted); font-weight:700; font-size:.85rem; cursor:pointer;
    transition:all .2s ease; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap;
}
.nav-link:hover { color:var(--text); background:var(--surface-strong); }
.nav-link.active {
    background:var(--brand); color:#fff; box-shadow:0 4px 14px var(--brand-glow);
}

/* ═══ Sections ═══ */
main { padding:1.5rem 0 3rem; }
section.content {
    animation:fadeUp .45s cubic-bezier(.4,0,.2,1) both;
}
.section-card {
    background:var(--surface); border-radius:var(--radius-lg); padding:2rem;
    border:1px solid var(--border); box-shadow:var(--shadow); margin-bottom:1.5rem;
}
.section-head { margin-bottom:1.5rem; }
.section-head h2 {
    font-weight:700; font-size:1.5rem; text-transform:uppercase; letter-spacing:.04em; margin:0 0 .3rem;
}
.section-head h2::after {
    content:''; display:block; width:48px; height:3px; background:var(--brand); border-radius:2px; margin-top:6px;
}

/* ═══ Filters ═══ */
.filters {
    display:grid; gap:.75rem; grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
    align-items:end; margin-bottom:1.5rem;
}
.filter-group label {
    display:block; font-family:"Rajdhani",system-ui,sans-serif; font-size:.78rem; font-weight:600;
    color:var(--muted); margin-bottom:.25rem; text-transform:uppercase; letter-spacing:.04em;
}
.filter-group input, .filter-group select {
    width:100%; padding:.55rem .75rem; border-radius:10px; border:1px solid var(--border);
    background:var(--surface-strong); color:var(--text); font-family:"DM Sans",system-ui,sans-serif; font-size:.9rem;
    transition:border-color .2s,box-shadow .2s;
}
.filter-group input:focus, .filter-group select:focus {
    border-color:var(--brand); box-shadow:0 0 0 3px var(--brand-glow); outline:none;
}

/* ════════════════════════════════════════
   OVERVIEW / LANDING — THE HERO SECTION
   ════════════════════════════════════════ */

.overview-splash {
    position:relative; border-radius:var(--radius-lg); overflow:hidden;
    background:var(--surface); border:1px solid var(--border);
    margin-bottom:1.5rem; box-shadow:var(--shadow);
}

/* Subtle brand-tinted background */
.overview-splash::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 0%, var(--brand-subtle) 0%, transparent 70%); z-index:0;
}

/* Brand accent bar */
.overview-splash::after {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:var(--brand); z-index:2;
}

.splash-inner {
    position:relative; z-index:1; padding:3rem 2rem 2rem; text-align:center;
}

.splash-inner h2 {
    font-size:clamp(1.8rem,4vw,2.8rem); font-weight:700; margin:0 0 .5rem;
    text-transform:uppercase; letter-spacing:.06em;
    color:var(--text);
}
.splash-inner h2 span { color:var(--brand); }
.splash-inner h2::after { display:none; }
.splash-sub {
    color:var(--muted); font-size:1.05rem; margin:0 0 2rem; max-width:560px; margin-left:auto; margin-right:auto;
}

/* Hero portrait strip in the splash */
.hero-portrait-strip {
    display:flex; justify-content:center; gap:6px; margin-bottom:2rem; flex-wrap:wrap;
}
.hero-portrait-strip img {
    width:52px; height:52px; border-radius:50%; object-fit:cover;
    border:2px solid var(--border); transition:all .3s ease; opacity:.7;
    filter:grayscale(.3);
}
.hero-portrait-strip img:hover {
    opacity:1; filter:grayscale(0); transform:scale(1.15); border-color:var(--brand);
    box-shadow:0 0 16px var(--brand-glow);
}

/* Big search bar */
.search-hero {
    display:flex; gap:.75rem; max-width:600px; margin:0 auto 1rem;
}
.search-hero-input-wrap {
    flex:1; position:relative;
}
.search-hero input {
    width:100%; padding:1rem 1.4rem 1rem 3rem; border-radius:var(--radius); font-size:1.05rem;
    border:2px solid var(--border); background:var(--surface-strong); color:var(--text);
    font-family:"DM Sans",system-ui,sans-serif; transition:all .25s ease;
}
.search-hero input::placeholder { color:var(--muted); }
.search-hero input:focus {
    border-color:var(--brand); box-shadow:0 0 0 4px var(--brand-glow), var(--shadow-glow); outline:none;
}
.search-hero .search-icon {
    position:absolute; left:1rem; top:50%; transform:translateY(-50%);
    color:var(--muted); pointer-events:none; display:flex;
}
.search-hero button { flex-shrink:0; padding:1rem 1.8rem; font-size:.95rem; }
.search-hint {
    font-size:.8rem; color:var(--muted); margin:.5rem 0 0;
    font-family:"Rajdhani",system-ui,sans-serif; letter-spacing:.02em;
}

/* Overview stat row */
.overview-stats-row {
    display:grid; gap:.75rem; grid-template-columns:repeat(5,1fr);
    margin-bottom:1.5rem;
}
@media(max-width:700px) {
    .overview-stats-row { grid-template-columns:repeat(2,1fr); }
}
@media(min-width:701px) and (max-width:900px) {
    .overview-stats-row { grid-template-columns:repeat(3,1fr); }
}
.ov-stat {
    padding:1.2rem 1rem; border-radius:var(--radius); text-align:center;
    border:1px solid var(--border); cursor:pointer;
    transition:all .3s cubic-bezier(.4,0,.2,1); position:relative; overflow:hidden;
}
.ov-stat::before {
    content:''; position:absolute; inset:0; opacity:0; transition:opacity .3s ease;
}
.ov-stat:hover { transform:translateY(-4px); border-color:var(--brand); box-shadow:0 8px 24px var(--brand-glow); }
.ov-stat:hover::before { opacity:1; }
.ov-stat .ov-num {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:2.2rem; line-height:1;
}
.ov-stat .ov-label {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:600; font-size:.78rem;
    color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-top:.15rem;
    display:inline-flex; align-items:center; justify-content:center; gap:.3rem;
}
.ov-stat .ov-label svg { width:14px; height:14px; flex-shrink:0; }
/* Role-colored stat cards */
.ov-stat.ov-total { background:var(--surface); }
.ov-stat.ov-total .ov-num { color:var(--brand); }
.ov-stat.ov-total::before { background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); }
.ov-stat.ov-tank { background:var(--tank-bg); }
.ov-stat.ov-tank .ov-num { color:var(--tank); }
.ov-stat.ov-tank::before { background:radial-gradient(circle at 50% 0%,var(--tank-glow),transparent 70%); }
.ov-stat.ov-dmg { background:var(--damage-bg); }
.ov-stat.ov-dmg .ov-num { color:var(--damage); }
.ov-stat.ov-dmg::before { background:radial-gradient(circle at 50% 0%,var(--damage-glow),transparent 70%); }
.ov-stat.ov-sup { background:var(--support-bg); }
.ov-stat.ov-sup .ov-num { color:var(--support); }
.ov-stat.ov-sup::before { background:radial-gradient(circle at 50% 0%,var(--support-glow),transparent 70%); }
.ov-stat.ov-map { background:var(--surface); }
.ov-stat.ov-map .ov-num { color:var(--brand); }
.ov-stat.ov-map::before { background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); }

/* Quick links */
.ql-grid { display:grid; gap:.75rem; grid-template-columns:repeat(3,1fr); }
@media(max-width:700px) {
    .ql-grid { grid-template-columns:1fr; }
}
.ql-card {
    display:flex; align-items:center; gap:1rem; padding:1.1rem 1.25rem;
    border-radius:var(--radius); border:1px solid var(--border); background:var(--surface);
    cursor:pointer; transition:all .3s ease; position:relative; overflow:hidden;
}
.ql-card::before {
    content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); opacity:0;
    transition:opacity .3s ease;
}
.ql-card:hover { border-color:var(--brand); transform:translateY(-3px); box-shadow:0 8px 24px var(--brand-glow); }
.ql-card:hover::before { opacity:1; }
.ql-card>* { position:relative; z-index:1; }
.ql-icon {
    width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center;
    flex-shrink:0; color:var(--brand);
}
.ql-icon.ql-search { background:rgba(240,100,20,0.1); }
.ql-icon.ql-meta { background:rgba(168,85,247,0.1); color:#a855f7; }
.ql-icon.ql-heroes { background:rgba(59,130,246,0.1); color:var(--tank); }
.ql-icon.ql-maps { background:rgba(34,197,94,0.1); color:var(--support); }
.ql-title {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1rem;
    text-transform:uppercase; letter-spacing:.02em;
}
.ql-desc { font-size:.8rem; color:var(--muted); margin:0; }

/* Featured heroes strip */
.featured-section { margin-top:1.5rem; }
.featured-section h3 {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1rem;
    text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin:0 0 .75rem;
}
.featured-section h3::after {
    content:''; display:inline-block; width:32px; height:2px; background:var(--brand);
    border-radius:1px; margin-left:.5rem; vertical-align:middle;
}
.featured-heroes-row {
    display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
}
.featured-hero {
    display:flex; align-items:center; gap:.75rem; padding:.75rem 1rem;
    border-radius:var(--radius); border:1px solid var(--border); background:var(--surface);
    transition:all .3s ease; cursor:pointer; position:relative; overflow:hidden;
}
.featured-hero::before {
    content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); opacity:0;
    transition:opacity .3s ease;
}
.featured-hero:hover { border-color:var(--brand); transform:translateY(-2px); box-shadow:0 4px 16px var(--brand-glow); }
.featured-hero:hover::before { opacity:1; }
.featured-hero>* { position:relative; z-index:1; }
.featured-hero img {
    width:40px; height:40px; border-radius:50%; object-fit:cover;
    border:2px solid var(--border); flex-shrink:0;
}
.featured-hero:hover img { border-color:var(--brand); }
.fh-info { min-width:0; }
.fh-name {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:.9rem;
    text-transform:capitalize; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.fh-role {
    font-size:.72rem; font-family:"Rajdhani",system-ui,sans-serif; font-weight:600;
    text-transform:uppercase; color:var(--muted); letter-spacing:.04em;
}

/* ═══ Hero Cards ═══ */
.grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); }
.hero-card {
    background:var(--surface-strong); border-radius:var(--radius); overflow:hidden;
    border:1px solid var(--border); transition:all .3s cubic-bezier(.4,0,.2,1);
    animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both;
}
.hero-card button { all:unset; display:block; cursor:pointer; width:100%; }
.hero-card img {
    width:100%; height:200px; object-fit:cover; display:block;
    transition:transform .4s cubic-bezier(.4,0,.2,1), filter .4s ease;
}
.hero-card:hover {
    transform:translateY(-6px); box-shadow:var(--shadow-lg); border-color:var(--brand);
}
.hero-card:hover img { transform:scale(1.06); filter:brightness(1.1) saturate(1.1); }
.hero-meta { padding:.75rem .9rem 1rem; display:flex; flex-direction:column; gap:.35rem; }
.hero-meta h3 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; margin:0; }
.role-pill {
    display:inline-flex; align-items:center; gap:.3rem; border-radius:999px;
    padding:.2rem .55rem; font-size:.72rem; font-weight:600;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:uppercase;
    letter-spacing:.04em; width:fit-content;
}
.hero-card[data-role="tank"] .role-pill { background:var(--tank-bg); color:var(--tank); border:1px solid color-mix(in srgb,var(--tank) 25%,transparent); }
.hero-card[data-role="damage"] .role-pill { background:var(--damage-bg); color:var(--damage); border:1px solid color-mix(in srgb,var(--damage) 25%,transparent); }
.hero-card[data-role="support"] .role-pill { background:var(--support-bg); color:var(--support); border:1px solid color-mix(in srgb,var(--support) 25%,transparent); }

/* ═══ Heroes 3-Column Layout ═══ */
.heroes-columns {
    display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; align-items:start;
}
.role-column { display:flex; flex-direction:column; gap:0; }
.role-column-header {
    display:flex; align-items:center; gap:.5rem; padding:.55rem .85rem;
    border-radius:var(--radius) var(--radius) 0 0; font-family:"Rajdhani",system-ui,sans-serif;
    font-weight:700; font-size:.95rem; text-transform:uppercase; letter-spacing:.04em;
    position:sticky; top:52px; z-index:10;
}
.role-column-header svg { flex-shrink:0; width:18px; height:18px; }
.role-column-header .role-count {
    margin-left:auto; font-size:.72rem; font-weight:600; opacity:.7;
}
.role-column-header.tank-header { background:var(--tank-bg); color:var(--tank); border:1px solid color-mix(in srgb,var(--tank) 20%,transparent); border-bottom:none; }
.role-column-header.damage-header { background:var(--damage-bg); color:var(--damage); border:1px solid color-mix(in srgb,var(--damage) 20%,transparent); border-bottom:none; }
.role-column-header.support-header { background:var(--support-bg); color:var(--support); border:1px solid color-mix(in srgb,var(--support) 20%,transparent); border-bottom:none; }
.role-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); gap:3px;
    padding:6px; background:var(--surface-strong); border:1px solid var(--border);
    border-radius:0 0 var(--radius) var(--radius); border-top:none;
}
.hero-thumb {
    position:relative; border-radius:6px; overflow:hidden; cursor:pointer;
    transition:all .25s cubic-bezier(.4,0,.2,1); aspect-ratio:1;
    background:var(--surface);
}
.hero-thumb button { all:unset; display:block; width:100%; height:100%; cursor:pointer; }
.hero-thumb img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform .3s ease, filter .3s ease;
}
.hero-thumb .hero-thumb-name {
    position:absolute; bottom:0; left:0; right:0; padding:2px 4px;
    background:linear-gradient(transparent,rgba(0,0,0,.85));
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:600;
    font-size:.6rem; color:#fff; text-align:center; line-height:1.15;
    opacity:0; transition:opacity .2s ease;
}
.hero-thumb:hover {
    transform:translateY(-3px) scale(1.08); z-index:5;
    box-shadow:0 6px 20px rgba(0,0,0,.4); border:1px solid var(--brand);
}
.hero-thumb:hover img { filter:brightness(1.15) saturate(1.15); }
.hero-thumb:hover .hero-thumb-name { opacity:1; }
@media(max-width:900px) {
    .heroes-columns { grid-template-columns:1fr; }
    .role-column-header { position:static; }
    .role-grid { grid-template-columns:repeat(auto-fill,minmax(64px,1fr)); }
}
@media(min-width:901px) and (max-width:1200px) {
    .role-grid { grid-template-columns:repeat(auto-fill,minmax(72px,1fr)); }
}

/* ═══ Header Search Bar ═══ */
.header-search {
    position:relative; display:flex; align-items:center;
}
.header-search-input {
    width:0; padding:0; border:none; background:transparent; color:var(--text);
    font-family:"DM Sans",system-ui,sans-serif; font-size:.88rem;
    transition:all .3s cubic-bezier(.4,0,.2,1); border-radius:10px;
    outline:none;
}
.header-search.open .header-search-input {
    width:220px; padding:.4rem .75rem .4rem .4rem;
    background:var(--surface-strong); border:1px solid var(--border);
}
.header-search.open .header-search-input:focus {
    border-color:var(--brand); box-shadow:0 0 0 3px var(--brand-glow);
}
.header-search-btn {
    border:none; background:var(--brand); color:#fff; border-radius:10px;
    padding:.4rem .75rem; font-weight:700; font-size:.78rem; cursor:pointer;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:uppercase;
    letter-spacing:.04em; display:inline-flex; align-items:center; gap:.3rem;
    transition:all .25s ease; flex-shrink:0;
    box-shadow:0 4px 16px var(--brand-glow);
}
.header-search-btn:hover { background:var(--brand-strong); transform:translateY(-1px); }
.header-search-btn svg { width:16px; height:16px; }

/* ═══ Player Search Modal ═══ */
.player-modal {
    position:fixed; inset:0; background:rgba(2,6,23,.75);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; justify-content:center; align-items:flex-start; padding:6vh 1.5rem; z-index:50;
}
.player-modal.hidden { display:none; }
.player-modal-content {
    width:min(800px,94vw); max-height:80vh; overflow-y:auto;
    background:var(--surface); border-radius:var(--radius-lg); padding:2rem;
    border:1px solid var(--border); box-shadow:var(--shadow-lg);
    animation:slideModal .35s cubic-bezier(.4,0,.2,1) both;
}
.pm-search-row {
    display:flex; gap:.75rem; margin-bottom:1.25rem;
}
.pm-search-row input {
    flex:1; padding:.7rem 1rem; border-radius:var(--radius); font-size:.95rem;
    border:1px solid var(--border); background:var(--surface-strong); color:var(--text);
    font-family:"DM Sans",system-ui,sans-serif; transition:border-color .2s,box-shadow .2s;
}
.pm-search-row input:focus {
    border-color:var(--brand); box-shadow:0 0 0 3px var(--brand-glow); outline:none;
}

/* ═══ Generic Cards ═══ */
.card {
    padding:1.25rem; border-radius:var(--radius); border:1px solid var(--border);
    background:var(--surface-strong); display:flex; flex-direction:column; gap:.75rem;
    transition:all .25s ease; animation:fadeUp .4s cubic-bezier(.4,0,.2,1) both;
}
.card:hover { border-color:color-mix(in srgb,var(--brand) 40%,transparent); box-shadow:0 4px 20px var(--brand-glow); }
.card p { margin:0; }
.card h3 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; margin:0; }
.role-icon,.gamemode-icon { width:48px; height:48px; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,.15)); }

/* Gamemode grid */
.gamemode-grid {
    display:grid; gap:1rem; grid-template-columns:repeat(3,1fr);
}
.gamemode-grid .card { display:flex; flex-direction:column; gap:.5rem; }
@media(max-width:700px) { .gamemode-grid { grid-template-columns:1fr; } }
@media(min-width:701px) and (max-width:950px) { .gamemode-grid { grid-template-columns:repeat(2,1fr); } }

/* ═══ Map Cards ═══ */
.maps-grid {
    display:grid; gap:1rem; grid-template-columns:repeat(2,1fr);
}
.map-card { display:flex; flex-direction:column; gap:.75rem; }
.map-card img {
    width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:12px;
    transition:transform .4s ease,box-shadow .3s ease;
}
.map-card:hover img { transform:scale(1.02); box-shadow:var(--shadow); }
@media(max-width:700px) { .maps-grid { grid-template-columns:1fr; } }

/* ═══ Modal ═══ */
.modal {
    position:fixed; inset:0; background:rgba(2,6,23,.75);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; justify-content:center; align-items:center; padding:1.5rem; z-index:50;
}
.modal.hidden { display:none; }
.modal-content {
    width:min(1000px,94vw); max-height:85vh; overflow-y:auto;
    background:var(--surface); border-radius:var(--radius-lg); padding:2.5rem;
    border:1px solid var(--border); box-shadow:var(--shadow-lg);
    animation:slideModal .35s cubic-bezier(.4,0,.2,1) both;
}
.modal-content h2 { margin-top:0; }
.hero-name-role {
    font-size:0; height:0; margin:0; padding:0; overflow:hidden; line-height:0;
}
.ability-box { border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; margin-bottom:1rem; transition:border-color .2s ease; }
.ability-box:hover { border-color:color-mix(in srgb,var(--brand) 50%,transparent); }
.ability-header {
    display:flex; justify-content:space-between; align-items:center; background:var(--surface-strong);
    padding:.6rem .85rem; font-weight:700; font-family:"Rajdhani",system-ui,sans-serif;
    font-size:1.05rem; text-transform:uppercase; letter-spacing:.02em;
}
.ability-details { display:flex; gap:1rem; align-items:center; padding:.85rem; font-size:.95rem; line-height:1.5; }
.ability-image { width:56px; height:56px; background:#0b1120; border-radius:50%; object-fit:contain; padding:6px; flex-shrink:0; }
.ability-wide-image { width:120px; height:72px; background:#0b1120; border-radius:14px; object-fit:contain; padding:6px; flex-shrink:0; }
.hero-description { margin-bottom:1rem; color:var(--muted); font-size:1.05rem; line-height:1.6; }
.hero-lore { margin-bottom:.75rem; }
.lore-toggle { margin-bottom:1.25rem; }

/* ═══ Hero Detail — Blitz-style ═══ */
.hd-header {
    display:flex; gap:1.5rem; align-items:flex-start; padding-bottom:1.25rem;
    margin-bottom:1.25rem; border-bottom:1px solid var(--border);
}
.hd-portrait {
    width:120px; height:120px; border-radius:var(--radius); object-fit:cover;
    border:3px solid var(--border); flex-shrink:0;
    box-shadow:var(--shadow);
}
.hd-info { flex:1; min-width:0; }
.hd-info .hd-name {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:2rem;
    text-transform:uppercase; letter-spacing:.04em; margin:0; line-height:1.1;
    color:var(--brand);
}
.hd-info .hd-role-pill {
    display:inline-flex; align-items:center; gap:.35rem; border-radius:999px;
    padding:.25rem .65rem; font-size:.78rem; font-weight:700;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:uppercase;
    letter-spacing:.04em; margin:.4rem 0 .6rem;
}
.hd-role-pill.tank { background:var(--tank-bg); color:var(--tank); border:1px solid color-mix(in srgb,var(--tank) 25%,transparent); }
.hd-role-pill.damage { background:var(--damage-bg); color:var(--damage); border:1px solid color-mix(in srgb,var(--damage) 25%,transparent); }
.hd-role-pill.support { background:var(--support-bg); color:var(--support); border:1px solid color-mix(in srgb,var(--support) 25%,transparent); }
.hd-desc { color:var(--muted); font-size:.95rem; line-height:1.5; margin:0; }

/* Stats strip */
.hd-stats-section { margin-bottom:1.5rem; }
.hd-stats-bar {
    display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; flex-wrap:wrap; gap:.5rem;
}
.hd-stats-bar h4 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1rem; text-transform:uppercase; letter-spacing:.04em; margin:0; }
.hd-stats-bar h4::after { content:''; display:inline-block; width:24px; height:2px; background:var(--brand); border-radius:1px; margin-left:.4rem; vertical-align:middle; }
.hd-mode-toggles { display:flex; gap:.3rem; }
.hd-mode-btn {
    border:1px solid var(--border); background:var(--surface-strong); color:var(--muted);
    padding:.25rem .6rem; border-radius:8px; font-size:.72rem; font-weight:700;
    font-family:"Rajdhani",system-ui,sans-serif; cursor:pointer; text-transform:uppercase;
    letter-spacing:.04em; transition:all .2s ease;
}
.hd-mode-btn:hover { border-color:var(--brand); color:var(--brand); }
.hd-mode-btn.active { background:var(--brand); color:#fff; border-color:var(--brand); }
.hd-stats-grid {
    display:grid; gap:.6rem; grid-template-columns:repeat(3,1fr);
}
.hd-stat-card {
    padding:1rem; border-radius:var(--radius); border:1px solid var(--border);
    background:var(--surface-strong); text-align:center; position:relative; overflow:hidden;
}
.hd-stat-card::before {
    content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); opacity:0; transition:opacity .3s;
}
.hd-stat-card:hover::before { opacity:1; }
.hd-stat-card .hd-stat-value {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.8rem;
    line-height:1; position:relative;
}
.hd-stat-card .hd-stat-label {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:600; font-size:.72rem;
    color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-top:.2rem; position:relative;
}
.hd-stat-card .hd-stat-bar {
    height:4px; background:var(--surface); border-radius:2px; overflow:hidden;
    margin-top:.5rem; position:relative;
}
.hd-stat-card .hd-stat-bar-fill { height:100%; border-radius:2px; transition:width .6s ease; }
.hd-stat-card.hd-tier .hd-stat-value { font-size:2rem; }
.hd-no-stats {
    padding:1rem; border-radius:var(--radius); background:var(--surface-strong);
    border:1px solid var(--border); color:var(--muted); text-align:center;
    font-family:"Rajdhani",system-ui,sans-serif; font-size:.9rem;
}

/* Ability section in detail */
.hd-abilities-section { margin-bottom:1.5rem; }
.hd-abilities-section h4 {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1rem;
    text-transform:uppercase; letter-spacing:.04em; margin:0 0 .75rem;
}
.hd-abilities-section h4::after {
    content:''; display:inline-block; width:24px; height:2px; background:var(--brand);
    border-radius:1px; margin-left:.4rem; vertical-align:middle;
}

/* Lore section in detail */
.hd-lore-section { margin-bottom:1rem; }
.hd-lore-section h4 {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1rem;
    text-transform:uppercase; letter-spacing:.04em; margin:0 0 .5rem; color:var(--muted);
}
.hd-lore-section h4::after {
    content:''; display:inline-block; width:24px; height:2px; background:var(--border);
    border-radius:1px; margin-left:.4rem; vertical-align:middle;
}
.hd-lore-content { color:var(--muted); font-size:.9rem; line-height:1.6; }
.hd-lore-content p { margin:0 0 .5rem; }

@media(max-width:720px) {
    .hd-header { flex-direction:column; align-items:center; text-align:center; }
    .hd-portrait { width:96px; height:96px; }
    .hd-stats-grid { grid-template-columns:1fr; }
    .hd-stats-bar { flex-direction:column; align-items:stretch; }
}

/* ═══ Status indicator ═══ */
.status {
    padding:.65rem .85rem; border-radius:10px; background:var(--surface-strong);
    border:1px solid var(--border); color:var(--muted); font-family:"DM Sans",system-ui,sans-serif;
}

/* ═══ Footer ═══ */
footer { padding:2rem 0 3rem; color:var(--muted); text-align:center; font-size:.85rem; }
footer p { opacity:.6; margin:0; }

/* ════════════════════
   META TABLE
   ════════════════════ */
.meta-table-wrapper { overflow-x:auto; border-radius:var(--radius); }
.meta-table {
    width:100%; border-collapse:separate; border-spacing:0;
    border-radius:var(--radius); overflow:hidden; border:1px solid var(--border);
}
.meta-table thead th {
    background:var(--surface-strong); padding:.55rem .65rem; text-align:left;
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:.78rem;
    text-transform:uppercase; letter-spacing:.04em; color:var(--muted); border-bottom:1px solid var(--border);
    transition:color .15s ease, background .15s ease;
}
.meta-table thead th[data-sort-col] { cursor:pointer; }
.meta-table thead th[data-sort-col]:hover { color:var(--text); background:color-mix(in srgb, var(--surface-strong) 80%, var(--brand)); }
.meta-table thead th.sort-active { color:var(--brand); }
.sort-arrow { font-size:.65rem; margin-left:.2rem; opacity:.8; }
.meta-table tbody td { padding:.5rem .65rem; border-bottom:1px solid var(--border); font-size:.85rem; }
.meta-table tbody tr:last-child td { border-bottom:none; }
.meta-table tbody tr { transition:background .15s ease; }
.meta-table tbody tr:hover { background:var(--surface-strong); }
.meta-hero-cell {
    display:flex; align-items:center; gap:.6rem; font-weight:600;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:capitalize;
}
.meta-hero-portrait { width:36px; height:36px; border-radius:50%; object-fit:cover; border:2px solid var(--border); }
.stat-bar-wrapper { display:flex; align-items:center; gap:.5rem; }
.stat-bar { flex:1; height:8px; background:var(--surface-strong); border-radius:4px; overflow:hidden; min-width:40px; }
.stat-bar-fill { height:100%; border-radius:4px; transition:width .6s cubic-bezier(.4,0,.2,1); }
.stat-bar-fill.pickrate { background:var(--brand); }
.stat-bar-fill.winrate { background:var(--accent); }
.stat-value-label { min-width:42px; text-align:right; font-weight:600; font-family:"Rajdhani",system-ui,sans-serif; font-size:.85rem; }

/* Tier badges */
.tier-badge {
    display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px;
    border-radius:8px; font-family:"Rajdhani",system-ui,sans-serif; font-weight:700;
    font-size:.82rem; flex-shrink:0;
}
.tier-s { background:rgba(255,106,0,.15); color:var(--tier-s); border:1px solid rgba(255,106,0,.3); }
.tier-a { background:rgba(34,197,94,.12); color:var(--tier-a); border:1px solid rgba(34,197,94,.3); }
.tier-b { background:rgba(59,130,246,.12); color:var(--tier-b); border:1px solid rgba(59,130,246,.3); }
.tier-c { background:rgba(168,85,247,.12); color:var(--tier-c); border:1px solid rgba(168,85,247,.3); }
.tier-d { background:rgba(107,114,128,.12); color:var(--tier-d); border:1px solid rgba(107,114,128,.3); }

/* ════════════════════
   PLAYER SEARCH
   ════════════════════ */
.player-results-grid { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
.player-result-card {
    display:flex; align-items:center; gap:1rem; padding:1rem; border-radius:var(--radius);
    border:1px solid var(--border); background:var(--surface-strong); cursor:pointer;
    transition:all .25s ease;
}
.player-result-card:hover { border-color:var(--brand); box-shadow:0 4px 16px var(--brand-glow); transform:translateY(-2px); }
.player-result-avatar { width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid var(--border); flex-shrink:0; }
.player-result-info { flex:1; min-width:0; }
.player-result-info h4 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.1rem; margin:0; }
.player-result-info p { margin:0; font-size:.85rem; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.player-result-badge {
    padding:.2rem .5rem; border-radius:6px; font-size:.72rem; font-weight:600;
    font-family:"Rajdhani",system-ui,sans-serif; text-transform:uppercase; flex-shrink:0;
}
.player-result-badge.public { background:rgba(34,197,94,.12); color:var(--support); }
.player-result-badge.private { background:rgba(239,68,68,.12); color:var(--damage); }
.search-results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:.5rem; }
.search-results-header h3 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; margin:0; }

/* ════════════════════
   PLAYER PROFILE
   ════════════════════ */
.player-profile-header {
    display:flex; gap:1.5rem; align-items:center; flex-wrap:wrap; margin-bottom:1.5rem;
    padding-bottom:1.5rem; border-bottom:1px solid var(--border);
}
.player-profile-avatar {
    width:96px; height:96px; border-radius:50%; object-fit:cover;
    border:3px solid var(--brand); box-shadow:0 4px 20px var(--brand-glow);
}
.player-profile-info h3 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.8rem; margin:0; text-transform:uppercase; }
.player-profile-info p { margin:.2rem 0; color:var(--muted); }
.player-namecard { width:100%; max-height:120px; object-fit:cover; border-radius:var(--radius); margin-bottom:1rem; }
.back-to-search { margin-bottom:1rem; }

/* Donut chart */
.donut-container { display:flex; align-items:center; justify-content:center; gap:2rem; flex-wrap:wrap; margin-bottom:1.5rem; }
.donut-chart { position:relative; width:140px; height:140px; flex-shrink:0; }
.donut-chart svg { width:100%; height:100%; transform:rotate(-90deg); }
.donut-chart .donut-ring { fill:none; stroke:var(--surface-strong); stroke-width:12; }
.donut-chart .donut-segment { fill:none; stroke-width:12; stroke-linecap:round; animation:donutFill 1s ease-out forwards; }
.donut-chart .donut-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.donut-chart .donut-value { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.8rem; line-height:1; }
.donut-chart .donut-desc { font-family:"Rajdhani",system-ui,sans-serif; font-size:.72rem; color:var(--muted); text-transform:uppercase; font-weight:600; }
.donut-stats-side { display:grid; gap:.5rem; min-width:200px; }
.ds-row { display:flex; justify-content:space-between; align-items:center; padding:.35rem 0; border-bottom:1px solid var(--border); }
.ds-row:last-child { border-bottom:none; }
.ds-label { font-family:"Rajdhani",system-ui,sans-serif; font-weight:600; font-size:.85rem; color:var(--muted); text-transform:uppercase; }
.ds-value { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.05rem; }

/* Stat cards */
.stats-grid { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); margin-bottom:1.5rem; }
.stat-card {
    padding:1rem; border-radius:var(--radius); border:1px solid var(--border);
    background:var(--surface-strong); text-align:center; transition:all .25s ease;
    position:relative; overflow:hidden;
}
.stat-card::before {
    content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, var(--brand-subtle), transparent 70%); opacity:0; transition:opacity .3s;
}
.stat-card:hover { border-color:color-mix(in srgb,var(--brand) 40%,transparent); }
.stat-card:hover::before { opacity:1; }
.stat-card .stat-number { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.5rem; color:var(--brand); position:relative; }
.stat-card .stat-label { font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; font-family:"Rajdhani",system-ui,sans-serif; font-weight:600; position:relative; }

/* Rank cards */
.rank-cards-grid { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); margin-bottom:1.5rem; }
.rank-card {
    display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:1rem;
    border-radius:var(--radius); border:1px solid var(--border); background:var(--surface-strong); text-align:center;
}
.rank-card h4 { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; text-transform:uppercase; margin:0; font-size:.95rem; }
.rank-card img { width:48px; height:48px; }
.rank-card p { margin:0; font-weight:600; font-family:"Rajdhani",system-ui,sans-serif; text-transform:capitalize; }

/* Subsection titles */
.sub-title {
    font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:1.15rem;
    text-transform:uppercase; letter-spacing:.04em; margin:1.5rem 0 .75rem; display:inline-block;
}
.sub-title::after { content:''; display:block; width:32px; height:2px; background:var(--brand); border-radius:1px; margin-top:4px; }

/* Role breakdown bars */
.role-breakdown { display:grid; gap:.75rem; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); margin-bottom:1.5rem; }
.role-bar-card { padding:1rem; border-radius:var(--radius); border:1px solid var(--border); background:var(--surface-strong); }
.rbc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
.rbc-role { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; text-transform:uppercase; font-size:.95rem; }
.rbc-wr { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:.85rem; }
.rbc-bar { height:8px; background:var(--surface); border-radius:4px; overflow:hidden; margin-bottom:.35rem; }
.rbc-bar-fill { height:100%; border-radius:4px; transition:width .6s ease; }
.rbc-meta { font-size:.78rem; color:var(--muted); }

/* Hero time bars */
.hero-time-list { display:flex; flex-direction:column; gap:.5rem; }
.hero-time-row {
    display:grid; grid-template-columns:40px 1fr auto; gap:.75rem; align-items:center;
    padding:.5rem .75rem; border-radius:10px; background:var(--surface-strong); border:1px solid var(--border);
    transition:border-color .2s ease;
}
.hero-time-row:hover { border-color:color-mix(in srgb,var(--brand) 40%,transparent); }
.hero-time-row img { width:36px; height:36px; border-radius:50%; object-fit:cover; }
.htb-name { font-family:"Rajdhani",system-ui,sans-serif; font-weight:700; font-size:.88rem; text-transform:capitalize; }
.htb-bar { height:6px; background:var(--surface); border-radius:3px; overflow:hidden; margin-top:.15rem; }
.htb-bar-fill { height:100%; border-radius:3px; background:var(--brand); transition:width .6s ease; }
.hero-time-stats { font-family:"Rajdhani",system-ui,sans-serif; font-weight:600; font-size:.82rem; color:var(--brand); text-align:right; white-space:nowrap; }

/* ═══ Scrollbar ═══ */
::-webkit-scrollbar { width:8px; }
::-webkit-scrollbar-track { background:var(--surface); }
::-webkit-scrollbar-thumb { background:var(--surface-strong); border-radius:4px; }
::-webkit-scrollbar-thumb:hover { background:var(--muted); }

/* ═══ Responsive ═══ */
@media(max-width:720px) {
    .section-card { padding:1.25rem; }
    .splash-inner { padding:2rem 1.25rem 1.5rem; }
    .hero-card img { height:160px; }
    .map-card { grid-template-columns:1fr; }
    .modal-content { padding:1.5rem; border-radius:18px; }
    .grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); }
    .ability-details { flex-direction:column; align-items:flex-start; }
    .donut-container { flex-direction:column; }
    .search-hero { flex-direction:column; }
    .search-hero input { padding:.85rem 1rem .85rem 2.8rem; }
    .hero-portrait-strip img { width:40px; height:40px; }
    .ql-grid { grid-template-columns:1fr; }
    .meta-table thead th { padding:.4rem .45rem; font-size:.7rem; }
    .meta-table tbody td { padding:.4rem .45rem; font-size:.78rem; }
    .stat-bar { min-width:28px; }
    .stat-value-label { min-width:36px; font-size:.75rem; }
    .meta-hero-portrait { width:28px; height:28px; }
    .meta-hero-cell { gap:.35rem; font-size:.78rem; }
}
@media(min-width:900px) {
    .maps-grid { grid-template-columns:repeat(3,1fr); }
}
    `;
}

/* ════════════════════════════════════════════
   JavaScript Generation (app.js)
   ════════════════════════════════════════════ */

function generateScript({ heroes, roles, gamemodes, maps, buildInfo, baseUrl }) {
    return `
const DATA = ${JSON.stringify({ heroes, roles, gamemodes, maps, buildInfo })};
const API = ${JSON.stringify(baseUrl)};

const state = { heroSearch:'', heroRole:'all', mapSearch:'', gamemodeSearch:'', metaLoaded:false };

const norm = t => (t||'').toString().toLowerCase().trim();
const esc = v => String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,"&#39;");

function setTheme(t) {
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('uw-theme',t);
    const b=document.getElementById('themeToggle');
    if(b) b.textContent=t==='dark'?'Light Mode':'Dark Mode';
}
function initTheme() {
    const s=localStorage.getItem('uw-theme');
    if(s){setTheme(s);return;}
    setTheme(window.matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light');
}

function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active',b.dataset.section===id));
}
function showSection(id) {
    document.querySelectorAll('section.content').forEach(s => s.classList.add('hidden'));
    const el=document.getElementById(id);
    if(el){el.classList.remove('hidden');setActiveNav(id);history.replaceState(null,'','#'+id);}
    if(id==='meta'){if(!state.metaLoaded){state.metaLoaded=true;fetchHeroStats();}startMetaAutoRefresh();}else{stopMetaAutoRefresh();}
}

function applyFilter(sel,val) {
    const s=norm(val);
    document.querySelectorAll(sel).forEach(c => {
        c.style.display=(!s||norm(c.dataset.name).includes(s))?'':'none';
    });
}

var heroStatsCache={};
async function fetchHeroStatsCached(platform,gamemode,region){
    region=region||'europe';
    var ck=platform+'_'+gamemode+'_'+region;
    if(heroStatsCache[ck]) return heroStatsCache[ck];
    try{
        var r=await fetch(API+'/heroes/stats?platform='+platform+'&gamemode='+gamemode+'&region='+region+'&order_by=pickrate:desc');
        if(!r.ok) throw new Error('HTTP '+r.status);
        var d=await r.json(); heroStatsCache[ck]=d; return d;
    }catch(e){console.warn('Hero stats fetch failed:',e.message);return null;}
}

function buildHeroStatCards(stats,heroKey,allStats){
    if(!stats||!allStats) return '<div class="hd-no-stats">Stats not available for this mode.</div>';
    var hs=allStats.find(function(s){return s.hero===heroKey;});
    if(!hs) return '<div class="hd-no-stats">No stats found for this hero in this mode.</div>';
    var maxP=Math.max.apply(null,allStats.map(function(s){return s.pickrate;}));
    var tier=getTier(hs.pickrate,maxP,hs.winrate);
    var wc=hs.winrate>=50?'var(--accent)':'var(--damage)';
    var pw=maxP>0?(hs.pickrate/maxP*100):0;
    var rank=allStats.findIndex(function(s){return s.hero===heroKey;})+1;
    return '<div class="hd-stats-grid">'+
        '<div class="hd-stat-card hd-tier"><div class="hd-stat-value"><span class="tier-badge '+tier.c+'" style="width:36px;height:36px;font-size:1.1rem;border-radius:10px">'+tier.l+'</span></div><div class="hd-stat-label">Tier \u00b7 #'+rank+' of '+allStats.length+'</div></div>'+
        '<div class="hd-stat-card"><div class="hd-stat-value" style="color:var(--brand)">'+hs.pickrate.toFixed(2)+'%</div><div class="hd-stat-label">Pick Rate</div><div class="hd-stat-bar"><div class="hd-stat-bar-fill" style="width:'+pw.toFixed(1)+'%;background:var(--brand)"></div></div></div>'+
        '<div class="hd-stat-card"><div class="hd-stat-value" style="color:'+wc+'">'+hs.winrate.toFixed(2)+'%</div><div class="hd-stat-label">Win Rate</div><div class="hd-stat-bar"><div class="hd-stat-bar-fill" style="width:'+hs.winrate.toFixed(1)+'%;background:'+wc+'"></div></div></div>'+
        '</div>';
}

async function showHeroDetails(key) {
    const hero=DATA.heroes.find(h=>h.key===key); if(!hero) return;
    const modal=document.getElementById('heroModal');
    document.getElementById('modalHeroName').textContent='';
    const det=document.getElementById('modalHeroDetails');
    det.innerHTML='<div class="status" style="animation:pulse 1.5s infinite">Loading hero data &amp; stats...</div>';
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    try {
        var [r1,r2]=await Promise.allSettled([
            fetch(API+'/heroes/'+key),
            fetchHeroStatsCached('pc','competitive','europe')
        ]);
        var d=r1.status==='fulfilled'&&r1.value.ok?await r1.value.json():null;
        var allStats=r2.status==='fulfilled'?r2.value:null;
        if(!d){det.innerHTML='<div class="status">Error loading hero details.</div>';return;}

        var roleCap=hero.role.charAt(0).toUpperCase()+hero.role.slice(1);
        var h='';

        /* ── Header: portrait + info ── */
        h+='<div class="hd-header">';
        h+='<img class="hd-portrait" src="'+hero.portrait+'" alt="'+esc(hero.name)+'" />';
        h+='<div class="hd-info">';
        h+='<h2 class="hd-name">'+esc(hero.name)+'</h2>';
        h+='<span class="hd-role-pill '+hero.role+'">'+roleCap+'</span>';
        h+='<p class="hd-desc">'+esc(d.description)+'</p>';
        h+='</div></div>';

        /* ── Statistics section ── */
        h+='<div class="hd-stats-section">';
        h+='<div class="hd-stats-bar"><h4>Statistics</h4>';
        h+='<div class="hd-mode-toggles">';
        h+='<button type="button" class="hd-mode-btn active" data-gm="competitive">Comp</button>';
        h+='<button type="button" class="hd-mode-btn" data-gm="quickplay">QP</button>';
        h+='<span style="width:1px;background:var(--border);margin:0 .15rem"></span>';
        h+='<button type="button" class="hd-mode-btn active" data-pf="pc">PC</button>';
        h+='<button type="button" class="hd-mode-btn" data-pf="console">Console</button>';
        h+='<span style="width:1px;background:var(--border);margin:0 .15rem"></span>';
        h+='<button type="button" class="hd-mode-btn active" data-rg="europe">EU</button>';
        h+='<button type="button" class="hd-mode-btn" data-rg="americas">NA</button>';
        h+='<button type="button" class="hd-mode-btn" data-rg="asia">Asia</button>';
        h+='</div></div>';
        h+='<div id="hdStatsContent">'+buildHeroStatCards(allStats,key,allStats)+'</div>';
        h+='</div>';

        /* ── Abilities ── */
        h+='<div class="hd-abilities-section"><h4>Abilities</h4>';
        var abs=(d.abilities||[]).map(function(a,i){
            var icon=a.icon?(i===0?'<img src="'+a.icon+'" alt="" class="ability-wide-image">':'<img src="'+a.icon+'" alt="" class="ability-image">'):'';
            return '<div class="ability-box"><div class="ability-header">'+esc(a.name)+'</div><div class="ability-details">'+icon+'<div>'+esc(a.description)+'</div></div></div>';
        }).join('');
        h+=abs||'<p class="muted">None listed.</p>';
        h+='</div>';

        /* ── Lore (collapsed by default) ── */
        var chaps=d.story?.chapters||[];
        var fullLore=chaps.length?chaps.map(function(c){return '<p>'+esc(c.content)+'</p>';}).join(''):'<p class="muted">No lore available.</p>';
        var shortLore=chaps.length?chaps.slice(0,2).map(function(c){return '<p>'+esc(c.content)+'</p>';}).join(''):'<p class="muted">No lore available.</p>';
        var more=chaps.length>2;
        h+='<div class="hd-lore-section"><h4>Lore &amp; Background</h4>';
        h+='<div class="hd-lore-content" id="heroLore">'+shortLore+'</div>';
        if(more) h+='<button type="button" id="loreToggle" class="btn btn-ghost btn-sm" style="margin-top:.5rem">Show more</button>';
        h+='</div>';

        det.innerHTML=h;

        /* ── Wire up mode toggles ── */
        var curGM='competitive',curPF='pc',curRG='europe';
        async function refreshHeroStats(){
            var sc=document.getElementById('hdStatsContent');
            sc.innerHTML='<div class="hd-no-stats" style="animation:pulse 1.5s infinite">Loading...</div>';
            var st=await fetchHeroStatsCached(curPF,curGM,curRG);
            sc.innerHTML=buildHeroStatCards(st,key,st);
        }
        det.querySelectorAll('.hd-mode-btn[data-gm]').forEach(function(b){
            b.addEventListener('click',function(){
                curGM=b.dataset.gm;
                det.querySelectorAll('.hd-mode-btn[data-gm]').forEach(function(x){x.classList.toggle('active',x.dataset.gm===curGM);});
                refreshHeroStats();
            });
        });
        det.querySelectorAll('.hd-mode-btn[data-pf]').forEach(function(b){
            b.addEventListener('click',function(){
                curPF=b.dataset.pf;
                det.querySelectorAll('.hd-mode-btn[data-pf]').forEach(function(x){x.classList.toggle('active',x.dataset.pf===curPF);});
                refreshHeroStats();
            });
        });
        det.querySelectorAll('.hd-mode-btn[data-rg]').forEach(function(b){
            b.addEventListener('click',function(){
                curRG=b.dataset.rg;
                det.querySelectorAll('.hd-mode-btn[data-rg]').forEach(function(x){x.classList.toggle('active',x.dataset.rg===curRG);});
                refreshHeroStats();
            });
        });

        /* ── Wire up lore toggle ── */
        if(more){
            var exp=false,tb=document.getElementById('loreToggle'),lc=document.getElementById('heroLore');
            if(tb&&lc) tb.addEventListener('click',function(){exp=!exp;lc.innerHTML=exp?fullLore:shortLore;tb.textContent=exp?'Show less':'Show more';});
        }
    } catch(e) { det.innerHTML='<div class="status">Error loading hero details.</div>'; }
}
function closeModal() { const m=document.getElementById('heroModal'); m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }

function fmtTag(v){return v.trim().replace('#','-');}
function fmtDur(s){return s<3600?Math.round(s/60)+'m':Math.round(s/3600)+'h';}

function buildDonut(wr) {
    const c=251.2, d=(wr/100)*c, col=wr>=50?'var(--accent)':'var(--damage)';
    return '<div class="donut-chart"><svg viewBox="0 0 90 90"><circle class="donut-ring" cx="45" cy="45" r="40"/><circle class="donut-segment" cx="45" cy="45" r="40" stroke="'+col+'" stroke-dasharray="'+d.toFixed(1)+' '+c+'"/></svg><div class="donut-label"><span class="donut-value" style="color:'+col+'">'+wr.toFixed(1)+'%</span><span class="donut-desc">Win Rate</span></div></div>';
}

function openPlayerModal(prefill) {
    var m=document.getElementById('playerModal'); if(!m) return;
    m.classList.remove('hidden');
    var pi=document.getElementById('playerInput');
    if(pi && prefill) { pi.value=prefill; searchPlayer(); } else if(pi && !prefill) { pi.focus(); }
}
function closePlayerModal() {
    var m=document.getElementById('playerModal'); if(!m) return;
    m.classList.add('hidden');
    var rd=document.getElementById('playerSearchResults'), pd=document.getElementById('playerProfile');
    if(rd) rd.innerHTML=''; if(pd){pd.innerHTML='';pd.classList.add('hidden');}
}

function overviewSearch() {
    var inp=document.getElementById('ovSearch'); if(!inp) return;
    var v=inp.value.trim(); if(!v) return;
    openPlayerModal(v);
}

async function searchPlayer() {
    const pi=document.getElementById('playerInput'), rd=document.getElementById('playerSearchResults'), pd=document.getElementById('playerProfile');
    if(!pi||!rd) return;
    const raw=pi.value.trim(); if(!raw){rd.innerHTML='<div class="status">Enter a username or BattleTag.</div>';return;}
    rd.innerHTML='<div class="status" style="animation:pulse 1.5s infinite">Searching...</div>';
    rd.classList.remove('hidden'); if(pd) pd.classList.add('hidden');
    try {
        const r=await fetch(API+'/players?name='+encodeURIComponent(fmtTag(raw)));
        if(!r.ok) throw new Error();
        const data=await r.json();
        if(!data.results||!data.results.length){rd.innerHTML='<div class="status">No players found for "'+esc(raw)+'".</div>';return;}
        rd.innerHTML='<div class="search-results-header"><h3>'+data.total+' player'+(data.total!==1?'s':'')+' found</h3></div><div class="player-results-grid">'+
            data.results.map(p=>{
                const pub=p.is_public!==false;
                return '<div class="player-result-card" data-pid="'+esc(p.player_id)+'"><img class="player-result-avatar" src="'+(p.avatar||'https://d15f34w2p8l1cc.cloudfront.net/overwatch/daeddd96e58a2150afa6ffc3c5503ae7f96afc2e22899210d444f45dee508c6c.png')+'" alt="" loading="lazy"/><div class="player-result-info"><h4>'+esc(p.name)+'</h4><p>'+esc(p.player_id)+'</p>'+(p.title?'<p>'+esc(p.title)+'</p>':'')+'</div><span class="player-result-badge '+(pub?'public':'private')+'">'+(pub?'Public':'Private')+'</span></div>';
            }).join('')+'</div>';
        rd.querySelectorAll('.player-result-card').forEach(c=>c.addEventListener('click',()=>loadProfile(c.dataset.pid)));
    } catch(e) { rd.innerHTML='<div class="status">Search error. Please try again.</div>'; }
}

async function loadProfile(pid) {
    var rd=document.getElementById('playerSearchResults'),pd=document.getElementById('playerProfile');
    if(!pd) return;
    pd.classList.remove('hidden');
    pd.innerHTML='<div class="status" style="animation:pulse 1.5s infinite">Loading profile...</div>';
    if(rd) rd.classList.add('hidden');
    try {
        var [r1,r2]=await Promise.allSettled([
            fetch(API+'/players/'+encodeURIComponent(pid)+'/summary'),
            fetch(API+'/players/'+encodeURIComponent(pid)+'/stats/summary')
        ]);
        var sum=r1.status==='fulfilled'&&r1.value.ok?await r1.value.json():null;
        var sts=r2.status==='fulfilled'&&r2.value.ok?await r2.value.json():null;
        if(!sum){pd.innerHTML='<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\\u2190 Back</button><div class="status">Profile not found or private.</div>';document.getElementById('backBtn').addEventListener('click',backToSearch);return;}

        var h='<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\\u2190 Back to results</button>';
        if(sum.namecard) h+='<img class="player-namecard" src="'+sum.namecard+'" alt="" loading="lazy"/>';
        h+='<div class="player-profile-header"><img class="player-profile-avatar" src="'+(sum.avatar||'https://d15f34w2p8l1cc.cloudfront.net/overwatch/daeddd96e58a2150afa6ffc3c5503ae7f96afc2e22899210d444f45dee508c6c.png')+'" alt=""/><div class="player-profile-info"><h3>'+esc(sum.username||'Unknown')+'</h3><p>'+esc(sum.title||'No title')+'</p>'+(sum.endorsement?'<p>Endorsement Level '+sum.endorsement.level+'</p>':'')+'</div></div>';

        var comp=sum.competitive;
        if(comp){
            h+='<h4 class="sub-title">Competitive Ranks</h4>';
            [['pc','PC'],['console','Console']].forEach(function(pair){
                var plat=comp[pair[0]]; if(!plat) return;
                if(plat.season) h+='<p class="muted" style="margin-bottom:.4rem">Season '+plat.season+' \\u2014 '+pair[1]+'</p>';
                h+='<div class="rank-cards-grid">';
                ['tank','damage','support','open'].forEach(function(role){
                    var rk=plat[role]; if(!rk) return;
                    h+='<div class="rank-card"><h4>'+role.charAt(0).toUpperCase()+role.slice(1)+'</h4><img src="'+rk.rank_icon+'" alt=""/><p>'+rk.division+' '+rk.tier+'</p></div>';
                });
                h+='</div>';
            });
        }

        if(sts&&sts.general){
            var g=sts.general;
            h+='<h4 class="sub-title">Performance Overview</h4><div class="donut-container">'+buildDonut(g.winrate)+
                '<div class="donut-stats-side">'+
                '<div class="ds-row"><span class="ds-label">Games</span><span class="ds-value">'+g.games_played.toLocaleString()+'</span></div>'+
                '<div class="ds-row"><span class="ds-label">Wins</span><span class="ds-value" style="color:var(--accent)">'+g.games_won.toLocaleString()+'</span></div>'+
                '<div class="ds-row"><span class="ds-label">Losses</span><span class="ds-value" style="color:var(--damage)">'+(g.games_played-g.games_won).toLocaleString()+'</span></div>'+
                '<div class="ds-row"><span class="ds-label">KDA</span><span class="ds-value">'+g.kda.toFixed(2)+'</span></div>'+
                '<div class="ds-row"><span class="ds-label">Time</span><span class="ds-value">'+fmtDur(g.time_played)+'</span></div>'+
                '</div></div>';
            h+='<h4 class="sub-title">Combat Stats</h4><div class="stats-grid">'+
                '<div class="stat-card"><div class="stat-number">'+g.total.eliminations.toLocaleString()+'</div><div class="stat-label">Eliminations</div></div>'+
                '<div class="stat-card"><div class="stat-number">'+g.total.deaths.toLocaleString()+'</div><div class="stat-label">Deaths</div></div>'+
                '<div class="stat-card"><div class="stat-number">'+g.total.damage.toLocaleString()+'</div><div class="stat-label">Damage</div></div>'+
                '<div class="stat-card"><div class="stat-number">'+g.total.healing.toLocaleString()+'</div><div class="stat-label">Healing</div></div>'+
                '</div>';
        }

        if(sts&&sts.roles){
            h+='<h4 class="sub-title">Role Breakdown</h4><div class="role-breakdown">';
            var totalT=0; ['tank','damage','support'].forEach(function(rk){if(sts.roles[rk]) totalT+=sts.roles[rk].time_played;});
            [['tank','Tank'],['damage','Damage'],['support','Support']].forEach(function(pair){
                var r=sts.roles[pair[0]]; if(!r) return;
                var pct=totalT>0?(r.time_played/totalT*100):0;
                var wc=r.winrate>=50?'var(--accent)':'var(--damage)';
                h+='<div class="role-bar-card"><div class="rbc-header"><span class="rbc-role" style="color:var(--'+pair[0]+')">'+pair[1]+'</span><span class="rbc-wr" style="color:'+wc+'">'+r.winrate.toFixed(1)+'% WR</span></div><div class="rbc-bar"><div class="rbc-bar-fill" style="width:'+pct.toFixed(1)+'%;background:var(--'+pair[0]+')"></div></div><div class="rbc-meta">'+r.games_played.toLocaleString()+' games \\u00b7 '+fmtDur(r.time_played)+' \\u00b7 '+r.kda.toFixed(2)+' KDA</div></div>';
            });
            h+='</div>';
        }

        if(sts&&sts.heroes){
            var entries=Object.entries(sts.heroes).filter(e=>e[1]!==null).sort((a,b)=>b[1].time_played-a[1].time_played).slice(0,10);
            if(entries.length>0){
                var maxT=entries[0][1].time_played;
                h+='<h4 class="sub-title">Top Heroes</h4><div class="hero-time-list">';
                entries.forEach(function(e){
                    var hk=e[0],hs=e[1],hd=DATA.heroes.find(function(x){return x.key===hk;}),pt=hd?hd.portrait:'',dn=hk.replace(/-/g,' ');
                    var bw=maxT>0?(hs.time_played/maxT*100):0, wc=hs.winrate>=50?'var(--accent)':'var(--damage)';
                    h+='<div class="hero-time-row">'+(pt?'<img src="'+pt+'" alt="" loading="lazy"/>':'<div></div>')+'<div><span class="htb-name">'+esc(dn)+'</span><div class="htb-bar"><div class="htb-bar-fill" style="width:'+bw.toFixed(1)+'%"></div></div></div><span class="hero-time-stats"><span style="color:'+wc+'">'+hs.winrate.toFixed(0)+'%</span> \\u00b7 '+fmtDur(hs.time_played)+'</span></div>';
                });
                h+='</div>';
            }
        }
        pd.innerHTML=h;
        document.getElementById('backBtn')?.addEventListener('click',backToSearch);
    } catch(e) {
        pd.innerHTML='<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\\u2190 Back</button><div class="status">Error loading profile.</div>';
        document.getElementById('backBtn')?.addEventListener('click',backToSearch);
    }
}

function backToSearch() {
    var rd=document.getElementById('playerSearchResults'),pd=document.getElementById('playerProfile');
    if(rd)rd.classList.remove('hidden'); if(pd)pd.classList.add('hidden');
}

function getTier(pr,max,wr){
    var pickScore=max>0?(pr/max*100):0;
    var winScore=(wr||50);
    var p=pickScore*0.10+winScore*0.90;
    if(p>=53.10) return{l:'S',c:'tier-s'}; if(p>=50.30) return{l:'A',c:'tier-a'};
    if(p>=47.50) return{l:'B',c:'tier-b'}; if(p>=45.90) return{l:'C',c:'tier-c'};
    return{l:'D',c:'tier-d'};
}

function getMetaScore(pr,max,wr){
    var pickScore=max>0?(pr/max*100):0;
    return pickScore*0.10+(wr||50)*0.90;
}

var metaStatsCache=null, metaMaxP=0, metaSortCol='', metaSortDir='desc';
var tierOrder={S:0,A:1,B:2,C:3,D:4};

function renderMetaTable(stats,maxP){
    var rd=document.getElementById('metaResults');
    if(!stats||!stats.length){rd.innerHTML='<div class="status">No stats available.</div>';return;}
    var cols=[null,'tier','hero','pickrate','winrate'];
    var labels=['#','Tier','Hero','Pickrate','Winrate'];
    var widths=['36px','32px','','',''];
    var t='<div class="meta-table-wrapper"><table class="meta-table"><thead><tr>';
    for(var ci=0;ci<cols.length;ci++){
        var col=cols[ci];
        var w=widths[ci]?'width:'+widths[ci]+';':'';
        if(!col){
            t+='<th style="'+w+'">'+labels[ci]+'</th>';
        } else {
            var active=metaSortCol===col;
            var arrow=active?(metaSortDir==='asc'?' ▲':' ▼'):'';
            t+='<th style="'+w+'cursor:pointer;user-select:none;white-space:nowrap" data-sort-col="'+col+'" class="'+(active?'sort-active':'')+'">'+labels[ci]+'<span class="sort-arrow">'+arrow+'</span></th>';
        }
    }
    t+='</tr></thead><tbody>';
    stats.forEach(function(e,i){
        var hd=DATA.heroes.find(function(h){return h.key===e.hero;}), pt=hd?hd.portrait:'', dn=(e.hero||'').replace(/-/g,' ');
        var wc=e.winrate>=50?'var(--accent)':'var(--damage)', pw=maxP>0?(e.pickrate/maxP*100):0;
        var tier=getTier(e.pickrate,maxP,e.winrate);
        t+='<tr><td style="color:var(--muted);font-weight:600">'+(i+1)+'</td><td><span class="tier-badge '+tier.c+'">'+tier.l+'</span></td><td><div class="meta-hero-cell">'+(pt?'<img class="meta-hero-portrait" src="'+pt+'" alt="" loading="lazy"/>':'')+' <span>'+esc(dn)+'</span></div></td><td><div class="stat-bar-wrapper"><div class="stat-bar"><div class="stat-bar-fill pickrate" style="width:'+pw.toFixed(1)+'%"></div></div><span class="stat-value-label">'+e.pickrate.toFixed(2)+'%</span></div></td><td><div class="stat-bar-wrapper"><div class="stat-bar"><div class="stat-bar-fill winrate" style="width:'+e.winrate+'%;background:'+wc+'"></div></div><span class="stat-value-label">'+e.winrate.toFixed(2)+'%</span></div></td></tr>';
    });
    t+='</tbody></table></div>';
    rd.innerHTML=t;
    rd.querySelectorAll('th[data-sort-col]').forEach(function(th){
        th.addEventListener('click',function(){sortMetaTable(th.dataset.sortCol);});
    });
}

function sortMetaTable(col){
    if(!metaStatsCache) return;
    if(metaSortCol===col) metaSortDir=metaSortDir==='desc'?'asc':'desc';
    else { metaSortCol=col; metaSortDir='desc'; }
    var maxP=metaMaxP;
    var sorted=metaStatsCache.slice().sort(function(a,b){
        var va,vb;
        if(col==='score'){va=getMetaScore(a.pickrate,maxP,a.winrate);vb=getMetaScore(b.pickrate,maxP,b.winrate);}
        else if(col==='tier'){var ta=getTier(a.pickrate,maxP,a.winrate),tb=getTier(b.pickrate,maxP,b.winrate);va=tierOrder[ta.l];vb=tierOrder[tb.l];}
        else if(col==='hero'){va=(a.hero||'').toLowerCase();vb=(b.hero||'').toLowerCase();return metaSortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);}
        else if(col==='pickrate'){va=a.pickrate;vb=b.pickrate;}
        else if(col==='winrate'){va=a.winrate;vb=b.winrate;}
        else{va=0;vb=0;}
        return metaSortDir==='asc'?va-vb:vb-va;
    });
    renderMetaTable(sorted,maxP);
}

var metaRefreshTimer=null;
function startMetaAutoRefresh(){
    stopMetaAutoRefresh();
    metaRefreshTimer=setInterval(fetchHeroStats,60000);
}
function stopMetaAutoRefresh(){if(metaRefreshTimer){clearInterval(metaRefreshTimer);metaRefreshTimer=null;}}

async function fetchHeroStats() {
    var pl=document.getElementById('metaPlatform').value, gm=document.getElementById('metaGamemode').value;
    var rg=document.getElementById('metaRegion').value, rl=document.getElementById('metaRole').value;
    var rk=document.getElementById('metaRank').value;
    var rd=document.getElementById('metaResults');
    if(!rd.children.length) rd.innerHTML='<div class="status" style="animation:pulse 1.5s infinite">Loading hero stats...</div>';
    var url=API+'/heroes/stats?platform='+pl+'&gamemode='+gm+'&region='+rg+'&order_by=pickrate:desc';
    if(rl) url+='&role='+rl;
    if(rk&&gm==='competitive') url+='&competitive_division='+rk;
    try {
        var r=await fetch(url); if(!r.ok) throw new Error();
        var stats=await r.json();
        if(!stats||!stats.length){rd.innerHTML='<div class="status">No stats available.</div>';return;}
        var maxP=Math.max.apply(null,stats.map(function(s){return s.pickrate;}));
        metaStatsCache=stats; metaMaxP=maxP; metaSortCol=''; metaSortDir='desc';
        var sorted=stats.slice().sort(function(a,b){return getMetaScore(b.pickrate,maxP,b.winrate)-getMetaScore(a.pickrate,maxP,a.winrate);});
        renderMetaTable(sorted,maxP);
    } catch(e) { if(!rd.children.length) rd.innerHTML='<div class="status">Error loading stats.</div>'; }
}

function bind() {
    document.querySelectorAll('.hero-card-button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.heroKey)showHeroDetails(b.dataset.heroKey);}));
    document.querySelectorAll('.nav-link').forEach(b=>b.addEventListener('click',()=>showSection(b.dataset.section)));

    var hs=document.getElementById('heroSearch');
    if(hs) hs.addEventListener('input',e=>{
        var q=e.target.value.toLowerCase();
        document.querySelectorAll('.heroes-columns .hero-thumb').forEach(c=>{
            var n=(c.dataset.name||'').toLowerCase();
            c.style.display=n.includes(q)?'':'none';
        });
    });

    var ms=document.getElementById('mapSearch');
    if(ms) ms.addEventListener('input',e=>{state.mapSearch=e.target.value;applyFilter('.map-card',state.mapSearch);});
    var gs=document.getElementById('gamemodeSearch');
    if(gs) gs.addEventListener('input',e=>{state.gamemodeSearch=e.target.value;applyFilter('.gamemode-card',state.gamemodeSearch);});

    var pi=document.getElementById('playerInput');
    if(pi) pi.addEventListener('keydown',e=>{if(e.key==='Enter')searchPlayer();});
    var pb=document.getElementById('playerSearchBtn');
    if(pb) pb.addEventListener('click',searchPlayer);

    var oi=document.getElementById('ovSearch');
    if(oi) oi.addEventListener('keydown',e=>{if(e.key==='Enter')overviewSearch();});
    var ob=document.getElementById('ovSearchBtn');
    if(ob) ob.addEventListener('click',overviewSearch);

    document.querySelectorAll('.ql-card').forEach(c=>c.addEventListener('click',()=>{if(c.dataset.section)showSection(c.dataset.section);}));
    document.querySelectorAll('.ov-stat').forEach(c=>c.addEventListener('click',()=>{if(c.dataset.section)showSection(c.dataset.section);}));
    document.querySelectorAll('.featured-hero').forEach(c=>c.addEventListener('click',()=>{if(c.dataset.key)showHeroDetails(c.dataset.key);}));

    var ml=document.getElementById('metaLoadBtn'); if(ml) ml.addEventListener('click',fetchHeroStats);
    ['metaPlatform','metaGamemode','metaRegion','metaRole','metaRank'].forEach(function(fid){
        var el=document.getElementById(fid); if(el) el.addEventListener('change',fetchHeroStats);
    });
    var mgm=document.getElementById('metaGamemode'), mrg=document.getElementById('metaRankGroup');
    if(mgm&&mrg) mgm.addEventListener('change',function(){mrg.style.display=mgm.value==='competitive'?'':'none';});
    var tt=document.getElementById('themeToggle'); if(tt) tt.addEventListener('click',()=>setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));

    /* Header search bar */
    var hsb=document.getElementById('headerSearchBtn'), hsi=document.getElementById('headerSearchInput'), hsd=document.getElementById('headerSearch');
    if(hsb) hsb.addEventListener('click',()=>{
        if(!hsd.classList.contains('open')){hsd.classList.add('open');hsi.focus();return;}
        var v=(hsi?hsi.value.trim():''); if(v) openPlayerModal(v);
    });
    if(hsi) hsi.addEventListener('keydown',e=>{if(e.key==='Enter'){var v=hsi.value.trim();if(v)openPlayerModal(v);}if(e.key==='Escape'){hsd.classList.remove('open');hsi.value='';}});

    /* Player modal */
    var pmc=document.getElementById('playerModalClose'); if(pmc) pmc.addEventListener('click',closePlayerModal);
    var pm=document.getElementById('playerModal');
    if(pm) pm.addEventListener('click',e=>{if(e.target===pm)closePlayerModal();});

    var cb=document.getElementById('closeModalBtn'); if(cb) cb.addEventListener('click',closeModal);
    var modal=document.getElementById('heroModal');
    if(modal) modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closePlayerModal();}});
}

document.addEventListener('DOMContentLoaded',()=>{
    initTheme(); bind();
    showSection(location.hash?location.hash.slice(1):'overview');
});

window.OverWatched={showHeroDetails,closeModal,searchPlayer,loadProfile,backToSearch,fetchHeroStats,overviewSearch,openPlayerModal,closePlayerModal};
    `;
}

/* ════════════════════════════════════════════
   HTML Generation
   ════════════════════════════════════════════ */

function generateOverviewContent(heroes, roles, maps, gamemodes) {
    const heroList = safeArray(heroes);
    const tankCount = heroList.filter(h => h.role === 'tank').length;
    const damageCount = heroList.filter(h => h.role === 'damage').length;
    const supportCount = heroList.filter(h => h.role === 'support').length;
    const mapCount = safeArray(maps).length;

    // Pick ~16 random hero portraits for the strip
    const shuffled = [...heroList].sort(() => Math.random() - 0.5);
    const stripHeroes = shuffled.slice(0, Math.min(18, heroList.length));

    // Pick 6 featured heroes (spread across roles)
    const tanks = heroList.filter(h => h.role === 'tank').slice(0, 2);
    const dps = heroList.filter(h => h.role === 'damage').slice(0, 2);
    const sups = heroList.filter(h => h.role === 'support').slice(0, 2);
    const featured = [...tanks, ...dps, ...sups];

    return `
        <div class="overview-splash">
            <div class="splash-inner">
                <h2>Overwatch <span>Stats Tracker</span></h2>
                <p class="splash-sub">Search any player to view competitive ranks, hero stats, winrates, and full performance breakdown.</p>

                <div class="hero-portrait-strip">
                    ${stripHeroes.map(h => `<img src="${h.portrait}" alt="${esc(h.name)}" loading="lazy" title="${esc(h.name)}" />`).join('')}
                </div>

                <div class="search-hero">
                    <div class="search-hero-input-wrap">
                        <span class="search-icon">${SVG_ICONS.search}</span>
                        <input type="text" id="ovSearch" placeholder="Search player by BattleTag or username..." />
                    </div>
                    <button type="button" id="ovSearchBtn" class="btn btn-brand">Track Player</button>
                </div>
                <p class="search-hint">Example: TeKrop &middot; Player#1234 &middot; Username</p>
            </div>
        </div>

        <div class="overview-stats-row">
            <div class="ov-stat ov-total" data-section="heroes">
                <div class="ov-num">${heroList.length}</div>
                <div class="ov-label">Total Heroes</div>
            </div>
            <div class="ov-stat ov-tank" data-section="heroes">
                <div class="ov-num">${tankCount}</div>
                <div class="ov-label">${SVG_ICONS.shield} Tanks</div>
            </div>
            <div class="ov-stat ov-dmg" data-section="heroes">
                <div class="ov-num">${damageCount}</div>
                <div class="ov-label">${SVG_ICONS.crosshair} Damage</div>
            </div>
            <div class="ov-stat ov-sup" data-section="heroes">
                <div class="ov-num">${supportCount}</div>
                <div class="ov-label">${SVG_ICONS.heart} Support</div>
            </div>
            <div class="ov-stat ov-map" data-section="maps">
                <div class="ov-num">${mapCount}</div>
                <div class="ov-label">${SVG_ICONS.map} Maps</div>
            </div>
        </div>

        <div class="ql-grid">
            <div class="ql-card" data-section="meta">
                <div class="ql-icon ql-meta">${SVG_ICONS.chart}</div>
                <div>
                    <div class="ql-title">Hero Meta</div>
                    <p class="ql-desc">Live tier list with pickrate &amp; winrate data</p>
                </div>
            </div>
            <div class="ql-card" data-section="heroes">
                <div class="ql-icon ql-heroes">${SVG_ICONS.users}</div>
                <div>
                    <div class="ql-title">Hero Database</div>
                    <p class="ql-desc">Browse abilities, lore, and role details</p>
                </div>
            </div>
            <div class="ql-card" data-section="maps">
                <div class="ql-icon ql-maps">${SVG_ICONS.map}</div>
                <div>
                    <div class="ql-title">Map Explorer</div>
                    <p class="ql-desc">All maps with gamemodes &amp; locations</p>
                </div>
            </div>
        </div>

        <div class="featured-section">
            <h3>Featured Heroes</h3>
            <div class="featured-heroes-row">
                ${featured.map(h => `
                    <div class="featured-hero" data-key="${esc(h.key)}">
                        <img src="${h.portrait}" alt="${esc(h.name)}" loading="lazy" />
                        <div class="fh-info">
                            <div class="fh-name">${esc(h.name)}</div>
                            <div class="fh-role" style="color:var(--${h.role})">${esc(h.role)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateHeroesContent(heroes, roles) {
    const heroList = safeArray(heroes);
    const tanks = heroList.filter(h => h.role === 'tank').sort((a,b) => a.name.localeCompare(b.name));
    const damage = heroList.filter(h => h.role === 'damage').sort((a,b) => a.name.localeCompare(b.name));
    const support = heroList.filter(h => h.role === 'support').sort((a,b) => a.name.localeCompare(b.name));

    const renderColumn = (list, role, label) => {
        const iconSvg = getRoleIcon(role);
        return `
            <div class="role-column">
                <div class="role-column-header ${role}-header">
                    ${iconSvg} ${label}
                    <span class="role-count">${list.length}</span>
                </div>
                <div class="role-grid">
                    ${list.map(h => `
                        <div class="hero-thumb" data-name="${esc(h.name)}" data-role="${esc(h.role)}">
                            <button type="button" class="hero-card-button" data-hero-key="${esc(h.key)}" aria-label="View ${esc(h.name)}">
                                <img src="${h.portrait}" alt="${esc(h.name)}" loading="lazy" />
                                <span class="hero-thumb-name">${esc(h.name)}</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };

    return `
        <div class="section-card">
            <div class="section-head">
                <h2>Hero Roster</h2>
                <p class="muted">Click any hero to view abilities, stats, and lore. ${heroList.length} heroes across 3 roles.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="heroSearch">Search Heroes</label>
                    <input id="heroSearch" type="text" placeholder="Search by name..." />
                </div>
            </div>
            <div class="heroes-columns">
                ${renderColumn(tanks, 'tank', 'Tank')}
                ${renderColumn(damage, 'damage', 'Damage')}
                ${renderColumn(support, 'support', 'Support')}
            </div>
        </div>
    `;
}

function generateGamemodesContent(gamemodes) {
    return `
        <div class="section-card">
            <div class="section-head">
                <h2>Gamemodes</h2>
                <p class="muted">All available gamemodes and their objectives.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="gamemodeSearch">Search</label>
                    <input id="gamemodeSearch" type="text" placeholder="Search gamemodes..." />
                </div>
            </div>
            <div class="gamemode-grid">
                ${safeArray(gamemodes).map(g => `
                    <div class="card gamemode-card" data-name="${esc(g.name)}">
                        <div style="display:flex;align-items:center;gap:.75rem">
                            <img src="${g.icon}" alt="" class="gamemode-icon" loading="lazy" />
                            <h3>${esc(g.name)}</h3>
                        </div>
                        <p class="muted">${esc(g.description)}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateMapsContent(maps) {
    return `
        <div class="section-card">
            <div class="section-head">
                <h2>Maps</h2>
                <p class="muted">Explore all maps with location and gamemode details.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="mapSearch">Search</label>
                    <input id="mapSearch" type="text" placeholder="Search maps..." />
                </div>
            </div>
            <div class="maps-grid">
                ${safeArray(maps).map(m => `
                    <div class="card map-card" data-name="${esc(m.name)}">
                        <img src="${m.screenshot}" alt="${esc(m.name)}" loading="lazy" />
                        <div>
                            <h3>${esc(m.name)}</h3>
                            <p class="muted">Location: ${esc(m.location || 'Unknown')}</p>
                            <p class="muted">Country: ${esc(m.country_code || 'N/A')}</p>
                            <p class="muted">Gamemodes: ${(m.gamemodes || []).map(mode => esc(mode)).join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function generateHTML({ heroes, roles, gamemodes, maps, buildInfo, baseUrl }) {
    const overviewContent = generateOverviewContent(heroes, roles, maps, gamemodes);
    const heroesContent = generateHeroesContent(heroes, roles);
    const gamemodesContent = generateGamemodesContent(gamemodes);
    const mapsContent = generateMapsContent(maps);

    const prettyDate = new Date(buildInfo.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>OverWatched \u2014 Overwatch Stats Tracker</title>
    <meta name="description" content="OverWatched: Track any Overwatch player's competitive rank, hero stats, and performance. Live hero meta with tier rankings.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script defer src="app.js"></script>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-bar">
                <div class="header-brand">
                    <h1>OverWatched</h1>
                    <span class="version-pill">Stats Tracker</span>
                </div>
                <div class="header-actions">
                    <button id="themeToggle" class="btn btn-ghost btn-sm" type="button">Dark Mode</button>
                    <div class="header-search" id="headerSearch">
                        <input type="text" class="header-search-input" id="headerSearchInput" placeholder="BattleTag or username..." />
                        <button type="button" class="header-search-btn" id="headerSearchBtn">${SVG_ICONS.search} Track</button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <nav>
        <div class="container">
            <div class="nav-inner">
                <button class="nav-link active" data-section="overview" type="button">Overview</button>
                <button class="nav-link" data-section="meta" type="button">Meta</button>
                <button class="nav-link" data-section="heroes" type="button">Heroes</button>
                <button class="nav-link" data-section="maps" type="button">Maps</button>
                <button class="nav-link" data-section="gamemodes" type="button">Gamemodes</button>
            </div>
        </div>
    </nav>

    <main class="container">
        <section id="overview" class="content">${overviewContent}</section>

        <section id="meta" class="content hidden">
            <div class="section-card">
                <div class="section-head">
                    <h2>Hero Meta</h2>
                    <p class="muted">Live hero tier list with pickrate and winrate data from competitive and quickplay.</p>
                </div>
                <div class="filters">
                    <div class="filter-group">
                        <label for="metaPlatform">Platform</label>
                        <select id="metaPlatform"><option value="pc">PC</option><option value="console">Console</option></select>
                    </div>
                    <div class="filter-group">
                        <label for="metaGamemode">Mode</label>
                        <select id="metaGamemode"><option value="competitive">Competitive</option><option value="quickplay">Quickplay</option></select>
                    </div>
                    <div class="filter-group">
                        <label for="metaRegion">Region</label>
                        <select id="metaRegion"><option value="europe">Europe</option><option value="americas">Americas</option><option value="asia">Asia</option></select>
                    </div>
                    <div class="filter-group">
                        <label for="metaRole">Role</label>
                        <select id="metaRole"><option value="">All</option><option value="tank">Tank</option><option value="damage">Damage</option><option value="support">Support</option></select>
                    </div>
                    <div class="filter-group" id="metaRankGroup">
                        <label for="metaRank">Rank</label>
                        <select id="metaRank"><option value="">All Ranks</option><option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="platinum">Platinum</option><option value="diamond">Diamond</option><option value="master">Master</option><option value="grandmaster">Grandmaster</option></select>
                    </div>
                    <div class="filter-group">
                        <button id="metaLoadBtn" type="button" class="btn btn-brand" style="margin-top:1.55rem">${SVG_ICONS.zap} Refresh</button>
                    </div>
                </div>
                <div id="metaResults"></div>
            </div>
        </section>

        <section id="heroes" class="content hidden">${heroesContent}</section>
        <section id="maps" class="content hidden">${mapsContent}</section>
        <section id="gamemodes" class="content hidden">${gamemodesContent}</section>
    </main>

    <div id="heroModal" class="modal hidden" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="modal-content" role="document">
            <h2 id="modalHeroName" class="hero-name-role"></h2>
            <div id="modalHeroDetails"></div>
            <button type="button" id="closeModalBtn" class="btn btn-brand" style="margin-top:1rem">Close</button>
        </div>
    </div>

    <div id="playerModal" class="player-modal hidden">
        <div class="player-modal-content">
            <div class="pm-search-row">
                <input type="text" id="playerInput" placeholder="Search by BattleTag or username..." />
                <button type="button" id="playerSearchBtn" class="btn btn-brand">Search</button>
                <button type="button" id="playerModalClose" class="btn btn-ghost">Close</button>
            </div>
            <div id="playerSearchResults"></div>
            <div id="playerProfile" class="hidden"></div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p>OverWatched &middot; Built ${prettyDate} &middot; Data: OverFast API</p>
        </div>
    </footer>
</body>
</html>`;
}

/* ════════════════════════════════════════════
   Build
   ════════════════════════════════════════════ */

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const { heroes, roles, gamemodes, maps, usedCache } = await fetchAllData(opts);
    const data = { heroes: safeArray(heroes), roles: safeArray(roles), gamemodes: safeArray(gamemodes), maps: safeArray(maps) };
    const buildInfo = { generatedAt: new Date().toISOString(), usedCache };

    const html = await generateHTML({ ...data, buildInfo, baseUrl: opts.baseUrl });
    const styles = generateStyles();
    const script = generateScript({ ...data, buildInfo, baseUrl: opts.baseUrl });

    await fs.mkdir(opts.outputDir, { recursive: true });
    await fs.writeFile(path.join(opts.outputDir, 'index.html'), html);
    await fs.writeFile(path.join(opts.outputDir, 'styles.css'), styles.trim());
    await fs.writeFile(path.join(opts.outputDir, 'app.js'), script.trim());
    console.log(`OverWatched generated in ${opts.outputDir}/`);
}

main().catch(e => { console.error('Build failed:', e); process.exit(1); });
