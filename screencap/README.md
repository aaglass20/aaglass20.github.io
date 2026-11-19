# ScreenCap

Mac desktop app (Electron) for troubleshooting captures: screenshots with markup, and region video recording.

## Run / build

```bash
npm install && node node_modules/electron/install.js   # first time only
npm start          # run from source
npm run build      # makes dist/ScreenCap-darwin-arm64/ScreenCap.app
npm run smoke      # opens the home window + editor on a blank image, prints renderer errors, exits
```

Drag `ScreenCap.app` into Applications. On first capture macOS asks for **Screen Recording** permission
(System Settings → Privacy & Security → Screen & System Audio Recording); quit and reopen the app after granting it.
The app is ad-hoc signed, so every rebuild counts as a new app and macOS asks again.

## Capture modes (default shortcuts, changeable in Settings)

| Mode | Shortcut | What happens |
|---|---|---|
| Region | ⌃⇧1 | Screen freezes, drag a box (Enter = whole screen, Esc = cancel) |
| Scrolling region | ⌃⇧2 | Drag a box over the scrolling content, then scroll down slowly; press Done (or the shortcut again) |
| Window or app | ⌃⇧3 | Pick a window from the list |
| Entire screen | ⌃⇧4 | The display under the mouse pointer |
| Record video | ⌃⇧5 | Drag a box, recording starts; Stop (or the shortcut again) saves an .mp4 |

Screenshots are saved to `~/Pictures/ScreenCap` (changeable), copied to the clipboard, and opened in the markup editor
(arrow, highlight, box, pen, text; undo/redo; Copy, Save, Save As).

## Files

- `main.js` — main process: shortcuts, tray, capture flows, file saving, all IPC
- `preload.js` — exposes `api.invoke/send/on` to the pages
- `src/index.*` — home window (mode buttons, window picker, recent captures, settings)
- `src/overlay.*` — full-screen region selector drawn over a frozen screenshot
- `src/panel.*` — floating control bar; does the video recording and the scroll stitching
- `src/editor.*` — markup editor
- `src/border.html` — dashed outline around the region being recorded

## Notes

- Scroll capture is manual-scroll: it grabs the region ~10×/sec and matches each frame against the previous one to find
  how far the content moved (`startScroll()` in `src/panel.js`). Fixed headers/footers inside the box break the match —
  leave them out of the selection. Max height 20,000 px.
- Video has no audio. It records the display, crops to the region on a canvas, and encodes with MediaRecorder (H.264 mp4).
- Settings live in `~/Library/Application Support/ScreenCap/settings.json`.
