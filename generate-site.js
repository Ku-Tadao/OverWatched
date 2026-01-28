const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');

const DEFAULT_API_BASE_URL = 'https://overfast-api.tekrop.fr';
const DEFAULT_OUTPUT_DIR = 'public';
const CACHE_DIR = '.cache';
const CACHE_FILE = 'overfast.json';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const ENDPOINTS = ['heroes', 'roles', 'gamemodes', 'maps'];

function parseArgs(args) {
    const options = {
        outputDir: DEFAULT_OUTPUT_DIR,
        baseUrl: DEFAULT_API_BASE_URL,
        useCache: true
    };

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === '--no-cache') {
            options.useCache = false;
            continue;
        }
        if (arg === '--base-url' && args[i + 1]) {
            options.baseUrl = args[i + 1];
            i += 1;
            continue;
        }
        if (arg === '--output' && args[i + 1]) {
            options.outputDir = args[i + 1];
            i += 1;
            continue;
        }
        if (!arg.startsWith('--')) {
            options.outputDir = arg;
        }
    }

    return options;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(http, endpoint, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await http.get(`/${endpoint}`);
            return response.data;
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            const delay = 500 * Math.pow(2, attempt);
            await sleep(delay);
        }
    }
    return null;
}

async function loadCache(cachePath) {
    try {
        const data = await fs.readFile(cachePath, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed || !parsed.timestamp || !parsed.data) {
            return null;
        }
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
            return null;
        }
        return parsed.data;
    } catch (error) {
        return null;
    }
}

