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
cp .env.example .env
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

These commands rely on the `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK` env var from the `.env` file
created during [Installation](#installation) (Expo's CLI loads `.env` automatically, regardless of
how the dev server is launched — terminal, `npm run` script, or an IDE's "Run" button). It works
around a Metro SDK 56+ guard that throws if `expo-router` and `@react-navigation/core` are both
resolvable in `node_modules` — which is always true here, since `expo-router` ships as an internal
transitive dependency of `expo`'s own CLI regardless of whether the app uses it. The app itself has
no `expo-router` imports (see
[React Navigation over expo-router](#react-navigation-native-stack--bottom-tabs-directly-not-expo-router)),
so this is a false positive the check can't distinguish from a real conflict. The `npm run
start`/`ios`/`android` scripts also set this var inline as a redundant fallback in case `.env` is
ever missing.

Other scripts:

```bash
npm run lint           # ESLint
npm run format         # Prettier — format everything
npm run format:check   # Prettier — check without writing
```

### Environment configuration

**No secrets or API keys.** The app's entire backend is mocked in-process (see
[Mocked backend](#mocked-backend-not-a-real-api-or-local-server) below), so there's nothing
external to configure. The one `.env` file that exists (created via `cp .env.example .env` above)
holds a single non-secret build-tooling flag, `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK` — see
[Running the application](#running-the-application) for what it does. `.env` is gitignored per
convention even though its value isn't sensitive here; `.env.example` documents the real value
since there's nothing project-specific to fill in.

### Logging in

Authentication is mocked — there's no real backend to authenticate against. Enter **any
syntactically valid email** (e.g. `test@example.com`) and **any password of 6+ characters**; the
login only validates format, not identity.

## Architecture Overview

### Project structure

```
src/
  app/                    # composition root
    routes/               # RootNavigator, AuthNavigator, AppNavigator, TabsNavigator, param lists
    index.tsx             # app root: providers, NavigationContainer, error boundary, offline banner
  features/               # one folder per business domain
    auth/                 # login screen, auth store
    communities/          # communities list/details screens, components, hooks, service,
                          # mutations (join/leave optimistic updates), types
    posts/                # create-post screen, post components, hooks, service, types
  shared/                 # cross-cutting code every feature depends on
    components/           # ThemedText, ThemedView, Button, Avatar, ErrorBoundary, etc.
    hooks/                # useTheme, useIsOnline, useDebouncedValue, etc.
    lib/                  # query client, query persister, MMKV storage
    services/             # generic API-simulation infra (ApiError, simulateNetwork)
    store/                # theme-store (dark mode preference)
    styles/               # theme tokens (colors, spacing, radius, fonts)
    types/                # generic shared types (PaginatedResult)
    utils/                # generic utilities (delay, relative-time formatting)
index.js                  # registers src/app as the root component
```

Each feature follows the same internal shape — e.g. `features/communities/` has
`components/`, `screens/`, `hooks/`, `dummy-data.ts` (the seeded in-memory records),
`service.ts` (fetch/join/leave + query-key factories), `mutations.ts` (optimistic join/leave
wiring), `types.ts`, and a single `index.ts` public barrel. `dummy-data.ts` is intentionally not
re-exported from that barrel — it's an internal implementation detail of `service.ts`, not part of
the feature's public surface. Other code — other features, `app/routes/`, tests — only ever imports
through the barrel; files _inside_ a feature import each other directly rather than through their
own feature's barrel, to avoid circular re-exports. See
[Feature-based architecture](#feature-based-architecture-over-a-layer-based-src-layout) below for
why the codebase is organized this way.

Navigation is built directly on React Navigation, not file-based routing: `RootNavigator`
conditionally renders an `AuthNavigator` (native stack, login only) or an `AppNavigator` (native
stack containing the tabs navigator plus the community-details/create-post screens) based on
session state read from the Zustand auth store — see
[React Navigation over expo-router](#react-navigation-native-stack--bottom-tabs-directly-not-expo-router)
below for why.

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
       → feature service function (features/communities/service.ts, features/posts/service.ts)
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

### React Navigation (native stack + bottom tabs) directly, not expo-router

The project template scaffolded expo-router, which is itself built on React Navigation, so it
satisfied the "use React Navigation" requirement early on. It was later switched to
`@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
directly, with explicit navigators (`AuthNavigator`, `AppNavigator`, `TabsNavigator`) and a
`RootNavigator` that conditionally renders `AuthNavigator` or `AppNavigator` based on session
state, instead of file-based routes with layout-level redirects. This keeps the same navigation
behavior that "preserve list state when navigating back from details" depends on — the tabs
screen stays mounted underneath a pushed details screen — while making the navigator/screen wiring
explicit and typed
(`AuthStackParamList`, `AppStackParamList`, `MainTabParamList`) rather than inferred from a file
tree. No native dependencies changed: `react-native-screens`, `react-native-safe-area-context`,
and `react-native-gesture-handler` were already installed (expo-router depends on them too), so
this was a JS/TS-only change with no dev client rebuild required.

### Feature-based architecture over a layer-based `src/` layout

The codebase is organized by business domain rather than by technical layer:
`features/auth/`, `features/communities/`, and `features/posts/` each own their own screens,
components, hooks, service/mutation logic, and types behind a single public `index.ts` barrel.
Cross-cutting code every feature depends on (themed components, the query client, storage, theme
tokens) lives in `shared/`; the navigator setup and app root live in `app/`.

### Mocked backend (not a real API or local server)

The assignment allows any of: a public API, a mocked backend, or a local mock server. A real
public API was ruled out because this app needs full control over mutation success/failure (to
prove out optimistic updates, retry, and the offline queue), and anonymous public APIs are almost
always read-only. A local mock server (e.g. `json-server`) was considered and rejected: it needs a
second process to run, and its network address differs across iOS Simulator (`localhost`), Android
Emulator (`10.0.2.2`), and a physical device (LAN IP) — real setup friction for a reviewer, with no
benefit, since React Query's `queryFn`/`mutationFn` behaves identically whether it calls `fetch()`
over a socket or an in-process async function. The mocked service functions
(`features/communities/service.ts`, `features/posts/service.ts`) simulate real latency and a 10%
random failure rate, so loading/error/retry paths are genuinely exercised rather than only
reachable in theory.

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

## Future Improvements

With additional time, these are the areas I'd prioritize next:

- **Testing.** No automated tests exist yet. I'd start with unit tests for the pure logic
  (`features/*/service.ts`, `features/communities/mutations.ts`, form validation) and integration
  tests for the offline-queue and optimistic-update flows, since those are the highest-risk,
  hardest-to-manually-verify paths.
- **Post creation offline-restart queueing.** Extend the same `setMutationDefaults` +
  `resumePausedMutations` pattern used for join/leave to post creation, so a post drafted and
  submitted while offline also survives an app kill/restart before reconnecting, not just a live
  session.
- **Accessibility pass.** Explicit `accessibilityLabel`/`accessibilityRole` props, focus order, and
  screen-reader verification haven't been done — the app is usable but not verified accessible.
- **CI/CD.** Wire up a GitHub Actions workflow to run `tsc`, `lint`, and tests on every PR, and
  eventually EAS Build for release artifacts.
- **Real API integration.** Swap the in-process mock services for a real backend or a proper local
  mock server, now that the `queryFn`/`mutationFn` boundary already isolates that concern.
- **Analytics/event tracking.** No usage analytics are wired in; would add a lightweight event layer
  around key actions (join/leave, post creation, search/sort usage) to inform product decisions.
