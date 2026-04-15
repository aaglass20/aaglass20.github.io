# /bdu-gameday — Set up or debug BDU game day tools

Help with the BDU game-day lineup tracker and Google Sheets sync functionality.

## Game day tools location
The game-day tracker is in `BDU/` — look for `cal.html`, `SoccerSessionTracker.js`, or the game-day section in the BDU index.

## What the game-day tracker does
- LocalStorage-first for offline use during games
- Lineup builder with player positions
- Live stats tracking (goals, assists, subs)
- Two-way sync with Google Sheets via Apps Script when online

## Common game day tasks

### Before a game — set the lineup
1. Open `BDU/cal.html` (or the relevant game-day page)
2. Select players and assign positions
3. Data saves to LocalStorage automatically

### After a game — sync to Sheets
1. Make sure the Apps Script URL is configured in the page's settings
2. Click "Sync to Sheets" (or equivalent button)
3. Verify the data landed in the Google Sheet

### Debugging sync issues
- Check the Apps Script is deployed as a web app with "Anyone, even anonymous" access
- Open browser DevTools → Network tab → look for failed requests to `script.google.com`
- Apps Script logs: open the script in Google Apps Script console → View → Logs

### Resetting local data
```javascript
// In browser console on the game-day page:
localStorage.clear(); // clears ALL BDU localStorage
// Or target specifically:
Object.keys(localStorage).filter(k => k.startsWith('bdu')).forEach(k => localStorage.removeItem(k));
```

## After any code changes to game-day pages
```
git add BDU/<changed-files>
git commit -m "BDU game-day: <what changed>"
git push
```
