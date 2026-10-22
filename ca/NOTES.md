# Coach Approach (`/ca`) — Build Notes

Running log of rules, decisions, and ideas while the site skeleton comes together.
Add to it as we go: rules are things to keep doing, ideas are things we might do.

---

## Rules

### Brand & visuals
- **Palette:** promo navy `#0F1D2E`, orange `#FF6B1A`, teal `--accent` `#00BDB0` (dark `#008A82`). App screens use the teal tokens in `src/App.css`; the landing page uses navy + orange to match the promo graphics.
- **Headline type:** Barlow Condensed 700/800 (Google Fonts, linked in `index.html`), uppercase, for headlines, taglines, and pillar chips. Body stays system sans.
- **Accent words are orange:** in headlines/taglines, the program name or punchline gets orange, the rest white (same as the promos).
- **Promo images are source art, not page art.** Don't drop the full `.jpeg` promos onto a page — crop the photo out and set the words as real text (crisp on phones, screen-reader friendly, editable).
- **No App Store / Google Play badges** until real listings exist.

### Images
- Full promo originals live in `design/promos/*.jpeg` (2752×1536, ~2.5 MB each) — **outside `public/`** so they don't ship with the site.
- Page-ready crops live in `public/images/slides/*.jpg` — max 1100px, JPEG quality ~72, ~200–280 KB each.
- Crop with `sips -c <h> <w> --cropOffset <y> <x>`. Gotcha: `--cropOffset 0 0` is ignored and crops from center — use `1 1` for the top-left corner.
- Paths in JSX are absolute with the Vite base: `/ca/images/...`.

### Landing carousel
- Content lives in `src/screens/landingSlides.js` — edit copy, order, or add slides there, not in the component.
- Order: opener (Coach Approach Pro) → Adaptive → Showcase & Pathway → Adult Rec → Senior → PE, then loops.
- `SLIDE_MS = 5000`. Timer resets on every slide change; tapping a progress bar gives that slide the full 5s.
- **Don't pause on hover over the whole page** — it covers the viewport, so desktop was effectively always paused. Only pause when the tab is hidden; returning restarts the current slide's timer + bar together.
- Don't drive the advance from CSS `animationend` — it didn't fire reliably (headless Chrome). JS timer is the source of truth; the bar is visual.
- Desktop motion: diagonal clip-path wipe + slow zoom on the photo, copy slides in from the right with blur. Mobile: crossfade + Ken Burns zoom, copy rises in, swipe to change.
- Respect `prefers-reduced-motion` (plain fades only).
- Mobile photo height is `clamp(170px, 100dvh - 500px, 46dvh)` so buttons stay above the fold on short phones (checked at 390×844 and 375×667).
- Desktop text column has a fixed min-height so the progress bar and buttons never jump between slides.

### Copy fixes from the promo art (keep these)
- "to **the** next level" (promo says "te"), "**Roster** & RSVP" (promo says "Raster"), "Curriculum planning **and activity tracking**" (promo repeats "activity").

### Accounts & sign-up
- **Account types are driven by sport.** The sport chosen at sign-up decides the menu structure (e.g. Soccer and Adaptive Sports will get different menus).
- **One sport per account for now.** Later we may let users switch sports / plan a different season — keep `sport` a single field on the account until then.
- Sports list lives in `src/data/sports.js` (`id`, `label`, `icon`, optional `blurb`). Current set: Soccer, Softball, Baseball, Football, Basketball, Adaptive Sports. Add a sport there and it shows up in the picker.
- The person who signs up is the **account admin**.
- **Email is the login ID.** Password minimum is 8 characters (with a Show/Hide toggle instead of a confirm field).
- Sign-up is a wizard (`src/screens/SignupWizard.jsx`): **1 · Account** (name, email, password) → **2 · Sport** → app. Steps are listed in `STEPS`; add a step there and render its panel.
- Sport grid is 2 columns on phones, 3 on desktop — keep the sport count even (6 = clean 3×2 / 2×3) or revisit the layout.
- `App.jsx` holds `account` (`{ name, email, sport }`) and `authView` (`'landing' | 'login' | 'signup'`). Logout clears the account and returns to the landing page.
- Name/initials/sport display comes from helpers in `src/data/account.js` — don't hard-code "Coach Aaron" / "CA".
- Auth is **mocked** — nothing is saved. Log In creates a placeholder account with no sport.

### Profiles: Adaptive Sports vs. team sports
- **Adaptive Sports is program-based, not team-based.** Menu: **Home · Programs · Events · Tools**. Every other sport (Soccer etc.) keeps the team menu: Home · Drills · Practice · Roster · Tools.
- Menus are defined in `MENUS` in `src/components/Navigation.jsx` (`menuFor(sport)`); routes are switched by profile in `App.jsx`.
- **Hierarchy:** an account has many **Programs** → a program has many **Events** → each event has one **Practice Plan** → a plan is made of **Drills**.
- **Creating a program:** name, sport focus, number of weeks, start date, time, location. **Each week becomes an event** (same weekday/time), and each event gets a practice plan.
- **Home (Adaptive):** same dashboard layout. "Next Event" card = the next upcoming event, with its practice plan and drills expanded. Quick actions: Programs, Practice Plans, Drills.
- **Programs tab:** + New Program, search (name or location), list with status (In progress / Starts soon / Complete), date range, and sessions-done progress.
- **Events tab:** horizontal day strip (6 weeks from today, dots on event days), starting on the next event date; the selected day's events, then "Coming Up" in date order. Tap an event to see its drills.
- **Tools:** same list as the team profile for now.
- Demo data lives in `src/data/adaptiveMock.js` and is **dated relative to today**, so "Independence Soccer · Session 3" is always tomorrow. Seeded only when an account picks Adaptive Sports; new programs live in memory until logout.
- Practice Plans / Drills screens are still the generic placeholders, reachable from Home quick actions (not in the Adaptive menu).

