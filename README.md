# OverWatched

OverWatched is a static Overwatch data hub built with [Astro](https://astro.build), powered by the [OverFast API](https://overfast-api.tekrop.fr). It serves a fast, client-friendly site with hero details, roles, gamemodes, maps, and player lookup.

## Highlights

- Built with **Astro** — modern static site generator with component-based architecture
- Modern, responsive UI with light/dark theme toggle
- Hero filtering by name and role
- Live hero meta with tier rankings, pickrate, and winrate
- Player search with competitive ranks and performance stats
- Gamemode and map search
- Data fetched at build time from the OverFast API

## Project Structure

```
src/
  components/     # Astro components (Overview, Heroes, Maps, etc.)
  layouts/        # Page layout (header, nav, footer, modals)
  lib/            # Data fetching, types, and SVG icons
  pages/          # Astro pages (index.astro)
  scripts/        # Client-side JavaScript
  styles/         # Global CSS
```

## Requirements

- Node.js 20+

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts a dev server with hot reload at `localhost:4321`.

## Build

```bash
npm run build
```

The site is generated into the `dist/` folder.

## Preview

```bash
npm run preview
```

Preview the built site locally before deploying.

## Deploy

The GitHub Actions workflow automatically builds the site and deploys `dist/` to GitHub Pages on every push to `main`, or on a daily schedule.

## License

MIT