async function writeCache(cachePath, payload) {
    try {
        await fs.mkdir(path.dirname(cachePath), { recursive: true });
        const data = {
            timestamp: Date.now(),
            data: payload
        };
        await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.warn('Unable to write cache:', error.message);
    }
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function fetchAllData({ baseUrl, useCache }) {
    const http = axios.create({
        baseURL: baseUrl,
        timeout: 10000,
        headers: {
            'User-Agent': 'UnderWatch/2.0 (static site generator)'
        }
    });

    const cachePath = path.join(CACHE_DIR, CACHE_FILE);
    const cachedData = useCache ? await loadCache(cachePath) : null;
    let usedCache = false;

    const results = {};
    for (const endpoint of ENDPOINTS) {
        try {
            results[endpoint] = await fetchWithRetry(http, endpoint, 2);
        } catch (error) {
            if (cachedData && cachedData[endpoint]) {
                results[endpoint] = cachedData[endpoint];
                usedCache = true;
                console.warn(`Using cached ${endpoint} data due to error:`, error.message);
            } else {
                results[endpoint] = [];
                console.error(`Failed to fetch ${endpoint}:`, error.message);
            }
        }
    }

    if (useCache) {
        await writeCache(cachePath, results);
    }

    return { ...results, usedCache };
}

function generateStyles() {
    return `
        :root {
            color-scheme: light dark;
            --background: #f6f7fb;
            --surface: #ffffff;
            --surface-strong: #eef1f6;
            --text: #1b1f24;
            --muted: #5b6472;
            --brand: #3b82f6;
            --brand-strong: #1d4ed8;
            --accent: #22c55e;
            --border: rgba(27, 31, 36, 0.12);
            --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }

        [data-theme="dark"] {
            --background: #0b1120;
            --surface: #111827;
            --surface-strong: #1f2937;
            --text: #e5e7eb;
            --muted: #9ca3af;
            --brand: #60a5fa;
            --brand-strong: #3b82f6;
            --accent: #34d399;
            --border: rgba(148, 163, 184, 0.24);
            --shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "Inter", "Segoe UI", system-ui, sans-serif;
            background: var(--background);
            color: var(--text);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }

        .container {
            width: min(1200px, 92vw);
            margin: 0 auto;
        }

        header {
            padding: 2.5rem 0 1.5rem;
        }

        .header-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: var(--shadow);
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
            justify-content: space-between;
        }

        .header-title {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .header-title h1 {
            font-size: clamp(2rem, 4vw, 2.8rem);
            margin: 0;
        }

        .muted {
            color: var(--muted);
            margin: 0;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.35rem 0.75rem;
            border-radius: 999px;
            background: var(--surface-strong);
            font-size: 0.85rem;
            color: var(--muted);
        }

        .header-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .btn {
            border: none;
            border-radius: 999px;
            padding: 0.6rem 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-primary {
            background: var(--brand);
            color: #fff;
            box-shadow: 0 12px 20px rgba(59, 130, 246, 0.25);
        }

        .btn-secondary {
            background: var(--surface-strong);
            color: var(--text);
            border: 1px solid var(--border);
        }

        .btn:hover {
            transform: translateY(-1px);
        }

        .btn:focus-visible,
        .nav-link:focus-visible,
        .hero-card button:focus-visible,
        input:focus-visible,
        select:focus-visible {
            outline: 3px solid var(--brand);
            outline-offset: 2px;
        }

        nav {
            position: sticky;
            top: 0;
            z-index: 10;
            backdrop-filter: blur(12px);
            background: color-mix(in srgb, var(--background) 85%, transparent);
            border-bottom: 1px solid var(--border);
        }

        .nav-list {
            display: flex;
            gap: 0.75rem;
            padding: 0.75rem 0;
            margin: 0;
            list-style: none;
            flex-wrap: wrap;
        }

        .nav-link {
            border: none;
            background: transparent;
            padding: 0.5rem 0.9rem;
            border-radius: 999px;
            color: var(--muted);
            font-weight: 600;
            cursor: pointer;
        }

        .nav-link.active {
            background: var(--surface);
            color: var(--text);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }

        main {
            padding: 2rem 0 3rem;
        }

        .hidden {
            display: none;
        }

        section {
            background: var(--surface);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .section-header {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .filters {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            align-items: end;
            margin-bottom: 1.5rem;
        }

        .filter-group label {
            display: block;
            font-size: 0.85rem;
            color: var(--muted);
            margin-bottom: 0.3rem;
        }

        .filter-group input,
        .filter-group select {
            width: 100%;
            padding: 0.6rem 0.75rem;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: var(--surface-strong);
            color: var(--text);
        }

        .grid {
            display: grid;
            gap: 1.25rem;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }

        .hero-card {
            background: var(--surface-strong);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid var(--border);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-card button {
            all: unset;
            display: block;
            cursor: pointer;
        }

        .hero-card img {
            width: 100%;
            height: 190px;
            object-fit: cover;
            display: block;
        }

        .hero-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow);
        }

        .hero-meta {
            padding: 0.75rem 0.9rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .role-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: var(--surface);
            color: var(--muted);
            border-radius: 999px;
            padding: 0.25rem 0.55rem;
            font-size: 0.75rem;
            border: 1px solid var(--border);
            width: fit-content;
        }

        .card {
            padding: 1rem;
            border-radius: 16px;
            border: 1px solid var(--border);
            background: var(--surface-strong);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .card p {
            margin: 0;
        }

        .role-icon,
        .gamemode-icon {
            width: 44px;
            height: 44px;
            object-fit: contain;
        }

        .maps-grid {
            grid-template-columns: 1fr;
        }

        .map-card {
            display: grid;
            grid-template-columns: minmax(220px, 40%) 1fr;
            gap: 1rem;
            align-items: center;
        }

        .map-card img {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: 12px;
        }

        .modal {
            position: fixed;
            inset: 0;
            background: rgba(2, 6, 23, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            z-index: 50;
        }

        .modal.hidden {
            display: none;
        }

        .modal-content {
            width: min(900px, 94vw);
            max-height: 85vh;
            overflow-y: auto;
            background: var(--surface);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }

        .modal-content h2 {
            margin-top: 0;
        }

        .hero-name-role {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .ability-box {
            border: 1px solid var(--border);
            border-radius: 14px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .ability-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--surface-strong);
            padding: 0.5rem 0.75rem;
            font-weight: 600;
        }

        .ability-details {
            display: flex;
            gap: 1rem;
            align-items: center;
            padding: 0.75rem;
        }

        .ability-image {
            width: 56px;
            height: 56px;
            background: #0b1120;
            border-radius: 50%;
            object-fit: contain;
            padding: 6px;
        }

        .ability-wide-image {
            width: 120px;
            height: 72px;
            background: #0b1120;
            border-radius: 14px;
            object-fit: contain;
            padding: 6px;
        }

        .hero-description {
            margin-bottom: 1rem;
            color: var(--muted);
        }

        .hero-lore {
            margin-bottom: 0.75rem;
        }

        .lore-toggle {
            margin-bottom: 1.25rem;
        }

        .status {
            padding: 0.6rem 0.75rem;
            border-radius: 10px;
            background: var(--surface-strong);
            border: 1px solid var(--border);
            color: var(--muted);
        }

        footer {
            padding: 2rem 0 3rem;
            color: var(--muted);
            text-align: center;
        }

        @media (max-width: 720px) {
            .header-card {
                padding: 1.5rem;
            }

            section {
                padding: 1.5rem;
            }

            .ability-details {
                flex-direction: column;
                align-items: flex-start;
            }

            .hero-card img {
                height: 160px;
            }

            .map-card {
                grid-template-columns: 1fr;
            }
        }

        @media (min-width: 900px) {
            .maps-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `;
}

function generateScript({ heroes, roles, gamemodes, maps, buildInfo, baseUrl }) {
    return `
    const DATA = ${JSON.stringify({ heroes, roles, gamemodes, maps, buildInfo })};
    const API_BASE_URL = ${JSON.stringify(baseUrl)};

    const state = {
        heroSearch: '',
        heroRole: 'all',
        mapSearch: '',
        gamemodeSearch: ''
    };

    function normalize(text) {
        return (text || '').toString().toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('underwatch-theme', theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
        }
    }

    function initTheme() {
        const stored = localStorage.getItem('underwatch-theme');
        if (stored) {
            setTheme(stored);
            return;
        }
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    function setActiveNav(sectionId) {
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });
    }

    function showSection(sectionId) {
        document.querySelectorAll('section.content').forEach(section => {
            section.classList.add('hidden');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            setActiveNav(sectionId);
            history.replaceState(null, '', '#' + sectionId);
        }
    }

    function applyHeroFilters() {
        const search = normalize(state.heroSearch);
        const role = state.heroRole;
        const cards = document.querySelectorAll('.hero-card');
        let visible = 0;

        cards.forEach(card => {
            const name = normalize(card.dataset.name);
            const cardRole = normalize(card.dataset.role);
            const matchesSearch = !search || name.includes(search);
            const matchesRole = role === 'all' || cardRole === role;
            const isVisible = matchesSearch && matchesRole;
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                visible += 1;
            }
        });

        const counter = document.getElementById('heroCount');
        if (counter) {
            counter.textContent = visible + ' heroes';
        }
    }

    function applyFilter(containerSelector, searchValue) {
        const search = normalize(searchValue);
        const cards = document.querySelectorAll(containerSelector);
        cards.forEach(card => {
            const name = normalize(card.dataset.name);
            card.style.display = !search || name.includes(search) ? '' : 'none';
        });
    }

    async function showHeroDetails(heroKey) {
        const hero = DATA.heroes.find(h => h.key === heroKey);
        if (!hero) return;

        const modal = document.getElementById('heroModal');
        const modalHeroName = document.getElementById('modalHeroName');
        const modalHeroDetails = document.getElementById('modalHeroDetails');

        modalHeroName.textContent = hero.name + ' | ' + hero.role.charAt(0).toUpperCase() + hero.role.slice(1);
        modalHeroDetails.innerHTML = '<div class="status">Loading details...</div>';
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');

        try {
            const response = await fetch(API_BASE_URL + '/heroes/' + heroKey);
            if (!response.ok) {
                throw new Error('Hero details unavailable');
            }
            const details = await response.json();
            const storyChapters = details.story && details.story.chapters ? details.story.chapters : [];
            const maxLoreParagraphs = 2;
            const fullLoreHtml = storyChapters.length
                ? storyChapters.map(chapter => '<p>' + escapeHtml(chapter.content) + '</p>').join('')
                : '<p class="muted">Lore not available.</p>';
            const collapsedLoreHtml = storyChapters.length
                ? storyChapters.slice(0, maxLoreParagraphs).map(chapter => '<p>' + escapeHtml(chapter.content) + '</p>').join('')
                : '<p class="muted">Lore not available.</p>';
            const hasMoreLore = storyChapters.length > maxLoreParagraphs;

            const abilities = (details.abilities || []).map((ability, index) => {
                const iconMarkup = ability.icon
                    ? (index === 0
                            ? '<img src="' + ability.icon + '" alt="' + escapeHtml(ability.name) + ' icon" class="ability-wide-image">'
                            : '<img src="' + ability.icon + '" alt="' + escapeHtml(ability.name) + ' icon" class="ability-image">')
                    : '';
                return (
                    '<div class="ability-box">' +
                        '<div class="ability-header">' + escapeHtml(ability.name) + '</div>' +
                        '<div class="ability-details">' +
                            iconMarkup +
                            '<div>' + escapeHtml(ability.description) + '</div>' +
                        '</div>' +
                    '</div>'
                );
            }).join('');

            modalHeroDetails.innerHTML =
                '<div class="hero-description">' + escapeHtml(details.description) + '</div>' +
                '<h3 class="text-xl font-bold mt-4">Abilities</h3>' +
                (abilities || '<p class="muted">No abilities listed.</p>') +
                '<h3 class="text-xl font-bold mt-4">Lore</h3>' +
                '<div class="hero-lore" id="heroLore">' + collapsedLoreHtml + '</div>' +
                (hasMoreLore
                    ? '<button type="button" id="loreToggle" class="btn btn-secondary lore-toggle">Show more</button>'
                    : '');

            if (hasMoreLore) {
                const loreToggle = document.getElementById('loreToggle');
                const loreContainer = document.getElementById('heroLore');
                let expanded = false;
                if (loreToggle && loreContainer) {
                    loreToggle.addEventListener('click', () => {
                        expanded = !expanded;
                        loreContainer.innerHTML = expanded ? fullLoreHtml : collapsedLoreHtml;
                        loreToggle.textContent = expanded ? 'Show less' : 'Show more';
                    });
                }
            }
        } catch (error) {
            console.error('Error loading hero details:', error);
            modalHeroDetails.innerHTML = '<div class="status">Error loading hero details.</div>';
        }
    }

    function closeModal() {
        const modal = document.getElementById('heroModal');
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }

    function formatBattleTag(value) {
        return value.trim().replace('#', '-');
    }

    async function searchPlayer() {
        const playerInput = document.getElementById('playerInput');
        const resultDiv = document.getElementById('playerResult');
        if (!playerInput || !resultDiv) return;

        const rawValue = playerInput.value;
        if (!rawValue.trim()) {
            resultDiv.innerHTML = '<div class="status">Please enter a BattleTag (e.g. Player#1234).</div>';
            return;
        }

        const playerIdFormatted = formatBattleTag(rawValue);
        resultDiv.innerHTML = '<div class="status">Searching...</div>';

        try {
            const response = await fetch(API_BASE_URL + '/players/' + playerIdFormatted);
            if (!response.ok) {
                throw new Error('Player not found');
            }
            const player = await response.json();
            const summary = player.summary || {};
            const competitivePc = summary.competitive && summary.competitive.pc ? summary.competitive.pc : null;

            let competitiveRanks = '';
            if (competitivePc) {
                competitiveRanks = Object.entries(competitivePc)
                    .filter(entry => entry[1] !== null)
                    .map(entry => {
                        const role = entry[0];
                        const rank = entry[1];
                        return (
                            '<div class="card">' +
                                '<h4 class="font-bold">' + role.charAt(0).toUpperCase() + role.slice(1) + '</h4>' +
                                '<p>' + rank.division + ' ' + rank.tier + '</p>' +
                                '<img src="' + rank.rank_icon + '" alt="' + role + ' rank" class="w-8 h-8">' +
                            '</div>'
                        );
                    }).join('');
            }

            resultDiv.innerHTML =
                '<div class="card">' +
                    '<h3 class="text-xl font-bold">' + escapeHtml(summary.username || 'Unknown Player') + '</h3>' +
                    '<img src="' + (summary.avatar || 'https://via.placeholder.com/150') + '" alt="Player avatar" class="w-32 h-32">' +
                    '<p>Title: ' + escapeHtml(summary.title || 'N/A') + '</p>' +
                    '<p>Endorsement Level: ' + escapeHtml(summary.endorsement ? summary.endorsement.level : 'N/A') + '</p>' +
                '</div>' +
                '<div class="mt-4">' +
                    '<h4 class="font-bold mb-2">Competitive Ranks (PC)</h4>' +
                    (competitiveRanks || '<div class="status">No competitive ranks available.</div>') +
                '</div>';
        } catch (error) {
            console.error('Error fetching player data:', error);
            resultDiv.innerHTML = '<div class="status">Player not found or an error occurred.</div>';
        }
    }

    function bindEvents() {
                document.querySelectorAll('.hero-card-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const heroKey = button.dataset.heroKey;
                        if (heroKey) {
                            showHeroDetails(heroKey);
                        }
                    });
                });

        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', () => showSection(btn.dataset.section));
        });

        const heroSearch = document.getElementById('heroSearch');
        const heroRoleFilter = document.getElementById('heroRoleFilter');
        if (heroSearch) {
            heroSearch.addEventListener('input', event => {
                state.heroSearch = event.target.value;
                applyHeroFilters();
            });
        }
        if (heroRoleFilter) {
            heroRoleFilter.addEventListener('change', event => {
                state.heroRole = event.target.value;
                applyHeroFilters();
            });
        }

        const mapSearch = document.getElementById('mapSearch');
        if (mapSearch) {
            mapSearch.addEventListener('input', event => {
                state.mapSearch = event.target.value;
                applyFilter('.map-card', state.mapSearch);
            });
        }

        const gamemodeSearch = document.getElementById('gamemodeSearch');
        if (gamemodeSearch) {
            gamemodeSearch.addEventListener('input', event => {
                state.gamemodeSearch = event.target.value;
                applyFilter('.gamemode-card', state.gamemodeSearch);
            });
        }

        const playerInput = document.getElementById('playerInput');
        if (playerInput) {
            playerInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    searchPlayer();
                }
            });
        }

        const playerButton = document.getElementById('playerSearchBtn');
        if (playerButton) {
            playerButton.addEventListener('click', searchPlayer);
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
            });
        }

        const jumpToPlayers = document.getElementById('jumpToPlayers');
        if (jumpToPlayers) {
            jumpToPlayers.addEventListener('click', () => showSection('players'));
        }

        const closeModalButton = document.getElementById('closeModalBtn');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        const modal = document.getElementById('heroModal');
        if (modal) {
            modal.addEventListener('click', event => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        bindEvents();
        const initialSection = window.location.hash ? window.location.hash.slice(1) : 'heroes';
        showSection(initialSection || 'heroes');
        applyHeroFilters();
    });

    window.UnderWatch = {
        showHeroDetails,
        closeModal,
        searchPlayer
    };
    `;
}

async function generateHTML({ heroes, roles, gamemodes, maps, buildInfo, baseUrl }) {
    const heroesContent = generateHeroesContent(heroes, roles);
    const rolesContent = generateRolesContent(roles);
    const gamemodesContent = generateGamemodesContent(gamemodes);
    const mapsContent = generateMapsContent(maps);

    const prettyDate = new Date(buildInfo.generatedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const cacheNote = buildInfo.usedCache ? '<span class="badge">Cached data used</span>' : '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>UnderWatch</title>
                <meta name="description" content="UnderWatch is a fast, static Overwatch 2 data hub powered by the OverFast API.">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="stylesheet" href="styles.css">
                <script defer src="app.js"></script>
        </head>
        <body>
            <noscript>
                <div class="container">
                    <div class="status" style="margin-top: 1rem;">Enable JavaScript to use hero details, filtering, and player search.</div>
                </div>
            </noscript>
            <header>
                <div class="container">
                    <div class="header-card">
                        <div class="header-title">
                            <span class="badge">Static build • ${prettyDate}</span>
                            <h1>UnderWatch</h1>
                            <p class="muted">A polished Overwatch 2 data hub powered by the OverFast API. Explore heroes, roles, gamemodes, and maps.</p>
                        </div>
                        <div class="header-actions">
                            <button id="themeToggle" class="btn btn-secondary" type="button">Switch theme</button>
                            <button id="jumpToPlayers" class="btn btn-primary" type="button">Player search</button>
                        </div>
                    </div>
                </div>
            </header>

            <nav>
                <div class="container">
                    <ul class="nav-list">
                        <li><button class="nav-link active" data-section="heroes" type="button">Heroes</button></li>
                        <li><button class="nav-link" data-section="roles" type="button">Roles</button></li>
                        <li><button class="nav-link" data-section="gamemodes" type="button">Gamemodes</button></li>
                        <li><button class="nav-link" data-section="maps" type="button">Maps</button></li>
                        <li><button class="nav-link" data-section="players" type="button">Players</button></li>
                    </ul>
                </div>
            </nav>

            <main class="container">
                <section id="heroes" class="content">${heroesContent}</section>
                <section id="roles" class="content hidden">${rolesContent}</section>
                <section id="gamemodes" class="content hidden">${gamemodesContent}</section>
                <section id="maps" class="content hidden">${mapsContent}</section>
                <section id="players" class="content hidden">
                    <div class="section-header">
                        <h2 class="text-2xl font-bold">Player Search</h2>
                        <p class="muted">Search by BattleTag to see basic profile and competitive ranks.</p>
                    </div>
                    <div class="filters">
                        <div class="filter-group">
                            <label for="playerInput">BattleTag</label>
                            <input type="text" id="playerInput" placeholder="Player#1234" />
                        </div>
                        <div class="filter-group">
                            <button id="playerSearchBtn" type="button" class="btn btn-primary" style="margin-top: 1.7rem;">Search</button>
                        </div>
                    </div>
                    <div id="playerResult"></div>
                </section>
            </main>

            <div id="heroModal" class="modal hidden" role="dialog" aria-modal="true" aria-hidden="true">
                <div class="modal-content" role="document">
                    <h2 id="modalHeroName" class="hero-name-role"></h2>
                    <div id="modalHeroDetails"></div>
                    <button type="button" id="closeModalBtn" class="btn btn-primary" style="margin-top: 1rem;">Close</button>
                </div>
            </div>

            <footer>
                <div class="container">
                    <p>Generated on ${prettyDate}. Data source: ${escapeHtml(baseUrl)}. ${cacheNote}</p>
                </div>
            </footer>
        </body>
        </html>
    `;
}

function generateHeroesContent(heroes, roles) {
    const roleOptions = ['all', ...safeArray(roles).map(role => role.key || role.name || '').filter(Boolean)];
    return `
            <div class="section-header">
                <h2 class="text-2xl font-bold">Heroes</h2>
                <p class="muted">Browse the full roster and open a hero card to view lore and abilities.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="heroSearch">Search heroes</label>
                    <input id="heroSearch" type="text" placeholder="Search by name" />
                </div>
                <div class="filter-group">
                    <label for="heroRoleFilter">Role</label>
                    <select id="heroRoleFilter">
                        ${roleOptions.map(role => `<option value="${escapeHtml(role.toLowerCase())}">${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Result count</label>
                    <div id="heroCount" class="status">${safeArray(heroes).length} heroes</div>
                </div>
            </div>
            <div id="heroGrid" class="grid">
                    ${safeArray(heroes).map(hero => `
                            <div class="hero-card" data-name="${escapeHtml(hero.name)}" data-role="${escapeHtml(hero.role)}">
                                <button type="button" class="hero-card-button" data-hero-key="${escapeHtml(hero.key)}" aria-label="View ${escapeHtml(hero.name)} details">
                                    <img src="${hero.portrait}" alt="${escapeHtml(hero.name)} portrait" loading="lazy" />
                                    <div class="hero-meta">
                                        <h3 class="text-lg font-semibold">${escapeHtml(hero.name)}</h3>
                                        <span class="role-pill">${getRoleIcon(hero.role)} ${escapeHtml(hero.role)}</span>
                                    </div>
                                </button>
                            </div>
                    `).join('')}
            </div>
    `;
}

function generateRolesContent(roles) {
  return `
      <div class="section-header">
        <h2 class="text-2xl font-bold">Roles</h2>
        <p class="muted">Quickly understand what each role contributes to a team.</p>
      </div>
      <div class="grid">
          ${safeArray(roles).map(role => `
              <div class="card" data-name="${escapeHtml(role.name)}">
                  <div class="flex items-center gap-3">
                      <img src="${role.icon}" alt="${escapeHtml(role.name)} icon" class="role-icon" loading="lazy" />
                      <h3 class="text-lg font-semibold">${escapeHtml(role.name)}</h3>
                  </div>
                  <p class="muted">${escapeHtml(role.description)}</p>
              </div>
          `).join('')}
      </div>
  `;
}

function generateGamemodesContent(gamemodes) {
    return `
            <div class="section-header">
                <h2 class="text-2xl font-bold">Gamemodes</h2>
                <p class="muted">Filter gamemodes and learn the objectives.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="gamemodeSearch">Search gamemodes</label>
                    <input id="gamemodeSearch" type="text" placeholder="Search by name" />
                </div>
            </div>
            <div class="grid">
                    ${safeArray(gamemodes).map(gamemode => `
                            <div class="card gamemode-card" data-name="${escapeHtml(gamemode.name)}">
                                    <div class="flex items-center gap-3">
                                            <img src="${gamemode.icon}" alt="${escapeHtml(gamemode.name)} icon" class="gamemode-icon" loading="lazy" />
                                            <h3 class="text-lg font-semibold">${escapeHtml(gamemode.name)}</h3>
                                    </div>
                                    <p class="muted">${escapeHtml(gamemode.description)}</p>
                            </div>
                    `).join('')}
            </div>
    `;
}

function generateMapsContent(maps) {
    return `
            <div class="section-header">
                <h2 class="text-2xl font-bold">Maps</h2>
                <p class="muted">Search by map name, then explore location and gamemode details.</p>
            </div>
            <div class="filters">
                <div class="filter-group">
                    <label for="mapSearch">Search maps</label>
                    <input id="mapSearch" type="text" placeholder="Search by name" />
                </div>
            </div>
              <div class="grid maps-grid">
                    ${safeArray(maps).map(map => `
                            <div class="card map-card" data-name="${escapeHtml(map.name)}">
                          <img src="${map.screenshot}" alt="${escapeHtml(map.name)}" loading="lazy" class="map-image" />
                                    <div>
                                        <h3 class="text-lg font-semibold">${escapeHtml(map.name)}</h3>
                                        <p class="muted">Location: ${escapeHtml(map.location || 'Unknown')}</p>
                                        <p class="muted">Country: ${escapeHtml(map.country_code || 'N/A')}</p>
                                        <p class="muted">Gamemodes: ${(map.gamemodes || []).map(mode => escapeHtml(mode)).join(', ') || 'N/A'}</p>
                                    </div>
                            </div>
                    `).join('')}
            </div>
    `;
}

function getRoleIcon(role) {
  const icons = {
      tank: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2.667l-10.667 5.333v6.667c0 6.147 4.56 11.893 10.667 13.333 6.107-1.44 10.667-7.186 10.667-13.333V8L16 2.667zm0 14.666V5.333l8 4v5.333c0 4.267-3.2 8.267-8 9.6V17.333z" fill="currentColor"/></svg>',
      damage: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M24.267 13.733L16 8l-8.267 5.733L16 19.467l8.267-5.734zm-16.534 0L16 19.467l8.267-5.734L16 8l-8.267 5.733zm8.534 11.734l8.266-5.734L16 13.733l-8.267 5.733L16 25.467z" fill="currentColor"/></svg>',
      support: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22.667 14.667v-4h-4V6h-5.334v4.667h-4v4h4v4.666h5.334v-4.666h4zm-6.667 12c6.627 0 12-5.373 12-12s-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12z" fill="currentColor"/></svg>'
  };
  return icons[role.toLowerCase()] || '';
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const { heroes, roles, gamemodes, maps, usedCache } = await fetchAllData(options);

    const normalizedData = {
        heroes: safeArray(heroes),
        roles: safeArray(roles),
        gamemodes: safeArray(gamemodes),
        maps: safeArray(maps)
    };

    const buildInfo = {
        generatedAt: new Date().toISOString(),
        usedCache
    };

    const html = await generateHTML({
        ...normalizedData,
        buildInfo,
        baseUrl: options.baseUrl
    });
    const styles = generateStyles();
    const script = generateScript({
        ...normalizedData,
        buildInfo,
        baseUrl: options.baseUrl
    });

    await fs.mkdir(options.outputDir, { recursive: true });
    await fs.writeFile(path.join(options.outputDir, 'index.html'), html);
    await fs.writeFile(path.join(options.outputDir, 'styles.css'), styles.trim());
    await fs.writeFile(path.join(options.outputDir, 'app.js'), script.trim());

    console.log(`UnderWatch generated successfully in ${options.outputDir}`);
}

main().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});
