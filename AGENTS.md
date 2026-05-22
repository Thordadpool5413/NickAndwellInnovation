## Goal
- Complete all five phases of the enhancement roadmap, stabilize CI, optimize build size, and extract the monolithic page component.

## Constraints & Preferences
- App is Next.js 15.5.18 on Node 20, running on Windows.
- All source under `C:\Users\NickL\andwell-app\`.
- Use `node_modules\.bin\next.cmd dev --port 3000` to start dev server.
- Dark theme default; light theme toggle via `ThemeToggle` button + `.light` CSS class.
- Build ignores TS errors unless `CIH_STRICT_BUILD=1`.
- Authentication is opt-in: requires `NEXTAUTH_SECRET` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to activate.

## Progress
### Done
- **Phases 1–5 complete**: Zustand store, ErrorBoundary, growth-plan bridge, ThemeProvider with localStorage, `.light` CSS palette, embedding/rag/llm-provider AI stack, claim-governance safe rewriting, battlecard-builder scoring, deterministic decision-queue, competitor monitoring, auth (NextAuth + Supabase), PDF/image extraction, export/print.
- **All TS errors fixed**: 15 pre-existing, 54 growth-plan, 79 strict — all 0 errors.
- **ESLint**: Migrated to flat config (`eslint.config.js`), 0 errors (1 intentional warning).
- **Error/status pages**: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`.
- **Favicon + PWA**: `app/icon.svg`, `app/manifest.ts`.
- **Stale files removed** (11): jsconfig, hostinger-build, webpack.yml, .node-version, .nvmrc, deployment-version, 5 starter SVGs.
- **Missing script created**: `scripts/patch-standalone-server.js`.
- **`lib/types.ts` split into 6 domain files** under `lib/types/`:
  - `core.ts` — Status, Confidence, ThreatLevel, etc.
  - `crawl.ts` — CrawledPage, EvidenceSource
  - `competitor.ts` — AIServiceLineDepth, AICompetitorExtraction, SubserviceFinding, Finding, CompetitorScore, CompetitorAnalysis
  - `expert.ts` — ExpertRecommendation, ExpertFieldPlay, ExpertWatchItem, ExpertBrief
  - `referral.ts` — CategorizedClaim, ReferralSourceProfile
  - `intelligence.ts` — IntelligenceReport
  - `index.ts` — barrel re-export (backward compat for 59 existing import sites).
- **Build size optimized**: `app/page.tsx` uses `dynamic(() => import(...).then(m => m.*))` for 37 view components. `/` page: **40.2 kB** (First Load JS: **143 kB**).
- **Extracted 7 concerns from `page.tsx`** (200 → ~25 lines):
  - `lib/command-center/constants.ts` — navIcons, navGroups, workspaceToolsConfig, viewNames
  - `components/command-center/Sidebar.tsx` — brand + role selector + nav
  - `components/command-center/WorkspaceTools.tsx` — workspace toolbar (was inline in page)
  - `components/command-center/FeedbackBar.tsx` — error/notice/busy display
  - `components/command-center/PageHeader.tsx` — top bar with status + actions
  - `lib/command-center/use-derivations.ts` — `useCommandCenterDerivedData` hook (7 useMemo calls)
  - `components/command-center/ViewRouter.tsx` — 40-branch view conditional + ErrorBoundary
