# UnderWatch

UnderWatch is a static Overwatch 2 data hub generated from the OverFast API. It builds a fast, client-friendly site with hero details, roles, gamemodes, maps, and player lookup.

## Highlights

- Modern, responsive UI with light/dark theme toggle
- Hero filtering by name and role
- Gamemode and map search
- Player search with basic competitive ranks
- Cache fallback for API resilience

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

The site is generated into the `public` folder.

## Custom output folder

```bash
node generate-site.js ./dist
```

## Optional flags

- `--output <dir>`: choose output folder
- `--base-url <url>`: override API base URL
- `--no-cache`: disable cached data fallback

Example:

```bash
node generate-site.js --output ./public --base-url https://overfast-api.tekrop.fr
```

## Deploy

The GitHub Actions workflow builds the site and publishes `public` to GitHub Pages.

## License

MIT
