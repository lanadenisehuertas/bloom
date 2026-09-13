# Bloom — Cycle-Synced Body Recomposition Coach — Design Spec

Date: 2026-09-14

## Source of truth

The full feature spec, workout program, nutrition framework, and motivation system are
defined verbatim in `claude-code-build-prompt.md` (copied into this repo as
[`docs/spec-source.md`](../../spec-source.md)). That document is authoritative for:
content (exercises, recipes, copy), the exact calorie/pace formulas, the exact weekly
workout structure, the cycle-phase modifiers, and the adaptive recalculation rules.
This design doc covers *how* it's implemented, plus decisions made during
brainstorming that refine or resolve ambiguity in that source.

## Decisions from brainstorming (override/clarify the source doc)

1. **Theme:** Reuse the reference screenshots' layout language — rounded glassy cards,
   soft drop shadows, pill-shaped tab switchers, circular icons/avatars, ring-style
   progress indicators, generous whitespace — but with a muted palette (warm neutrals,
   sage green, clay/terracotta accents) instead of bright pink-purple gradients. This
   satisfies the source doc's "avoid generic pink-gradient girly-fitness clichés" note
   while matching the requested visual reference.
2. **Scope:** Build all three phases (MVP, cycle+nutrition, motivation+photos) in one
   continuous implementation, in the source doc's stated order.
3. **Pose detection:** Skip entirely. Ship only the illustrated exercise-cue library
   (steps + common-mistakes list per exercise). Do not attempt TensorFlow.js/MediaPipe.
   In its place, each exercise gets a "Watch form videos" action that opens a YouTube
   search (and a TikTok search) pre-filled with `"<exercise name> proper form woman
   workout"`. This is a generated search URL, not a hand-picked specific video —
   specific video URLs can't be verified to stay live/correct, so a search link is the
   only reliable option that won't rot into a dead or wrong link over time.
4. **Stack:** React + Vite + Tailwind CSS, Dexie.js over IndexedDB, Chart.js, lucide-react,
   react-router, vite-plugin-pwa, vitest.
5. **iPhone target:** This is a mobile-first PWA meant to be installed to an iPhone
   home screen via Safari "Add to Home Screen." All layout, interaction, and PWA
   configuration must specifically account for iOS Safari's PWA quirks (see below) —
   not just "responsive design" in general.

## iPhone-specific requirements

iOS Safari's PWA support has real gaps compared to Android/desktop. These must be
handled explicitly, not assumed to "just work":

- **Viewport & safe areas:** `viewport-fit=cover` in the meta tag, and
  `env(safe-area-inset-*)` padding on the outer app shell so content isn't clipped by
  the notch/Dynamic Island or the home indicator bar. Bottom nav/tab bars must add
  `env(safe-area-inset-bottom)` padding.
- **No pinch-zoom on form inputs:** all `<input>`/`<select>` font-size ≥ 16px, or iOS
  Safari auto-zooms on focus, which breaks the layout inside a standalone PWA.
- **100dvh, not 100vh:** iOS Safari's address bar resizes the viewport; use `100dvh`
  (with a `100vh` fallback) for full-height screens like the workout player and
  onboarding, verified via manual testing since dvh support varies by iOS version.
- **Touch targets ≥ 44×44px** (Apple HIG minimum) on all interactive elements —
  exercise-log steppers, tab bars, the "Minimum Viable Day" button, etc.