- **Tests written for mongodb.ts + supabase.ts**: `lib/mongodb.test.ts` (7 tests, covers unconfigured/configured/whitespace trimming/caching), `lib/supabase.test.ts` (6 tests, covers unconfigured/fallback key/caching). Both use `vi.resetModules()` + top-level class mocks to avoid module caching issues.
- **Integration tests added**: `lib/integration.test.ts` — 9 tests using real file I/O (temp `.data-test-integration/` directory), covers readStore/saveCompetitors/deduplication/cap-500/saveReport/getReport/saveReview/saveCatalogOverride.
- **Test suite**: 63 → **66 test files**, 935 → **957 tests passing**.
- **CI gates**: typecheck:strict 0 errors, lint 0 errors (1 warning), build succeeds, **957 tests pass across 66 files**.

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Type barrel (`lib/types/index.ts`) kept for backward compat — 59 import sites unchanged since types are erased at compile time (zero bundle impact).
- Dynamic imports in `page.tsx` use `.then(m => m.ComponentName)` pattern — all 37 view components are named exports, not default exports.
- Extracted components (`Sidebar`, `PageHeader`, `FeedbackBar`, `WorkspaceTools`, `ViewRouter`) read from Zustand store directly via `useCommandCenter()` — no prop threading needed.
- `useCommandCenterDerivedData` hook takes `growthScenario` + `currentReport` as args (avoids redundant store subscriptions in parent).
- mongodb/supabase tests use `vi.resetModules()` + `vi.stubEnv` per `load()` helper alongside a top-level `class MockMongoClient` (no `vi.hoisted`) — avoids `TypeError: not a constructor` from hoisted factory mismatch.
- Integration tests use real `fs` (no mocking) with temp directory + `CIH_DATA_DIR` env — verifies JSON serialization/deserialization end-to-end.
- `ViewRouter` moves `ErrorBoundary` wrapping to component level (was in page.tsx), keeps error boundary per view-switch.

## Next Steps
- (none — all roadmap items complete)

## Critical Context
- **CI gates all green**: typecheck:strict 0 errors, lint 0 errors (1 intentional warning), **957 tests pass** across **66 test files**.
- `/` page: **40.2 kB** / First Load JS: **143 kB** (shared: 103 kB).
- Phase 3 embedding model (`Xenova/all-MiniLM-L6-v2`) downloads on first use — ~80 MB, ~10-15s on cold start.
- Phase 5 auth is middleware-gated — `middleware.ts` runs unless `NEXTAUTH_SECRET` + `SUPABASE_URL` absent.
- Phase 5 PDF crawl parses via `pdf-parse` (text-based PDFs only; scanned/image-only PDFs yield empty text).
- `.data/` directory already contains `competitive-intelligence-hub.json`; `.data/cache/` created on first write.
- 11 stale files removed from repo (see Progress).
- `scripts/patch-standalone-server.js` created — patches Hostinger standalone deployment.
- `lib/integration.test.ts` creates `.data-test-integration/` on each run, cleaned up in `afterEach`.
- mongodb/supabase test pattern: `class MockX {}` (top-level, no `vi.hoisted`) + `vi.mock('dep', () => ...)` + `load()` helper that calls `vi.resetModules()` before each dynamic `import('./module')` — guarantees fresh module evaluation with new env vars per test.

## Relevant Files
- `lib/types/` (6 files + barrel index): Domain-split type definitions (replaces monolithic `lib/types.ts`).
- `lib/command-center/constants.ts`: Centralized icon map, nav groups, workspace tools config, view names.
- `lib/command-center/use-derivations.ts`: Encapsulated memoized derivations from growthScenario + currentReport.
- `components/command-center/Sidebar.tsx`, `WorkspaceTools.tsx`, `FeedbackBar.tsx`, `PageHeader.tsx`, `ViewRouter.tsx`: Extracted page sections.
- `app/page.tsx`: Now ~25 lines composing the extracted components.
- `lib/mongodb.test.ts`, `lib/supabase.test.ts`: Unit tests for DB connection utilities (previously untested).
- `lib/integration.test.ts`: Integration tests with real file I/O (JSON persistence pipeline).
- `lib/store.ts`, `lib/mongodb.ts`, `lib/supabase.ts`: Persistence layer (store uses JSON fallback + optional MongoDB/Supabase).
- `eslint.config.js`: Flat config for ESLint 9 (replaces deleted `.eslintrc.json`).
- `vitest.config.ts`, `vitest-setup.ts`: Test harness config + DOM matcher setup.
