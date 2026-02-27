/**
 * OverWatched — Client-side interactivity
 *
 * This script handles theme toggling, navigation, filtering,
 * hero detail modals, player search, and the meta table.
 *
 * It reads embedded DATA and API base URL from the page's
 * data attributes set by the Astro build.
 */

// ── Globals from page data ──
const dataEl = document.getElementById('app-data');
const DATA = dataEl ? JSON.parse(dataEl.dataset.payload || '{}') : {};
const API = dataEl?.dataset.api || 'https://overfast-api.tekrop.fr';

const state = {
  mapSearch: '',
  gamemodeSearch: '',
  metaLoaded: false,
};

// ── Utilities ──
const norm = (t) => (t || '').toString().toLowerCase().trim();
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// ── Theme ──
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('uw-theme', t);
  const b = document.getElementById('themeToggle');
  if (b) b.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
}

function initTheme() {
  const s = localStorage.getItem('uw-theme');
  if (s) { setTheme(s); return; }
  setTheme(window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
}

// ── Navigation ──
function setActiveNav(id) {
  document.querySelectorAll('.nav-link').forEach((b) =>
    b.classList.toggle('active', b.dataset.section === id)
  );
}

function showSection(id) {
  document.querySelectorAll('section.content').forEach((s) => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    setActiveNav(id);
  }
  if (id === 'meta') {
    if (!state.metaLoaded) { state.metaLoaded = true; fetchHeroStats(); }
    startMetaAutoRefresh();
  } else {
    stopMetaAutoRefresh();
  }
}

// ── Filtering ──
function applyFilter(sel, val) {
  const s = norm(val);
  document.querySelectorAll(sel).forEach((c) => {
    c.style.display = !s || norm(c.dataset.name).includes(s) ? '' : 'none';
  });
}

// ── Hero Stats Cache ──
const heroStatsCache = {};

async function fetchHeroStatsCached(platform, gamemode, region) {
  region = region || 'europe';
  const ck = platform + '_' + gamemode + '_' + region;
  if (heroStatsCache[ck]) return heroStatsCache[ck];
  try {
    const r = await fetch(
      API + '/heroes/stats?platform=' + platform + '&gamemode=' + gamemode + '&region=' + region + '&order_by=pickrate:desc'
    );
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    heroStatsCache[ck] = d;
    return d;
  } catch (e) {
    console.warn('Hero stats fetch failed:', e.message);
    return null;
  }
}

// ── Tier Calculation ──
function getTier(pr, max, wr) {
  const pickScore = max > 0 ? (pr / max) * 100 : 0;
  const winScore = wr || 50;
  const p = pickScore * 0.1 + winScore * 0.9;
  if (p >= 53.1) return { l: 'S', c: 'tier-s' };
  if (p >= 50.3) return { l: 'A', c: 'tier-a' };
  if (p >= 47.5) return { l: 'B', c: 'tier-b' };
  if (p >= 45.9) return { l: 'C', c: 'tier-c' };
  return { l: 'D', c: 'tier-d' };
}

function getMetaScore(pr, max, wr) {
  const pickScore = max > 0 ? (pr / max) * 100 : 0;
  return pickScore * 0.1 + (wr || 50) * 0.9;
}

// ── Hero Stat Cards (for modal) ──
function buildHeroStatCards(heroKey, allStats) {
  if (!allStats)
    return '<div class="hd-no-stats">Stats not available for this mode.</div>';
  const hs = allStats.find((s) => s.hero === heroKey);
  if (!hs) return '<div class="hd-no-stats">No stats found for this hero in this mode.</div>';
  const maxP = Math.max(...allStats.map((s) => s.pickrate));
  const tier = getTier(hs.pickrate, maxP, hs.winrate);
  const wc = hs.winrate >= 50 ? 'var(--accent)' : 'var(--damage)';
  const pw = maxP > 0 ? (hs.pickrate / maxP) * 100 : 0;
  const rank = allStats.findIndex((s) => s.hero === heroKey) + 1;
  return (
    '<div class="hd-stats-grid">' +
    '<div class="hd-stat-card hd-tier"><div class="hd-stat-value"><span class="tier-badge ' + tier.c + '" style="width:36px;height:36px;font-size:1.1rem;border-radius:10px">' + tier.l + '</span></div><div class="hd-stat-label">Tier \u00b7 #' + rank + ' of ' + allStats.length + '</div></div>' +
    '<div class="hd-stat-card"><div class="hd-stat-value" style="color:var(--brand)">' + hs.pickrate.toFixed(2) + '%</div><div class="hd-stat-label">Pick Rate</div><div class="hd-stat-bar"><div class="hd-stat-bar-fill" style="width:' + pw.toFixed(1) + '%;background:var(--brand)"></div></div></div>' +
    '<div class="hd-stat-card"><div class="hd-stat-value" style="color:' + wc + '">' + hs.winrate.toFixed(2) + '%</div><div class="hd-stat-label">Win Rate</div><div class="hd-stat-bar"><div class="hd-stat-bar-fill" style="width:' + hs.winrate.toFixed(1) + '%;background:' + wc + '"></div></div></div>' +
    '</div>'
  );
}

// ── Hero Detail Modal ──
async function showHeroDetails(key) {
  const hero = DATA.heroes?.find((h) => h.key === key);
  if (!hero) return;
  const modal = document.getElementById('heroModal');
  document.getElementById('modalHeroName').textContent = '';
  const det = document.getElementById('modalHeroDetails');
  det.innerHTML = '<div class="status" style="animation:pulse 1.5s infinite">Loading hero data &amp; stats...</div>';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  try {
    const [r1, r2] = await Promise.allSettled([
      fetch(API + '/heroes/' + key),
      fetchHeroStatsCached('pc', 'competitive', 'europe'),
    ]);
    const d = r1.status === 'fulfilled' && r1.value.ok ? await r1.value.json() : null;
    const allStats = r2.status === 'fulfilled' ? r2.value : null;
    if (!d) { det.innerHTML = '<div class="status">Error loading hero details.</div>'; return; }

    const roleCap = hero.role.charAt(0).toUpperCase() + hero.role.slice(1);
    let h = '';

    // Header
    h += '<div class="hd-header">';
    h += '<img class="hd-portrait" src="' + hero.portrait + '" alt="' + esc(hero.name) + '" />';
    h += '<div class="hd-info">';
    h += '<h2 class="hd-name">' + esc(hero.name) + '</h2>';
    h += '<span class="hd-role-pill ' + hero.role + '">' + roleCap + '</span>';
    h += '<p class="hd-desc">' + esc(d.description) + '</p>';
    h += '</div></div>';

    // Statistics
    h += '<div class="hd-stats-section">';
    h += '<div class="hd-stats-bar"><h4>Statistics</h4>';
    h += '<div class="hd-mode-toggles">';
    h += '<button type="button" class="hd-mode-btn active" data-gm="competitive">Comp</button>';
    h += '<button type="button" class="hd-mode-btn" data-gm="quickplay">QP</button>';
    h += '<span style="width:1px;background:var(--border);margin:0 .15rem"></span>';
    h += '<button type="button" class="hd-mode-btn active" data-pf="pc">PC</button>';
    h += '<button type="button" class="hd-mode-btn" data-pf="console">Console</button>';
    h += '<span style="width:1px;background:var(--border);margin:0 .15rem"></span>';
    h += '<button type="button" class="hd-mode-btn active" data-rg="europe">EU</button>';
    h += '<button type="button" class="hd-mode-btn" data-rg="americas">NA</button>';
    h += '<button type="button" class="hd-mode-btn" data-rg="asia">Asia</button>';
    h += '</div></div>';
    h += '<div id="hdStatsContent">' + buildHeroStatCards(key, allStats) + '</div>';
    h += '</div>';

    // Abilities
    h += '<div class="hd-abilities-section"><h4>Abilities</h4>';
    const abs = (d.abilities || [])
      .map((a, i) => {
        const icon = a.icon
          ? i === 0
            ? '<img src="' + a.icon + '" alt="" class="ability-wide-image">'
            : '<img src="' + a.icon + '" alt="" class="ability-image">'
          : '';
        return '<div class="ability-box"><div class="ability-header">' + esc(a.name) + '</div><div class="ability-details">' + icon + '<div>' + esc(a.description) + '</div></div></div>';
      })
      .join('');
    h += abs || '<p class="muted">None listed.</p>';
    h += '</div>';

    // Lore
    const chaps = d.story?.chapters || [];
    const fullLore = chaps.length ? chaps.map((c) => '<p>' + esc(c.content) + '</p>').join('') : '<p class="muted">No lore available.</p>';
    const shortLore = chaps.length ? chaps.slice(0, 2).map((c) => '<p>' + esc(c.content) + '</p>').join('') : '<p class="muted">No lore available.</p>';
    const more = chaps.length > 2;
    h += '<div class="hd-lore-section"><h4>Lore &amp; Background</h4>';
    h += '<div class="hd-lore-content" id="heroLore">' + shortLore + '</div>';
    if (more) h += '<button type="button" id="loreToggle" class="btn btn-ghost btn-sm" style="margin-top:.5rem">Show more</button>';
    h += '</div>';

    det.innerHTML = h;

    // Wire up mode toggles
    let curGM = 'competitive', curPF = 'pc', curRG = 'europe';
    async function refreshHeroStats() {
      const sc = document.getElementById('hdStatsContent');
      sc.innerHTML = '<div class="hd-no-stats" style="animation:pulse 1.5s infinite">Loading...</div>';
      const st = await fetchHeroStatsCached(curPF, curGM, curRG);
      sc.innerHTML = buildHeroStatCards(key, st);
    }
    det.querySelectorAll('.hd-mode-btn[data-gm]').forEach((b) => {
      b.addEventListener('click', () => {
        curGM = b.dataset.gm;
        det.querySelectorAll('.hd-mode-btn[data-gm]').forEach((x) => x.classList.toggle('active', x.dataset.gm === curGM));
        refreshHeroStats();
      });
    });
    det.querySelectorAll('.hd-mode-btn[data-pf]').forEach((b) => {
      b.addEventListener('click', () => {
        curPF = b.dataset.pf;
        det.querySelectorAll('.hd-mode-btn[data-pf]').forEach((x) => x.classList.toggle('active', x.dataset.pf === curPF));
        refreshHeroStats();
      });
    });
    det.querySelectorAll('.hd-mode-btn[data-rg]').forEach((b) => {
      b.addEventListener('click', () => {
        curRG = b.dataset.rg;
        det.querySelectorAll('.hd-mode-btn[data-rg]').forEach((x) => x.classList.toggle('active', x.dataset.rg === curRG));
        refreshHeroStats();
      });
    });

    // Wire up lore toggle
    if (more) {
      let exp = false;
      const tb = document.getElementById('loreToggle');
      const lc = document.getElementById('heroLore');
      if (tb && lc) {
        tb.addEventListener('click', () => {
          exp = !exp;
          lc.innerHTML = exp ? fullLore : shortLore;
          tb.textContent = exp ? 'Show less' : 'Show more';
        });
      }
    }
  } catch (e) {
    det.innerHTML = '<div class="status">Error loading hero details.</div>';
  }
}

function closeModal() {
  const m = document.getElementById('heroModal');
  m.classList.add('hidden');
  m.setAttribute('aria-hidden', 'true');
}

// ── Player Search ──
function fmtTag(v) { return v.trim().replace('#', '-'); }
function fmtDur(s) { return s < 3600 ? Math.round(s / 60) + 'm' : Math.round(s / 3600) + 'h'; }

function buildDonut(wr) {
  const c = 251.2, d = (wr / 100) * c, col = wr >= 50 ? 'var(--accent)' : 'var(--damage)';
  return '<div class="donut-chart"><svg viewBox="0 0 90 90"><circle class="donut-ring" cx="45" cy="45" r="40"/><circle class="donut-segment" cx="45" cy="45" r="40" stroke="' + col + '" stroke-dasharray="' + d.toFixed(1) + ' ' + c + '"/></svg><div class="donut-label"><span class="donut-value" style="color:' + col + '">' + wr.toFixed(1) + '%</span><span class="donut-desc">Win Rate</span></div></div>';
}

function openPlayerModal(prefill) {
  const m = document.getElementById('playerModal');
  if (!m) return;
  m.classList.remove('hidden');
  const pi = document.getElementById('playerInput');
  if (pi && prefill) { pi.value = prefill; searchPlayer(); }
  else if (pi && !prefill) { pi.focus(); }
}

function closePlayerModal() {
  const m = document.getElementById('playerModal');
  if (!m) return;
  m.classList.add('hidden');
  const rd = document.getElementById('playerSearchResults');
  const pd = document.getElementById('playerProfile');
  if (rd) rd.innerHTML = '';
  if (pd) { pd.innerHTML = ''; pd.classList.add('hidden'); }
}

function overviewSearch() {
  const inp = document.getElementById('ovSearch');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;
  openPlayerModal(v);
}

async function searchPlayer() {
  const pi = document.getElementById('playerInput');
  const rd = document.getElementById('playerSearchResults');
  const pd = document.getElementById('playerProfile');
  if (!pi || !rd) return;
  const raw = pi.value.trim();
  if (!raw) { rd.innerHTML = '<div class="status">Enter a username or BattleTag.</div>'; return; }
  rd.innerHTML = '<div class="status" style="animation:pulse 1.5s infinite">Searching...</div>';
  rd.classList.remove('hidden');
  if (pd) pd.classList.add('hidden');
  try {
    const r = await fetch(API + '/players?name=' + encodeURIComponent(fmtTag(raw)));
    if (!r.ok) throw new Error();
    const data = await r.json();
    if (!data.results || !data.results.length) {
      rd.innerHTML = '<div class="status">No players found for "' + esc(raw) + '".</div>';
      return;
    }
    rd.innerHTML =
      '<div class="search-results-header"><h3>' + data.total + ' player' + (data.total !== 1 ? 's' : '') + ' found</h3></div><div class="player-results-grid">' +
      data.results.map((p) => {
        const pub = p.is_public !== false;
        return '<div class="player-result-card" data-pid="' + esc(p.player_id) + '"><img class="player-result-avatar" src="' + (p.avatar || 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/daeddd96e58a2150afa6ffc3c5503ae7f96afc2e22899210d444f45dee508c6c.png') + '" alt="" loading="lazy"/><div class="player-result-info"><h4>' + esc(p.name) + '</h4><p>' + esc(p.player_id) + '</p>' + (p.title ? '<p>' + esc(p.title) + '</p>' : '') + '</div><span class="player-result-badge ' + (pub ? 'public' : 'private') + '">' + (pub ? 'Public' : 'Private') + '</span></div>';
      }).join('') + '</div>';
    rd.querySelectorAll('.player-result-card').forEach((c) =>
      c.addEventListener('click', () => loadProfile(c.dataset.pid))
    );
  } catch (e) {
    rd.innerHTML = '<div class="status">Search error. Please try again.</div>';
  }
}

async function loadProfile(pid) {
  const rd = document.getElementById('playerSearchResults');
  const pd = document.getElementById('playerProfile');
  if (!pd) return;
  pd.classList.remove('hidden');
  pd.innerHTML = '<div class="status" style="animation:pulse 1.5s infinite">Loading profile...</div>';
  if (rd) rd.classList.add('hidden');
  try {
    const [r1, r2] = await Promise.allSettled([
      fetch(API + '/players/' + encodeURIComponent(pid) + '/summary'),
      fetch(API + '/players/' + encodeURIComponent(pid) + '/stats/summary'),
    ]);
    const sum = r1.status === 'fulfilled' && r1.value.ok ? await r1.value.json() : null;
    const sts = r2.status === 'fulfilled' && r2.value.ok ? await r2.value.json() : null;
    if (!sum) {
      pd.innerHTML = '<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\u2190 Back</button><div class="status">Profile not found or private.</div>';
      document.getElementById('backBtn').addEventListener('click', backToSearch);
      return;
    }

    let h = '<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\u2190 Back to results</button>';
    if (sum.namecard) h += '<img class="player-namecard" src="' + sum.namecard + '" alt="" loading="lazy"/>';
    h += '<div class="player-profile-header"><img class="player-profile-avatar" src="' + (sum.avatar || 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/daeddd96e58a2150afa6ffc3c5503ae7f96afc2e22899210d444f45dee508c6c.png') + '" alt=""/><div class="player-profile-info"><h3>' + esc(sum.username || 'Unknown') + '</h3><p>' + esc(sum.title || 'No title') + '</p>' + (sum.endorsement ? '<p>Endorsement Level ' + sum.endorsement.level + '</p>' : '') + '</div></div>';

    const comp = sum.competitive;
    if (comp) {
      h += '<h4 class="sub-title">Competitive Ranks</h4>';
      [['pc', 'PC'], ['console', 'Console']].forEach(([key, label]) => {
        const plat = comp[key];
        if (!plat) return;
        if (plat.season) h += '<p class="muted" style="margin-bottom:.4rem">Season ' + plat.season + ' \u2014 ' + label + '</p>';
        h += '<div class="rank-cards-grid">';
        ['tank', 'damage', 'support', 'open'].forEach((role) => {
          const rk = plat[role];
          if (!rk) return;
          h += '<div class="rank-card"><h4>' + role.charAt(0).toUpperCase() + role.slice(1) + '</h4><img src="' + rk.rank_icon + '" alt=""/><p>' + rk.division + ' ' + rk.tier + '</p></div>';
        });
        h += '</div>';
      });
    }

    if (sts && sts.general) {
      const g = sts.general;
      h += '<h4 class="sub-title">Performance Overview</h4><div class="donut-container">' + buildDonut(g.winrate) +
        '<div class="donut-stats-side">' +
        '<div class="ds-row"><span class="ds-label">Games</span><span class="ds-value">' + g.games_played.toLocaleString() + '</span></div>' +
        '<div class="ds-row"><span class="ds-label">Wins</span><span class="ds-value" style="color:var(--accent)">' + g.games_won.toLocaleString() + '</span></div>' +
        '<div class="ds-row"><span class="ds-label">Losses</span><span class="ds-value" style="color:var(--damage)">' + (g.games_played - g.games_won).toLocaleString() + '</span></div>' +
        '<div class="ds-row"><span class="ds-label">KDA</span><span class="ds-value">' + g.kda.toFixed(2) + '</span></div>' +
        '<div class="ds-row"><span class="ds-label">Time</span><span class="ds-value">' + fmtDur(g.time_played) + '</span></div>' +
        '</div></div>';
      h += '<h4 class="sub-title">Combat Stats</h4><div class="stats-grid">' +
        '<div class="stat-card"><div class="stat-number">' + g.total.eliminations.toLocaleString() + '</div><div class="stat-label">Eliminations</div></div>' +
        '<div class="stat-card"><div class="stat-number">' + g.total.deaths.toLocaleString() + '</div><div class="stat-label">Deaths</div></div>' +
        '<div class="stat-card"><div class="stat-number">' + g.total.damage.toLocaleString() + '</div><div class="stat-label">Damage</div></div>' +
        '<div class="stat-card"><div class="stat-number">' + g.total.healing.toLocaleString() + '</div><div class="stat-label">Healing</div></div>' +
        '</div>';
    }

    if (sts && sts.roles) {
      h += '<h4 class="sub-title">Role Breakdown</h4><div class="role-breakdown">';
      let totalT = 0;
      ['tank', 'damage', 'support'].forEach((rk) => { if (sts.roles[rk]) totalT += sts.roles[rk].time_played; });
      [['tank', 'Tank'], ['damage', 'Damage'], ['support', 'Support']].forEach(([key, label]) => {
        const r = sts.roles[key];
        if (!r) return;
        const pct = totalT > 0 ? (r.time_played / totalT) * 100 : 0;
        const wc = r.winrate >= 50 ? 'var(--accent)' : 'var(--damage)';
        h += '<div class="role-bar-card"><div class="rbc-header"><span class="rbc-role" style="color:var(--' + key + ')">' + label + '</span><span class="rbc-wr" style="color:' + wc + '">' + r.winrate.toFixed(1) + '% WR</span></div><div class="rbc-bar"><div class="rbc-bar-fill" style="width:' + pct.toFixed(1) + '%;background:var(--' + key + ')"></div></div><div class="rbc-meta">' + r.games_played.toLocaleString() + ' games \u00b7 ' + fmtDur(r.time_played) + ' \u00b7 ' + r.kda.toFixed(2) + ' KDA</div></div>';
      });
      h += '</div>';
    }

    if (sts && sts.heroes) {
      const entries = Object.entries(sts.heroes).filter((e) => e[1] !== null).sort((a, b) => b[1].time_played - a[1].time_played).slice(0, 10);
      if (entries.length > 0) {
        const maxT = entries[0][1].time_played;
        h += '<h4 class="sub-title">Top Heroes</h4><div class="hero-time-list">';
        entries.forEach(([hk, hs]) => {
          const hd = DATA.heroes?.find((x) => x.key === hk);
          const pt = hd ? hd.portrait : '';
          const dn = hk.replace(/-/g, ' ');
          const bw = maxT > 0 ? (hs.time_played / maxT) * 100 : 0;
          const wc = hs.winrate >= 50 ? 'var(--accent)' : 'var(--damage)';
          h += '<div class="hero-time-row">' + (pt ? '<img src="' + pt + '" alt="" loading="lazy"/>' : '<div></div>') + '<div><span class="htb-name">' + esc(dn) + '</span><div class="htb-bar"><div class="htb-bar-fill" style="width:' + bw.toFixed(1) + '%"></div></div></div><span class="hero-time-stats"><span style="color:' + wc + '">' + hs.winrate.toFixed(0) + '%</span> \u00b7 ' + fmtDur(hs.time_played) + '</span></div>';
        });
        h += '</div>';
      }
    }
    pd.innerHTML = h;
    document.getElementById('backBtn')?.addEventListener('click', backToSearch);
  } catch (e) {
    pd.innerHTML = '<button type="button" class="btn btn-ghost btn-sm back-to-search" id="backBtn">\u2190 Back</button><div class="status">Error loading profile.</div>';
    document.getElementById('backBtn')?.addEventListener('click', backToSearch);
  }
}

function backToSearch() {
  const rd = document.getElementById('playerSearchResults');
  const pd = document.getElementById('playerProfile');
  if (rd) rd.classList.remove('hidden');
  if (pd) pd.classList.add('hidden');
}

// ── Meta Table ──
let metaStatsCache = null;
let metaMaxP = 0;
let metaSortCol = '';
let metaSortDir = 'desc';
const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function renderMetaTable(stats, maxP) {
  const rd = document.getElementById('metaResults');
  if (!stats || !stats.length) { rd.innerHTML = '<div class="status">No stats available.</div>'; return; }
  const cols = [null, 'tier', 'hero', 'pickrate', 'winrate'];
  const labels = ['#', 'Tier', 'Hero', 'Pickrate', 'Winrate'];
  const widths = ['36px', '32px', '', '', ''];
  let t = '<div class="meta-table-wrapper"><table class="meta-table"><thead><tr>';
  for (let ci = 0; ci < cols.length; ci++) {
    const col = cols[ci];
    const w = widths[ci] ? 'width:' + widths[ci] + ';' : '';
    if (!col) {
      t += '<th style="' + w + '">' + labels[ci] + '</th>';
    } else {
      const active = metaSortCol === col;
      const arrow = active ? (metaSortDir === 'asc' ? ' ▲' : ' ▼') : '';
      t += '<th style="' + w + 'cursor:pointer;user-select:none;white-space:nowrap" data-sort-col="' + col + '" class="' + (active ? 'sort-active' : '') + '">' + labels[ci] + '<span class="sort-arrow">' + arrow + '</span></th>';
    }
  }
  t += '</tr></thead><tbody>';
  stats.forEach((e, i) => {
    const hd = DATA.heroes?.find((h) => h.key === e.hero);
    const pt = hd ? hd.portrait : '';
    const dn = (e.hero || '').replace(/-/g, ' ');
    const wc = e.winrate >= 50 ? 'var(--accent)' : 'var(--damage)';
    const pw = maxP > 0 ? (e.pickrate / maxP) * 100 : 0;
    const tier = getTier(e.pickrate, maxP, e.winrate);
    t += '<tr><td style="color:var(--muted);font-weight:600">' + (i + 1) + '</td><td><span class="tier-badge ' + tier.c + '">' + tier.l + '</span></td><td><div class="meta-hero-cell">' + (pt ? '<img class="meta-hero-portrait" src="' + pt + '" alt="" loading="lazy"/>' : '') + ' <span>' + esc(dn) + '</span></div></td><td><div class="stat-bar-wrapper"><div class="stat-bar"><div class="stat-bar-fill pickrate" style="width:' + pw.toFixed(1) + '%"></div></div><span class="stat-value-label">' + e.pickrate.toFixed(2) + '%</span></div></td><td><div class="stat-bar-wrapper"><div class="stat-bar"><div class="stat-bar-fill winrate" style="width:' + e.winrate + '%;background:' + wc + '"></div></div><span class="stat-value-label">' + e.winrate.toFixed(2) + '%</span></div></td></tr>';
  });
  t += '</tbody></table></div>';
  rd.innerHTML = t;
  rd.querySelectorAll('th[data-sort-col]').forEach((th) => {
    th.addEventListener('click', () => sortMetaTable(th.dataset.sortCol));
  });
}

function sortMetaTable(col) {
  if (!metaStatsCache) return;
  if (metaSortCol === col) metaSortDir = metaSortDir === 'desc' ? 'asc' : 'desc';
  else { metaSortCol = col; metaSortDir = 'desc'; }
  const maxP = metaMaxP;
  const sorted = metaStatsCache.slice().sort((a, b) => {
    let va, vb;
    if (col === 'score') { va = getMetaScore(a.pickrate, maxP, a.winrate); vb = getMetaScore(b.pickrate, maxP, b.winrate); }
    else if (col === 'tier') { const ta = getTier(a.pickrate, maxP, a.winrate); const tb = getTier(b.pickrate, maxP, b.winrate); va = tierOrder[ta.l]; vb = tierOrder[tb.l]; }
    else if (col === 'hero') { va = (a.hero || '').toLowerCase(); vb = (b.hero || '').toLowerCase(); return metaSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); }
    else if (col === 'pickrate') { va = a.pickrate; vb = b.pickrate; }
    else if (col === 'winrate') { va = a.winrate; vb = b.winrate; }
    else { va = 0; vb = 0; }
    return metaSortDir === 'asc' ? va - vb : vb - va;
  });
  renderMetaTable(sorted, maxP);
}

let metaRefreshTimer = null;
function startMetaAutoRefresh() {
  stopMetaAutoRefresh();
  metaRefreshTimer = setInterval(fetchHeroStats, 60000);
}
function stopMetaAutoRefresh() {
  if (metaRefreshTimer) { clearInterval(metaRefreshTimer); metaRefreshTimer = null; }
}

async function fetchHeroStats() {
  const pl = document.getElementById('metaPlatform')?.value;
  const gm = document.getElementById('metaGamemode')?.value;
  const rg = document.getElementById('metaRegion')?.value;
  const rl = document.getElementById('metaRole')?.value;
  const rk = document.getElementById('metaRank')?.value;
  const rd = document.getElementById('metaResults');
  if (!pl || !gm || !rg || !rd) return;
  if (!rd.children.length) rd.innerHTML = '<div class="status" style="animation:pulse 1.5s infinite">Loading hero stats...</div>';
  let url = API + '/heroes/stats?platform=' + pl + '&gamemode=' + gm + '&region=' + rg + '&order_by=pickrate:desc';
  if (rl) url += '&role=' + rl;
  if (rk && gm === 'competitive') url += '&competitive_division=' + rk;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    const stats = await r.json();
    if (!stats || !stats.length) { rd.innerHTML = '<div class="status">No stats available.</div>'; return; }
    const maxP = Math.max(...stats.map((s) => s.pickrate));
    metaStatsCache = stats;
    metaMaxP = maxP;
    metaSortCol = '';
    metaSortDir = 'desc';
    const sorted = stats.slice().sort((a, b) => getMetaScore(b.pickrate, maxP, b.winrate) - getMetaScore(a.pickrate, maxP, a.winrate));
    renderMetaTable(sorted, maxP);
  } catch (e) {
    if (!rd.children.length) rd.innerHTML = '<div class="status">Error loading stats.</div>';
  }
}

// ── Event Binding ──
function bind() {
  document.querySelectorAll('.hero-card-button').forEach((b) =>
    b.addEventListener('click', () => { if (b.dataset.heroKey) showHeroDetails(b.dataset.heroKey); })
  );
  document.querySelectorAll('.nav-link').forEach((b) =>
    b.addEventListener('click', () => showSection(b.dataset.section))
  );

  const hs = document.getElementById('heroSearch');
  if (hs) hs.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.heroes-columns .hero-thumb').forEach((c) => {
      const n = (c.dataset.name || '').toLowerCase();
      c.style.display = n.includes(q) ? '' : 'none';
    });
  });

  const ms = document.getElementById('mapSearch');
  if (ms) ms.addEventListener('input', (e) => { state.mapSearch = e.target.value; applyFilter('.map-card', state.mapSearch); });
  const gs = document.getElementById('gamemodeSearch');
  if (gs) gs.addEventListener('input', (e) => { state.gamemodeSearch = e.target.value; applyFilter('.gamemode-card', state.gamemodeSearch); });

  const pi = document.getElementById('playerInput');
  if (pi) pi.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchPlayer(); });
  const pb = document.getElementById('playerSearchBtn');
  if (pb) pb.addEventListener('click', searchPlayer);

  const oi = document.getElementById('ovSearch');
  if (oi) oi.addEventListener('keydown', (e) => { if (e.key === 'Enter') overviewSearch(); });
  const ob = document.getElementById('ovSearchBtn');
  if (ob) ob.addEventListener('click', overviewSearch);

  document.querySelectorAll('.ql-card').forEach((c) =>
    c.addEventListener('click', () => { if (c.dataset.section) showSection(c.dataset.section); })
  );
  document.querySelectorAll('.ov-stat').forEach((c) =>
    c.addEventListener('click', () => { if (c.dataset.section) showSection(c.dataset.section); })
  );
  document.querySelectorAll('.featured-hero').forEach((c) =>
    c.addEventListener('click', () => { if (c.dataset.key) showHeroDetails(c.dataset.key); })
  );

  const ml = document.getElementById('metaLoadBtn');
  if (ml) ml.addEventListener('click', fetchHeroStats);
  ['metaPlatform', 'metaGamemode', 'metaRegion', 'metaRole', 'metaRank'].forEach((fid) => {
    const el = document.getElementById(fid);
    if (el) el.addEventListener('change', fetchHeroStats);
  });
  const mgm = document.getElementById('metaGamemode');
  const mrg = document.getElementById('metaRankGroup');
  if (mgm && mrg) mgm.addEventListener('change', () => { mrg.style.display = mgm.value === 'competitive' ? '' : 'none'; });
  const tt = document.getElementById('themeToggle');
  if (tt) tt.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  // Product switcher
  const psBtn = document.getElementById('productSwitcherBtn');
  const psDrop = document.getElementById('productSwitcherDropdown');
  if (psBtn && psDrop) {
    psBtn.addEventListener('click', (e) => { e.stopPropagation(); psDrop.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => { if (!psDrop.contains(e.target) && e.target !== psBtn) psDrop.classList.add('hidden'); });
  }

  // Header search bar
  const hsb = document.getElementById('headerSearchBtn');
  const hsi = document.getElementById('headerSearchInput');
  const hsd = document.getElementById('headerSearch');
  if (hsb) hsb.addEventListener('click', () => {
    if (!hsd.classList.contains('open')) { hsd.classList.add('open'); hsi.focus(); return; }
    const v = hsi ? hsi.value.trim() : '';
    if (v) openPlayerModal(v);
  });
  if (hsi) hsi.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const v = hsi.value.trim(); if (v) openPlayerModal(v); }
    if (e.key === 'Escape') { hsd.classList.remove('open'); hsi.value = ''; }
  });

  // Player modal
  const pmc = document.getElementById('playerModalClose');
  if (pmc) pmc.addEventListener('click', closePlayerModal);
  const pm = document.getElementById('playerModal');
  if (pm) pm.addEventListener('click', (e) => { if (e.target === pm) closePlayerModal(); });

  const cb = document.getElementById('closeModalBtn');
  if (cb) cb.addEventListener('click', closeModal);
  const modal = document.getElementById('heroModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closePlayerModal(); } });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  initTheme();
  bind();
  showSection('overview');
});

window.OverWatched = { showHeroDetails, closeModal, searchPlayer, loadProfile, backToSearch, fetchHeroStats, overviewSearch, openPlayerModal, closePlayerModal };