- **Home screen icons & splash screens:** provide `apple-touch-icon` (180×180) and
  `apple-mobile-web-app-*` meta tags, plus a set of `apple-touch-startup-image` splash
  screens (or rely on the PWA manifest `icons` + `theme_color`/`background_color`,
  whichever `vite-plugin-pwa`'s Apple-splash generator produces) so launching from the
  home screen doesn't show a flash of blank white/wrong-color screen.
- **`display: standalone`** in the manifest so it opens without Safari's browser chrome.
- **No pull-to-refresh / overscroll bounce** on the app shell (`overscroll-behavior:
  none` on `html body`), since accidental pull-to-refresh would be jarring inside a
  fitness app mid-workout.
- **iOS storage caveat:** iOS can evict a web app's IndexedDB data under storage
  pressure or after ~7 days of Safari inactivity in some iOS versions (WebKit's
  Intelligent Tracking Prevention storage cap applies to PWAs added to home screen in
  some iOS releases, less aggressively than in-browser Safari but not zero-risk). This
  is exactly why the source doc's Section 0 backup requirement (export/import JSON)
  matters — surface an explicit "back up your data" nudge in Settings and periodically
  (e.g. monthly) as a non-blocking banner, not just a buried button.
- **Photo capture:** use a plain `<input type="file" accept="image/*" capture="environment">`
  for progress photos — this opens the native camera/photo picker on iOS without any
  extra permissions dance, and stores the resulting Blob directly in Dexie.
- **Testing:** since there's no iOS simulator in this environment, verification is via
  Chrome DevTools responsive mode at iPhone viewport sizes (390×844 iPhone 12/13/14,
  428×926 Plus/Max sizes) plus manual code review against the constraints above. The
  user should do a final real-device "Add to Home Screen" smoke test since some of
  these behaviors (splash screen, storage eviction) can only be truly verified on an
  actual iPhone.

## Architecture

```
src/
  db/              Dexie schema + migrations, export/import (JSON) module
  domain/          pure, unit-testable logic — no React, no Dexie imports
    nutrition.ts       BMR/TDEE/deficit/protein calc, Realistic Goal Screen logic
    cycle.ts           phase detection, learned average cycle length
    workoutProgram.ts  A/B/C/D + recovery day data access, progressive-overload rules
    adaptiveRecalc.ts  Section 7 rules (plateau detection, downshift triggers)
    motivation.ts      streak/grace-day, milestone unlock conditions
    formVideos.ts      builds YouTube/TikTok search URLs per exercise name
  data/            seeded static content — exercises.ts, recipes.ts, workoutProgram.ts
  features/        one folder per screen (see Information Architecture below)
  components/      shared UI primitives: Card, Button, ProgressRing, Modal, Tabs,
                   StatTile, BottomNav — the restyleable design system
  hooks/           useProfile, useTodayLog, useCycle, useWorkoutLog, etc. — thin
                   data-access hooks wrapping db/ + domain/ for features to consume
  App.tsx, main.tsx, router
public/
  manifest.webmanifest (generated by vite-plugin-pwa), icons, apple-touch-icon
```

**Data flow:** UI features call hooks; hooks read/write via `db/` and run results
through `domain/` pure functions. This keeps the safety-critical math (calorie/pace
calculations, cycle-phase detection, downshift triggers) testable in isolation with
vitest, independent of React or IndexedDB.

## Information Architecture (screens)

Matches source doc Section 8 exactly: Onboarding (incl. Realistic Goal screen) →
Today/Home → Workout Player → Exercise Library → Nutrition → Cycle Tracker → Progress
→ Weekly Check-in → Settings. Bottom tab nav for the 6 persistent sections
(Today, Workout, Nutrition, Cycle, Progress, Settings); Onboarding and Weekly Check-in
are modal/full-screen flows reached contextually, not tabs.

## Data model

Exactly as specified in source doc Section 9, implemented as Dexie tables/schema.
`PhotoLog` stores photo Blobs directly (Dexie supports Blob storage natively, unlike
localStorage).

## Testing

- `domain/` modules: vitest unit tests covering the exact worked examples in the
  source doc (e.g. BMR ≈ 1628, TDEE ≈ 2250–2300, Halloween checkpoint ≈ 74–76kg) so
  regressions in the safety-critical math are caught immediately.
- Component-level smoke tests for onboarding flow and workout player (render + basic
  interaction), using React Testing Library.
- Manual verification: PWA installability (Lighthouse PWA audit), offline load after
  first visit, and the iPhone-viewport checks described above.

## Build order

Source doc Section 10, Phases 1 → 2 → 3, as one continuous plan:

1. Project scaffold (Vite + React + Tailwind + PWA plugin + Dexie), design-system
   primitives, routing shell with iPhone-safe-area layout.
2. Phase 1: onboarding + Realistic Goal screen, Today dashboard, Workout Player with
   hardcoded A/B/C/D program, weight/measurement tracking, offline installability.
3. Phase 2: cycle tracker + phase-based workout modifiers, nutrition engine + Filipino
   meal bank + grocery list generator, adaptive recalculation logic.
4. Phase 3: motivation system (streaks/grace-day/milestones/auto-downshift), progress
   photos + comparison view, export/import, final polish + iPhone verification pass.

## Out of scope

- Backend, auth, cloud sync, analytics, paid APIs (per source doc Section 0).
- On-device pose detection (explicitly skipped per brainstorming decision #3).
