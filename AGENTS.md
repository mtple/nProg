# AGENTS.md

Documentation for AI agents working in this repository.

## Build & Dev Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint (Next.js + TypeScript rules)
```

Package manager is **pnpm** (10.29.3). No test framework is configured.

## Architecture

**nProg** is a Next.js 16 (App Router) music platform for discovering and playing tracks from the InProcess timeline. TypeScript, React 19, Tailwind CSS v4, TanStack React Query.

### Path alias

`@/*` maps to `./src/*`

### Provider stack (in layout.tsx)

`QueryProvider` → `AuthProvider` → `AudioProvider` → page content + `AudioPlayer`

- **QueryProvider**: React Query with 5min stale time, no auto-refetch
- **AuthProvider**: JWT auth via email codes, stored in localStorage (`inp_token`, `inp_email`)
- **AudioProvider**: Single shared `<audio>` element, queue-based playback with fallback gateways

### Data flow

1. `useTimeline()` fetches paginated timeline from `api.inprocess.world/api/timeline`
2. Metadata resolved concurrently (20 parallel requests, batched UI updates every 50ms)
3. Tracks diversified across artists via round-robin interleaving on home page
4. Blocked artist addresses filtered during metadata resolution (see `lib/consts.ts`)

### Media URL resolution (`lib/resolveMediaUrl.ts`)

Handles `ar://`, `ipfs://`, `https://`, `http://` schemes. Arweave/IPFS gateways configured in `next.config.ts`. Audio player has fallback gateway support (arweave.net → node2.irys.xyz).

### Routes

- `/` — Home feed (latest tracks, collections grid, artist mosaic)
- `/moment/[id]` — Track detail with comments
- `/artist/[address]` — Artist profile (filtered feed)
- `/collection/[address]` — Collection detail

### API routes (under `src/app/api/`)

- `auth/send-code` and `auth/login` — proxy to InProcess OAuth
- `collect` — proxy collect/purchase (requires auth token)

### Key components

- `FeedGrid` — main feed display, used on home/artist/collection pages
- `ArtistMosaic` — grouped grid layout with varying tile sizes
- `TrackTile` — individual track card with play button
- `AudioPlayer` — fixed bottom player with seek, volume, queue controls
- `MomentDetail` — full track page with metadata and comments

### Backend API

All calls go through `lib/api.ts` to `https://api.inprocess.world/api`. API key is in `.env` as `INPROCESS_API_KEY`.
