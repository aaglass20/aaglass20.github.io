# Louder Than Life Playlist Builder

Static single-page app that builds and maintains per-day Spotify playlists for the Louder Than Life festival. Scrapes the official lineup page, resolves each artist on Spotify, and creates one playlist per day (e.g. `LTL2026Friday`) on your account with each artist's top 5 tracks.

Re-run any time — it detects added, removed, and moved artists and updates the playlists incrementally without clobbering your manual edits.

## Features

- **Auto-fetch lineup** from https://louderthanlifefestival.com/lineup/ via public CORS proxy. Artist → day mapping comes straight from the page's `data-day-playing` / `data-name` attributes, and ~half the artists come with their Spotify artist ID embedded (`data-spotify`), so those skip Spotify search entirely.
- **Spotify PKCE auth** — no server, no client secret. Client ID is baked into `app.js`.
- **Idempotent incremental sync** — first run creates four playlists and populates them; subsequent runs only add tracks for new artists and remove tracks for dropped artists. Tracks you manually added to the playlist are preserved.
- **Diff preview** — see adds / removes / day-moves before anything hits Spotify.
- **Export / Import state (JSON)** — back up the sync state or move it between browsers.

## Tech Stack

- Plain HTML + CSS + JS. No build, no dependencies, no framework.
- Runs entirely in the browser. State persists in `localStorage`.
- Hosted as static files on GitHub Pages.

## One-time Setup

### 1. Register the redirect URI in your Spotify app

1. Go to https://developer.spotify.com/dashboard
2. Open your app → **Edit Settings**
3. Under **Redirect URIs**, add: `https://aaglass20.github.io/ltl-playlist/` (exact, trailing slash matters)
4. Click **Save**

The Client ID hardcoded in `app.js` must match this app. It's already set to `6d73b6f691ef4f1cb0bed8dbf20e3572` (the same app used by the `/soundtrack` project). If you swap apps later, update `DEFAULT_CLIENT_ID` at the top of `app.js`.

### 2. Deploy

No build. Commit the folder and push — GitHub Pages publishes in ~30-60 seconds at:

```
https://aaglass20.github.io/ltl-playlist/
```

## Regular Use

1. Open `https://aaglass20.github.io/ltl-playlist/`
2. Verify the **Festival Year** field (default 2026)
3. Click **Connect to Spotify** → authorize → pill turns green *Connected*
4. Click **Fetch from louderthanlifefestival.com** → four textareas fill; status line shows counts per day
5. Click **Preview Changes** → diff panel shows adds / removes / moves vs. the last sync
6. Click **Sync to Spotify** → watch the log. First run takes 2-4 minutes; subsequent runs are fast because resolved artist IDs are cached.
7. Open Spotify. You'll see `LTL{year}Thursday`, `LTL{year}Friday`, `LTL{year}Saturday`, `LTL{year}Sunday`.

### Log legend

- `✓ Artist` — exact name match, track URIs fetched
- `? Input → Matched Name` — fuzzy match; eyeball these, occasionally the wrong band wins
- `✗ Not found` — rare; usually a typo or a truly obscure artist

## How Updates Work

Every successful sync records, per day: `{ playlistId, artists: { [spotifyArtistId]: { name, trackUris: [...] } } }`. On re-run, the diff engine compares normalized artist-name sets between old state and new lineup:

- **Added artist** → fetch top 5 tracks, append to that day's playlist
- **Removed artist** → delete that artist's exact 5 track URIs from the playlist
- **Moved artist** (e.g. Thursday → Friday) → remove from old day's playlist, add to new day's
- **Unchanged artist** → no-op (tracks stay exactly where they are, including any manual re-ordering)

Because removes target only the URIs we put there, manual additions to the playlists survive every resync.

## Edit Manually

You can edit the four textareas directly — one artist per line — instead of, or on top of, the auto-fetch. The save on every keystroke to `localStorage`. Manual entries that happen to share a normalized name with a pre-resolved one (from the fetch) use the pre-resolved Spotify ID; otherwise they go through `/search`.

## Export / Import / Reset

- **Export state (JSON)** — downloads a file containing per-year sync state and textarea drafts.
- **Import state** — restores from an exported file. Useful when moving to a new machine or starting over after a browser data wipe.
- **Hard reset** — clear `localStorage` for the page (DevTools → Application → Local Storage), then reload. The Client ID repopulates from the hardcoded default; the playlists on Spotify remain but LTL no longer knows they exist — next sync will find them by name and re-attach (or create fresh if names differ).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `INVALID_CLIENT: Invalid redirect URI` after Connect | Redirect URI in Spotify app dashboard must match exactly, including the trailing slash. |
| Fetch button shows `failed: proxy returned 5xx` | Public CORS proxy is down. Retry later, or manually paste names into the four textareas. |
| Artist matches the wrong band (`?` in log) | Open that day's playlist, remove the wrong tracks manually. Then edit the artist name to be more specific (e.g. `Spiritbox` → `Spiritbox band`) and re-sync. |
| Token expires mid-sync | Handled automatically via refresh token; if it ever fails, click **Disconnect** then **Connect** to re-auth. |
| Rate-limited by Spotify (`Rate limited, waiting Nms…` in log) | Automatic — the app obeys Spotify's `Retry-After` header and resumes. |
| Playlist has duplicate songs | Happens only if you create a second Spotify app mid-flight or wipe state while playlists still exist. Delete the playlist in Spotify and resync. |

## Files

```
ltl-playlist/
  index.html   UI layout + form fields
  app.js       PKCE auth, LTL fetch + parse, Spotify sync, diff engine, UI wiring
  styles.css   Dark theme, CSS grid for the day columns
  README.md    This file
```

## Year Rollover

To run for a new festival year:

1. Change **Festival Year** in the UI (or edit the number field)
2. Click **Fetch from louderthanlifefestival.com**
3. **Sync to Spotify** — four new playlists are created: `LTL{newYear}Thursday` etc.

Old years' state is kept under their year key in localStorage, so you can switch back and forth.
