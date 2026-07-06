# HubConnect

A Community Hub mobile app built with Expo, React Native, and TypeScript. Users browse and
search communities, view details and posts, join/leave communities, and create posts — all
backed by a mocked API layer, with offline resilience baked in throughout.

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- Xcode (for iOS) and/or Android Studio (for Android) — a **dev client build is required**; this
  app cannot run in plain Expo Go (see [Key Decisions](#key-decisions--tradeoffs) for why)

### Installation

```bash
npm install
```

### Running the application

This project uses a native module (`react-native-mmkv`) for local storage, which Expo Go cannot
load. You need to build a dev client once, then use it for day-to-day development:

```bash
# One-time: generate native projects and build + install the dev client
npx expo prebuild
npx expo run:ios       # or: npx expo run:android

# Day-to-day: start Metro and connect to the already-installed dev client
npx expo start --dev-client
```

Other scripts:

```bash
npm run lint           # ESLint
npm run format         # Prettier — format everything
npm run format:check   # Prettier — check without writing
```

### Environment configuration

**None required.** There are no API keys, base URLs, or `.env` files — the app's entire backend
is mocked in-process (see [Mocked backend](#mocked-backend-not-a-real-api-or-local-server) below),
so there's nothing external to configure. This is a deliberate simplification, not an oversight.

### Logging in

Authentication is mocked — there's no real backend to authenticate against. Enter **any
syntactically valid email** (e.g. `test@example.com`) and **any password of 6+ characters**; the
login only validates format, not identity.

## Architecture Overview

### Project structure

```
src/
  app/                    # expo-router file-based routes
    (auth)/               # unauthenticated flow — login
    (app)/                # authenticated flow — tabs + community details/create-post
    _layout.tsx           # root layout: providers, error boundary, offline banner
  components/             # reusable UI components (ThemedText, ThemedView, list items, etc.)
  hooks/                  # data-fetching hooks (React Query) + small UI hooks
  services/               # mocked API layer (communities, posts, error normalization)
  store/                  # Zustand stores (auth/session)
  lib/                    # cross-cutting infra (query client, persister, mutation defaults, storage)
  types/                  # shared domain types (Community, Post, pagination)
  constants/              # theme tokens (colors, fonts)
  utils/                  # generic utilities (delay)
```

Routes are file-based (folders/files under `src/app`), so the navigation tree is visible directly
in the file structure — `(auth)` and `(app)` are separate route groups, each gated by a layout
that checks session state and redirects accordingly.

### State management approach

Two tools, each doing what it's best at:

- **React Query** for all server state — the communities list, community details, and posts.
  This covers pagination, caching, background refetch, and (most importantly for this app)
  optimistic mutations with rollback and retry, all through configuration rather than hand-rolled
  state machines.
- **Zustand** for client/session state — just the auth token, email, and status. This is small,
  changes infrequently (login/logout only), and doesn't need React Query's async machinery.

See [Key Decisions](#key-decisions--tradeoffs) for the reasoning behind this split over
alternatives (Redux Toolkit, Context, etc.).

### Data flow

```
Screen → React Query hook (useCommunities, useCommunity, usePosts, ...)
       → mocked service function (services/communities.ts, services/posts.ts)
       → in-memory "database" (seeded arrays), with simulated latency + a 10% random failure
```

Mutations (join/leave, create post) follow an optimistic pattern: the UI updates immediately via
`queryClient.setQueryData`, the mock call happens in the background, and on failure the change is
rolled back (join/leave) or flagged for retry in place (post creation) — never silently lost.

### Offline strategy

- **Detection:** `@react-native-community/netinfo` is wired into React Query's `onlineManager`,
  which becomes the single source of truth for "online" across the whole app (both the data layer
  and the UI's offline banner read from it).
- **Caching:** `PersistQueryClientProvider` persists the entire React Query cache (communities
  list, community details, posts) to MMKV, so the last successful data survives app restarts and
  is available immediately even when offline.
- **Queueing:** join/leave mutations are registered globally via `queryClient.setMutationDefaults`
  rather than defined inline. This is what allows them to **resume after a full app restart**, not
  just pause mid-session — `resumePausedMutations()` is called once the persisted cache rehydrates,
  so an action taken while offline (even if the app was killed before reconnecting) fires for real
  once connectivity returns.
- **Recovery:** because queries/mutations use React Query's default `networkMode: 'online'`, they
  simply pause while offline and automatically refetch/resume once `onlineManager` reports back
  online — no custom reconnect logic needed.

## Key Decisions & Tradeoffs

### Expo (with a dev client) over bare React Native CLI

Nothing in this app's requirements needed custom native code up front, so Expo's faster iteration
and simpler setup won out over bare CLI's extra native-config overhead. Adding `react-native-mmkv`
later meant giving up plain Expo Go in favor of a dev client build — a one-time cost
(`expo prebuild` + `expo run:ios`/`run:android`), not a re-architecture.

### React Query + Zustand over Redux Toolkit or Context

React Query gives pagination (`useInfiniteQuery`), optimistic updates, retry, and offline
mutation pausing largely through configuration. Redux Toolkit + RTK Query is a legitimate
alternative and was seriously considered, but would have meant hand-building more of the
pagination-merge and offline-queue logic ourselves. Zustand covers the small session-state slice
without Redux's boilerplate. Context was ruled out for server state specifically because it has no
built-in caching/retry/pagination story — it would mean rebuilding what React Query already does.

### expo-router over classic React Navigation

expo-router is built on React Navigation, so it satisfies "use React Navigation" while adding
typed routes, file-based structure, and automatic code splitting for free. Classic React
Navigation's conditional-stack pattern for auth flows is equally capable — the deciding factor was
that expo-router was already scaffolded by the project template, so switching would have meant
writing boilerplate (linking config, manual screen registration) for no functional gain.

### Mocked backend (not a real API or local server)

The assignment allows any of: a public API, a mocked backend, or a local mock server. A real
public API was ruled out because this app needs full control over mutation success/failure (to
prove out optimistic updates, retry, and the offline queue), and anonymous public APIs are almost
always read-only. A local mock server (e.g. `json-server`) was considered and rejected: it needs a
second process to run, and its network address differs across iOS Simulator (`localhost`), Android
Emulator (`10.0.2.2`), and a physical device (LAN IP) — real setup friction for a reviewer, with no
benefit, since React Query's `queryFn`/`mutationFn` behaves identically whether it calls `fetch()`
over a socket or an in-process async function. The mocked service functions (`services/*.ts`)
simulate real latency and a 10% random failure rate, so loading/error/retry paths are genuinely
exercised rather than only reachable in theory.

### MMKV over AsyncStorage

MMKV is synchronous, which meaningfully simplifies session hydration — the auth store reads its
persisted token at module load, before first render, with no loading-state flash to manage. The
tradeoff is losing plain Expo Go (MMKV is a native module, requiring a dev client) — accepted
knowingly, and it's also what backs the query cache persister and per-community post drafts, so
one storage mechanism is used consistently everywhere instead of mixing MMKV and AsyncStorage.

### Typed API errors

Mocked service failures are normalized into an `ApiError` class with a `kind`
(`Network` | `NotFound`), rather than throwing generic `Error`s. This lets retry logic and the
offline queue distinguish "this is a transient network failure, worth retrying" from "this
resource genuinely doesn't exist," which a generic `Error` can't express.

### FlashList over FlatList

Chosen specifically for the "efficient list rendering" requirement — FlashList's cell-recycling
approach is a well-established, low-effort win over FlatList for this kind of list, and its v2
release (used here) no longer requires manual `estimatedItemSize` tuning.

### Enums for status-like fields

`AuthStatus`, `PostStatus`, and `CommunitySort` are all TypeScript enums rather than string-literal
unions, for consistency and to make status comparisons (`status === AuthStatus.Authenticated`)
self-documenting at call sites.

### Assumptions

- Login accepts **any** syntactically valid email and any password ≥ 6 characters — there's no
  real backend to check credentials against, and requiring a specific hardcoded credential would
  add friction for a reviewer without adding real security (see note below).
- The mock auth token is stored **unencrypted** in MMKV. It's fake and there's nothing sensitive
  to protect; a real app would derive the storage encryption key from the OS Keychain/Keystore
  rather than embedding one in the JS bundle (any key readable by JS ends up in the bundle, since
  this app has no backend to keep a key secret from the client). A dummy `.env`
  credential/encryption key was considered and deliberately rejected for the same reason —
  client-bundled values aren't secret in a React Native app either way.
- Mock community data (Downtown Dubai, Dubai Hills Estate, Arabian Ranches, etc.) reflects Emaar's
  well-known Dubai master communities from general knowledge, **not** a verified/live source —
  fine for demo purposes, but should be cross-checked before any presentation-facing use.
- Only join/leave mutations are registered for offline-queue resumption after an app restart;
  post creation pauses/resumes correctly within a live session but wasn't extended to the same
  restart-survival pattern, since the assignment specifically calls out join/leave for queueing.
