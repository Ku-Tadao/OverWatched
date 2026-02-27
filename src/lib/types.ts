export interface Hero {
  key: string;
  name: string;
  portrait: string;
  role: 'tank' | 'damage' | 'support';
}

export interface Role {
  key: string;
  name: string;
  icon: string;
  description: string;
}

export interface Gamemode {
  key: string;
  name: string;
  icon: string;
  description: string;
}

export interface GameMap {
  name: string;
  screenshot: string;
  location?: string;
  country_code?: string;
  gamemodes?: string[];
}

export interface BuildInfo {
  generatedAt: string;
}

export interface OverWatchedData {
  heroes: Hero[];
  roles: Role[];
  gamemodes: Gamemode[];
  maps: GameMap[];
  buildInfo: BuildInfo;
  baseUrl: string;
}
