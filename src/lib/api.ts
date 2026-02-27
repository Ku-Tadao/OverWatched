import type { Hero, Role, Gamemode, GameMap, BuildInfo, OverWatchedData } from './types';

const DEFAULT_API_BASE_URL = 'https://overfast-api.tekrop.fr';
const ENDPOINTS = ['heroes', 'roles', 'gamemodes', 'maps'] as const;

async function fetchWithRetry(baseUrl: string, endpoint: string, retries = 2): Promise<unknown> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/${endpoint}`, {
        headers: { 'User-Agent': 'OverWatched/4.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

export async function fetchAllData(baseUrl = DEFAULT_API_BASE_URL): Promise<OverWatchedData> {
  const settled = await Promise.allSettled(
    ENDPOINTS.map((ep) => fetchWithRetry(baseUrl, ep))
  );

  const results: Record<string, unknown> = {};
  ENDPOINTS.forEach((ep, i) => {
    if (settled[i].status === 'fulfilled') {
      results[ep] = (settled[i] as PromiseFulfilledResult<unknown>).value;
    } else {
      results[ep] = [];
      console.error(`Failed to fetch ${ep}:`, (settled[i] as PromiseRejectedResult).reason?.message);
    }
  });

  return {
    heroes: Array.isArray(results.heroes) ? (results.heroes as Hero[]) : [],
    roles: Array.isArray(results.roles) ? (results.roles as Role[]) : [],
    gamemodes: Array.isArray(results.gamemodes) ? (results.gamemodes as Gamemode[]) : [],
    maps: Array.isArray(results.maps) ? (results.maps as GameMap[]) : [],
    buildInfo: {
      generatedAt: new Date().toISOString(),
    },
    baseUrl,
  };
}