### Profile: Soccer (team-based)
- **Log In = Soccer demo account** (`LoginScreen` mocks `{ name: 'Coach', sport: 'soccer' }`). Sign-up with Soccer gets the same profile.
- **Menu:** **Home · Plan · Events · Tools** (`MENUS.soccer`). Other team sports (Softball, Baseball, Football, Basketball) still use the old placeholder menu until designed.
- **Hierarchy:** Account → **Teams** → **Events** (practice | game) → one **Plan** per event. Practice plan = ordered drills. Game plan = **Lineup**, **Game Points** (Focus / Strategy / About the opponent), **Stats** (score + per-player G/A/Sh/Sv).
- **Team scope:** no team selected = every tab shows all teams. Selecting a team (on Home) scopes Home, Plan and Events to that team until cleared ("All teams ✕"). State lives in `TeamProvider` (`src/screens/team/TeamContext.jsx`), fresh per login.
- **Home:** "Next Event" (all teams by default → BDU U13 2026 practice tomorrow; team-specific once selected), then **Your Teams** with search. Tap a team to select; tap again to clear.
- **Plan:** + New Plan → Practice or Game → team (skipped if one is selected) → pick the event. Also lists Upcoming Plans and Needs a Plan. Editor at `/plan/:eventId`; edits save as you go.
- **Events:** scope bar, All / Practices / Games filter, the same day strip as Adaptive, then the day's events and Coming Up.
- **Lineup format follows age group:** U10 7v7 (2-3-1), U11–U12 9v9 (3-3-2), U13+ 11v11 (4-3-3). Positions per format are in `FORMATS` in `src/data/teamMock.js`.
- Demo data (`src/data/teamMock.js`): teams BDU U13 2026, U12 2025, U11 2024, U10 2025; generated rosters; opponents are fictional; all dates relative to today, nothing scheduled today.
- Shared UI for both profiles: `components/EventCard.jsx`, `components/DayStrip.jsx`, `screens/shared.css`.

### Build, deploy & testing
- **`index.src.html` is the real source page.** `index.html` gets overwritten: `npm run dev` / `npm run build` copy the dev version in (points at `/src/main.jsx`); `npm run deploy` replaces it with the built one.
- **After `npm run dev`, always `npm run deploy` before committing** — otherwise GitHub Pages serves the dev `index.html` and `/ca/` is a blank white page.
- `npm run deploy` = build → copy `dist/assets` → `assets/`, `dist/images` → `images/`, `dist/index.html` → `index.html`. Commit those.
- `npm run restore` puts the dev `index.html` back without starting the server.
- Visual check: `npx vite preview --port 4317` + headless Chrome screenshots. Headless Chrome won't go narrower than ~500px — to test phone widths, load the page inside a 390px / 375px `<iframe>`.
- Headless screenshots often freeze entrance animations partway (content looks faded/offset). That's the screenshot tool, not the page — don't "fix" it.

---

## Ideas / Backlog

- [x] ~~Sport-specific menus~~ — Adaptive vs. default done; other sports may get their own later.
- [ ] Program detail page (tap a program → its events / plans).
- [ ] Edit a single event's practice plan (swap drills, reorder, change minutes).
- [ ] Adaptive drill library screen (filter by sport focus, accommodations).
- [ ] Programs that meet more than once a week (e.g. Tue + Thu).
- [ ] Soccer: create/edit teams and rosters (teams are fixed demo data today).
- [ ] Soccer: add/edit events (schedule a practice or game) — events are fixed demo data today.
- [ ] Game day: live stats mode with a game clock, subs/minutes played, and a lineup pitch diagram.
- [ ] Practice plan: drill details (diagram, coaching points, video) and custom drill minutes.
- [ ] Show the selected team in the sidebar / top bar so scope is visible on every tab.
- [ ] Adaptive-specific tools (accommodation notes per athlete, buddy/volunteer assignments?).
- [ ] More wizard steps? e.g. organization/program name, team(s), age group, season dates, invite assistant coaches.
- [ ] Switch sport / add another season to an account (multi-sport later).
- [ ] Real auth + account storage (Supabase project used by `/empower` and `/fuelup`? decide).
- [ ] Add a slide for `volunter.jpeg` (Volunteer program?).
- [ ] Each slide could link to a program detail page ("Learn more").
- [ ] Optional pause on desktop — hover over the photo only, not the whole page.
- [ ] App Store / Google Play badges once listings exist.
- [ ] Opener photo looked dim in mobile headless screenshots — verify on a real phone.

---

## Decision Log

| Date | Decision |
|---|---|
| 2026-10-21 | Added landing page in front of login, built from `capromo.jpeg` (photo cropped, text as HTML). |
| 2026-10-21 | Landing became a 6-slide carousel of program offerings, 5s each. |
| 2026-10-21 | Removed whole-page hover pause (desktop stalled); JS timer drives slides. |
| 2026-10-21 | Sign-up became a 2-step wizard (Account → Sport); sport stored on the account, one sport per account. |
| 2026-10-21 | Adaptive Sports profile: program-based menu (Home, Programs, Events, Tools); Program → Events (weekly) → Practice Plan → Drills. |
| 2026-10-22 | Soccer profile (Log In demo): Home, Plan, Events, Tools; team selection scopes tabs; game plans = Lineup / Game Points / Stats. |
