# Softball Playbook

Animated situational training app for softball. Watch plays unfold, focus on individual positions, and assign player names so everyone knows their role.

## Features

- **Animated Field** -- 9 fielders, runners, and ball move through each play on a Konva canvas
- **Situation Library** -- Plays organized by category (Ground Balls, Base Hits, etc.)
- **Position Focus** -- Click any position to highlight only their movement; everyone else dims
- **Player Names** -- Assign real names to positions so players see personalized instructions
- **Trail Lines** -- Toggle dashed path lines showing where each player moves
- **Playback Controls** -- Play/pause, scrub timeline, speed control (0.25x to 2x)
- **Situation Editor** -- Step through keyframes, drag players to adjust positions, add/remove keyframes, export JSON

## Tech Stack

- React 19 + Vite
- Konva / React-Konva (canvas rendering)
- No backend -- all data is in `src/data/`

## Scripts

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5174/softball/)
npm run build        # Build to dist/
npm run deploy       # Build + copy production files to index.html + assets/
npm run restore      # Restore index.html to dev mode after deploying
```

## Deploy Workflow

This app lives inside a GitHub Pages repo. The deploy process:

1. `npm run deploy` -- builds the app and overwrites `index.html` with the production version
2. Commit and push
3. `npm run restore` -- puts `index.html` back to dev mode so `npm run dev` works again

## Project Structure

```
softball/
  src/
    components/       # React components
      SoftballField.jsx    # Konva canvas with field, players, trails
      PlaybackControls.jsx # Play/pause/scrub/speed
      SituationPicker.jsx  # Category-grouped situation list
      PositionPanel.jsx    # Position focus + player name assignment
      SituationEditor.jsx  # Keyframe editor with drag support
    data/
      fieldPositions.js    # Field coordinates, default player positions
      sampleSituations.js  # All situation definitions (keyframes)
    hooks/
      useAnimationLoop.js  # Animation interpolation + playback state
    App.jsx               # Main app layout and state
  index.html             # Entry point (dev or production depending on state)
  vite.config.js
  package.json
```

## Adding Situations

Each situation in `src/data/sampleSituations.js` has:

- `id` -- unique identifier
- `title` / `description` -- display text
- `category` -- groups situations in the sidebar (e.g., "Ground Balls", "Fly Balls")
- `runners` -- which bases are occupied (`['runner1', 'runner2', 'runner3']`)
- `keyframes` -- array of timed snapshots (time 0-100) with positions for all fielders, runners, and ball

The easiest way to create a new situation:

1. Turn on **Edit Mode**
2. Select an existing situation as a starting point
3. Step through keyframes and drag players to new positions
4. Click **Export JSON** to copy the situation data
5. Paste into `sampleSituations.js`
