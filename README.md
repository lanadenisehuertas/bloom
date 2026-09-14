# 🌸 Bloom

**A private, offline, cycle-synced body-recomposition coach — built for one person, running entirely on their phone.**

No login. No backend. No subscriptions. No one but you ever sees your data.

---

## What this is

Bloom is a mobile-first [Progressive Web App](https://bloom-liart-delta.vercel.app/) that turns a research-backed nutrition and strength program into a coach that actually adapts:

- 🏋️ **A real 4-day strength program** (glutes/hips, upper body/arms/back, core, legs + cardio) built for home equipment — two dumbbells and a resistance band, nothing else
- 🔄 **Synced to your actual cycle** — tap the days you bleed on a real calendar, and Bloom learns your real cycle length and period length from it (not a textbook 28-day guess), automatically easing workout intensity during your period and nudging progressive overload in your highest-capacity week
- 🍽️ **A flexible nutrition engine** — a calorie/protein target calculated from your stats (Mifflin-St Jeor + activity level), a Filipino-budget meal bank, a grocery list generator, and real-time calorie logging
- 📈 **Progress tracking that resists noise** — 7-day rolling average weight (not jittery daily numbers), measurements, photo comparisons, and milestone badges tied to *your* actual goals
- 💛 **Built to survive a bad week** — a "Minimum Viable Day" button, grace-day streaks, and automatic intensity downshifts after missed sessions, because all-or-nothing thinking is what kills most fitness apps
- 🛡️ **A safety check baked into onboarding** — Bloom will never silently accept an unsafe weight-loss pace; it reframes the goal with real math and lets you decide

Everything — profile, logs, photos, cycle data — lives only in your browser's local storage ([IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)). Nothing is ever sent anywhere.

---

## Getting it on your phone

Bloom installs like a native app with zero App Store, zero developer account, and zero cost:

1. Open the app's URL in **Safari** on your iPhone (must be Safari — it's the only browser that can install PWAs on iOS)
2. Tap the **Share** icon
3. Tap **Add to Home Screen**

From then on it works fully offline.

---

## Tech stack

| | |
|---|---|
| **Framework** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS (custom "claymorphism bento" design system) |
| **Storage** | Dexie.js over IndexedDB — 100% local, no backend |
| **Charts** | Chart.js |
| **PWA** | vite-plugin-pwa (offline-first service worker, installable manifest) |
| **Testing** | Vitest + React Testing Library + fake-indexeddb |

## Running it locally

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # type-check + production build
npm run lint      # eslint
npm run test      # vitest
npm run preview   # serve the production build locally
```

## Project structure

```
src/
├── domain/       # pure, fully-tested business logic (nutrition, cycle, workout program, adaptive recalc...)
├── hooks/        # Dexie-backed React hooks (useProfile, useCycle, useWorkoutLog...)
├── features/     # screens, grouped by area (dashboard, workout, nutrition, cycle, progress, settings...)
├── data/         # static seed content (exercises, workout program, recipes, foods)
├── components/   # shared UI primitives (Card, Button, Modal, tone system...)
└── db/           # Dexie schema + backup/restore
```

Domain logic is kept pure and separate from the UI on purpose — the nutrition math, cycle-phase detection, and adaptive recalculation rules are all independently unit-tested without touching a database or a component.

---

*Built for one specific person's goals, equipment, and history — not a general-purpose fitness app.*
