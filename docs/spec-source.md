# Build Prompt: "Bloom" — A Cycle-Synced Body Recomposition Coach (working title, rename freely)

Copy everything below into Claude Code as your project brief. It contains the full feature spec, the actual research-backed workout program, the diet framework, and the motivation system — don't regenerate these from scratch, implement them.

---

## 0. Non-Negotiable Constraints

- **Platform:** Build as a mobile-first **Progressive Web App (PWA)** — installable to the iPhone home screen via Safari's "Add to Home Screen," works fully offline after first load, no App Store, no Apple Developer account needed.
- **Storage:** 100% local on-device. Use **IndexedDB** (via a wrapper like `idb` or `Dexie.js`) for structured data and progress photos — do NOT use localStorage alone (5MB cap, photos won't fit). No backend, no login, no cloud sync, no analytics, no third-party servers. This is a private single-user app.
- **Cost:** Zero ongoing cost. No paid APIs, no subscriptions. Any icon/chart libraries should be free/open-source (e.g. Chart.js for graphs, lucide icons).
- **Backup:** Since local storage can theoretically be cleared, build a one-tap "Export my data" (JSON file download) and "Import" feature so she can back up manually. Prompt her to export monthly.
- **Design freedom:** The user has a UI/UX design background, so don't over-specify visual style — give her a clean, mobile-first component system (soft, modern, not childish; avoid generic pink-gradient "girly fitness app" clichés) and let her restyle it easily. Prioritize getting the logic/data right over pixel-perfect visuals.
- **Ask before big architectural decisions** (e.g. React vs. vanilla JS/HTML) if it's not obvious from context — otherwise default to **React + Vite + Tailwind**, since it's the fastest path to a polished mobile PWA.

---

## 1. User Profile (hardcode as the seeded/default profile, editable in onboarding)

- 21-year-old woman, 5'9" (175cm), 80kg, self-describes as "tall, skinny fat"
- **Equipment:** two 5kg dumbbells, one resistance band, bodyweight only, at home
- **Schedule:** commutes on foot to/from work Tuesdays and Fridays (high incidental walking, arrives tired); otherwise a student with a more sedentary routine
- **Joint note:** occasional joint pain — needs a mobility/stretch component built into every session, not bolted on as an afterthought
- **Training history:** weak upper body (can't do a standard push-up), motivated in short bursts but historically abandons plans after ~1 day
- **Priority order of goals (in her own words, most important first):** hourglass figure > slim/defined upper arms > eliminate back fat > shaped/defined glutes and softened hip dips > smaller stomach (lower priority than shape) > general fat loss / recomposition
- **Stated goal:** 65kg by Halloween (Oct 31, 2026) — see Section 2, this needs reframing in-app.

---

## 2. Critical: Build a "Realistic Goal" Screen Into Onboarding

Do not let the app silently accept an unsafe pace. When she enters her stats and goal:

1. Calculate BMR (Mifflin-St Jeor): `BMR = 10×kg + 6.25×cm − 5×age − 161` (female).
   - For her baseline: `10(80) + 6.25(175) − 5(21) − 161 ≈ 1628 kcal`
2. Estimate TDEE with an activity multiplier (let her pick or auto-suggest "lightly active," ~1.375–1.45 given her commute-walking pattern): `TDEE ≈ 2250–2300 kcal`.
3. Apply a **moderate deficit** (300–400 kcal for body recomposition, women-specific research shows this range preserves muscle and hormonal health better than steeper cuts): **starting target ≈ 1850–1950 kcal/day**, protein floor ≈ **1.6g/kg (~128g/day)**, recalculated every 2–3 weeks or after every ~3kg lost.
4. Translate that into a safe weekly pace: **0.5–0.8kg/week** (never let the deficit imply more than ~1%/week).
5. **If the user's target date implies a faster pace than this, show a gentle, non-judgmental screen**: explain the math, offer to keep the original date as a "checkpoint" with an honest interim number, and set the full goal weight against a realistic date. For this specific profile: Halloween checkpoint ≈ **74–76kg** (not 65kg); full goal of 65kg ≈ **Feb–Mar 2027**. Frame this as good news, not a letdown: recomposition changes *visible shape* (glutes, arms, waist) faster than the scale moves, so the hourglass-figure goal can show real progress well before the scale hits any number.
6. Let her override and set her own numbers anyway (autonomy matters), but the app should never present an unsafe pace as if it were fine.

---

## 3. Nutrition Engine

**Philosophy:** No banned foods, no rigid "diet" framing — she's stated she can eat healthily but needs structure, not restriction (restriction is what makes her quit after one day). Build a flexible calorie/protein target with food *suggestions*, not mandates.

- In-app calculator (from Section 2) for daily calorie + protein target, auto-adjusting as weight changes.
- **Budget-first, Filipino-context meal bank** (she's a student, cost matters). Seed the app with a rotating recipe library using cheap, high-protein staples:
  - **Protein anchors:** eggs, chicken thigh/breast, canned tuna, tilapia, bangus (milkfish), tofu, monggo/mung beans, sardines
  - **Sample dishes to seed:** tinolang manok (chicken + malunggay/sayote — high protein, high fiber, very filling for few calories), ginisang monggo (~13g protein/serving, ~160 kcal), tuna guisado, grilled bangus/tilapia + ensaladang kamatis, lean chicken adobo (skinless, measured rice portion), tokwa (tofu) + boiled egg + toyomansi
  - **Why soup-based dishes matter for her specifically:** she said she "eats a lot" — broth-and-vegetable dishes (tinola, sinigang) give high food volume per calorie, which helps her feel full in a deficit without white-knuckling portion control.
- **Sample day (~1,900 kcal / ~130g protein), seed as a default template:**
  - Breakfast: 2 boiled eggs + small garlic rice + tomato (or oatmeal + banana + peanut butter)
  - Lunch: tinolang manok + 1 cup rice
  - Snack: Greek yogurt or boiled egg + fruit
  - Dinner: grilled tilapia/bangus + ensaladang kamatis + small rice
  - Optional evening snack: fruit or small handful of nuts
- **Grocery list generator**: from whichever meals she selects for the week, auto-compile a shopping list grouped by category.
- **Cycle-aware nutrition note**: in the late luteal phase (days before her period), cravings for higher-calorie/carb food are a normal hormonal response, not a willpower failure — build in a pre-planned slightly-higher-carb snack option for those days instead of treating it as "cheating."

---

## 4. Workout Engine — Full Program (implement this exact structure, don't invent a generic one)

**Weekly structure**, built around her actual schedule (Tue/Fri = tiring commute days):

| Day | Focus | Duration |
|---|---|---|
| Mon | **A — Glutes & Hips** (hip-dip / hourglass priority) | 35–40 min |
| Tue | Work day — Mobility & Recovery only | 10–15 min |
| Wed | **B — Upper Body, Arms & Back** (push-up progression, back fat) | 35–40 min |
| Thu | **C — Core & Waist** (posture-driven, not crunch-spam) | 30–35 min |
| Fri | Work day — Mobility & Recovery only | 10–15 min |
| Sat | **D — Glutes/Legs Part 2 + short cardio finisher** | 35–45 min |
| Sun | Rest + weekly check-in (weigh-in, measurements, reflection) | — |

This gives her 4 real resistance sessions/week (matches the research minimum for recomposition) while respecting that Tue/Fri are already physically demanding from walking.

### Day A — Glutes & Hips (targets glute medius specifically, the muscle that sits over hip dips)
1. Banded glute bridge hold + pulses — 3×15 pulses + 20s hold
2. Side-lying leg raises (band optional) — 3×15/side
3. Clamshells (banded) — 3×15/side
4. Banded lateral walks ("monster walk") — 3×10 steps each direction
5. Single-leg glute bridge — 3×12/leg
6. Fire hydrants — 2×15/side
7. Goblet squat (hold one dumbbell) — 3×12–15
8. Standing banded hip abduction — 3×15/side
Cooldown: 90/90 hip stretch, pigeon stretch

### Day B — Upper Body, Arms & Back (weak upper body + slim arms + back fat)
1. Push-up progression at her current level — wall → incline → knee → negative → standard (progress only when 3×12 is clean at current level; expect 8–12 weeks to reach a full push-up) — 3×max clean reps
2. Dumbbell bent-over rows — 3×12
3. Reverse fly (light dumbbells) — 3×15
4. Band pull-aparts — 3×15
5. Dumbbell overhead press — 3×10–12
6. Bicep curls — 3×12
7. Tricep kickbacks — 3×12
8. Plank hold — 3×20–30s
Cooldown: doorway chest stretch, cat-cow, child's pose

### Day C — Core & Waist (anti-rotation/posture work, not crunches — addresses the "B-shaped belly" via bracing/posture, since that shape is often postural, not purely fat)
1. Dead bug — 3×10/side
2. Bird dog — 3×10/side
3. Standing oblique work (side bends w/ one dumbbell) — 3×15/side
4. Glute bridge march — 3×10/side
5. Pallof press (band, anti-rotation) — 3×12/side
6. Forearm plank with shoulder taps — 3×20 taps
7. Diaphragmatic breathing/bracing drill — 2×10 breaths
Cooldown: cat-cow, seated spinal twist

### Day D — Glutes/Legs Part 2 + Cardio Finisher
1. Dumbbell Romanian deadlift (or single-leg RDL) — 3×12
2. Hip thrusts (banded/feet elevated) — 3×15
3. Step-ups (stairs or sturdy chair) — 3×10/leg
4. Banded squats — 3×15
5. Donkey kicks — 3×15/side
6. Cardio finisher: 10–12 min circuit, 40s on/20s off (jumping jacks, high knees, mountain climbers — offer low-impact swaps given joint sensitivity)
Cooldown: full lower-body stretch (quad, hamstring, calf, hip flexor)

### Tue/Fri — Active Recovery (10 min)
Cat-cow, hip circles, thread-the-needle, child's pose, gentle neck/shoulder rolls. Optional low-fatigue add-on if she has energy: 2×15 clamshells + lateral band walks (glute "prehab," doesn't compete with commute fatigue).

### Cycle-Phase Modifiers (auto-detected from her logged cycle, always overridable)
- **Menstrual (period days, ~1–5):** swap hard days for mobility + light band work; cut reps ~30%; full permission to rest if cramping.
- **Follicular (post-period → ovulation, ~day 6–13):** highest capacity phase — this is where the app should nudge her to add a rep or a small amount of resistance first each cycle (progressive overload lives here).
- **Ovulation (~day 14):** peak-energy day — good day for a "test" (max clean push-ups, heaviest goblet squat) if it lands on a scheduled strength day.
- **Luteal (day 15 → next period):** maintain volume, don't chase new PRs in the final week before her period; nudge extra sleep/stretch; expect motivation dips here (research shows this is often psychological, not physical — so the app should lower the *bar*, not skip the day entirely).
- Log actual energy/symptoms daily so the model adapts to *her* real cycle over time rather than a textbook 28-day assumption.

**Progressive overload tracking:** log weight/reps per exercise each session; app suggests a small increase (extra rep, or move from band-light to band-heavy, or add reps before adding load given the light dumbbells) once she hits the top of a rep range for 2 sessions in a row.

**Form guidance:** Build an exercise library with illustrated step-by-step cues + a short "common mistakes" list per move (e.g. knees caving in on squats, hips sagging in plank). As a stretch goal if time allows: explore client-side pose detection (TensorFlow.js `pose-detection` or MediaPipe Pose, both run fully on-device/offline, no server) to flag obvious form breaks on a few key lifts via the phone camera. If this proves too complex for the timeline, fall back gracefully to the illustrated-cue library — don't let this feature block the rest of the app.

---

## 5. Motivation & Behavior Design System (the most important section — she has quit after one day historically)

Research on fitness-app retention shows 70–80% of users drop off within 3 months, and the apps that beat this aren't the ones with the most content — they're the ones with the best "come back tomorrow" design. Build these mechanics explicitly:

- **Day 1 must be trivially easy** — the very first assigned task should be small enough that failure is nearly impossible (e.g. a 10-minute walk + 5-minute stretch), to guarantee an early win rather than overwhelming her on day one.
- **"Minimum Viable Day" button** on every workout screen: a one-tap option to do a scaled-down version (e.g. just 3 glute bridges) instead of the full session. This keeps the streak/habit alive on low-motivation days instead of an all-or-nothing collapse — all-or-nothing thinking is the single biggest driver of total dropout.
- **Streaks with a "grace day"/freeze** mechanic rather than a harsh reset — pure loss-aversion streak systems collapse the moment the fear stops being fun.
- **Non-scale milestone badges** tied to *her* actual stated goals, not generic ones: first full push-up, first full week completed, first time hip-thrusting a certain rep count, first visible glute-shape change noted in a photo comparison, halfway to the Halloween checkpoint.
- **Surface her "why" on the home dashboard** — a short, her-own-words reminder of what she's working toward (hourglass figure, confidence), not a generic slogan.
- **Auto-downshift after missed days**: if she misses 3+ sessions in a week, next week's plan should automatically scale down in intensity/length ("rebuilding momentum mode") instead of staying at full difficulty and guilt-tripping her back in — the goal is getting her moving again, not punishing the gap.
- **Weekly reflection check-in** (energy 1–5, motivation 1–5, cycle phase, any joint pain) that feeds back into next week's plan.
- Never use guilt-based copy ("you failed today"). Always compassionate-reset framing ("let's pick back up today, no penalty").

---

## 6. Trackers (build all of these)

- **Weight** — daily optional entry, but display a **7-day rolling average** as the primary number (single-day readings are noisy, especially around her period when water retention is normal — don't let a bad daily number tank her motivation).
- **Measurements** — waist, hips, upper arm, thigh — logged biweekly.
- **Progress photos** — front/side/back, monthly, stored locally only, with a simple side-by-side comparison view.
- **Cycle tracker** — period start/end dates, symptoms, auto-predicted current phase (with manual override), average cycle length learned over time.
- **Workout log** — sets/reps/weight per exercise, streak count, weekly adherence %.
- **Water intake** (simple tap counter).
- **Adherence/nutrition log** — simple, low-friction (tap the meal she ate from the recipe bank, or free-text) rather than a strict calorie-counting UI, to lower the barrier to daily use.

---

## 7. Adaptive Recalculation Logic (implement as explicit rules)

- Recalculate TDEE/targets every 2–3 weeks, or immediately after any 3kg change in the 7-day-average weight.
- If the 7-day average weight hasn't moved in 2–3 consistent weeks of logged adherence: reduce calorie target by ~100–150 kcal OR flag a possible under-logging issue — don't assume it's a discipline problem first.
- If weight is dropping faster than ~1%/week consistently: gently flag that the deficit may be too aggressive and suggest increasing calories slightly (protect against under-eating, which is a real risk given her "usually only lasts a day" pattern of over-restricting then quitting).
- If 3+ workouts missed in a week: auto-downshift next week's assigned plan (see Section 5).
- Cycle logic learns her actual average cycle length after 2–3 logged cycles rather than assuming a fixed 28 days.

---

## 8. Screens / Information Architecture

1. **Onboarding** — stats, equipment, schedule, goal + the Realistic Goal reframing screen (Section 2), cycle info
2. **Today / Home dashboard** — today's workout, today's meal suggestions, motivational "why" reminder, streak, cycle-phase indicator, quick-log buttons
3. **Workout player** — exercise list, timer, set/rep logger, form cue + common-mistakes per exercise, "Minimum Viable Day" fallback button
4. **Exercise library** — searchable, grouped by muscle/goal area
5. **Nutrition** — daily target, meal bank, grocery list generator, simple meal logging
6. **Cycle tracker** — calendar view, phase indicator, symptom log
7. **Progress** — weight chart (7-day avg), measurements chart, photo comparison, milestone badges
8. **Weekly check-in** — reflection prompt, recalculation trigger
9. **Settings** — recalculate goals, export/import data, edit profile

---

## 9. Local Data Model (sketch — adjust as needed)

```
Profile: { height, weight, age, activityLevel, goalWeight, goalDate, equipment, injuryNotes }
DailyLog: { date, weight?, waterCount, mealsLogged[], workoutCompletedId?, energyRating?, cycleDay? }
CycleLog: { periodStartDates[], avgCycleLength, symptomsByDate{} }
WorkoutLog: { date, workoutDayId, exercises: [{name, sets, reps, weight}], completed: full|minimal|skipped }
MeasurementLog: { date, waist, hips, upperArm, thigh }
PhotoLog: { date, frontPhotoBlob, sidePhotoBlob, backPhotoBlob }
Milestones: { id, unlockedDate, label }
Settings: { lastRecalcDate, currentCalorieTarget, currentProteinTarget }
```

---

## 10. Build Order

**Phase 1 (MVP):** Onboarding incl. Realistic Goal screen, Today dashboard, Workout player with the full A/B/C/D program hardcoded, basic weight/measurement tracking, local storage wired up, PWA manifest + service worker for installability/offline.

**Phase 2:** Cycle tracker + phase-based workout modifiers, nutrition engine with the Filipino meal bank + grocery list generator, adaptive recalculation logic.

**Phase 3:** Motivation system (streaks, minimum-viable-day, milestones, auto-downshift), progress photos + comparison view, data export/import, polish and (optionally) the on-device form-check exploration.

Ask me clarifying questions before you start if anything above is ambiguous — don't guess silently on anything that affects the data model or the safety-related calorie/pace logic.
