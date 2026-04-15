# /new-tournament — Set up a new MyBracketly tournament or squares board

Guide the user through setting up a new competition in MyBracketly (`/mybracketly/`).

## Step 1: Ask what type
- **Bracket tournament** → `brackets.html`
- **Squares board** → `squares.html`

## For a bracket tournament
MyBracketly brackets are created in-browser via the "Create Tournament" wizard on `brackets.html`.
1. Remind the user to open `https://aaglass20.github.io/mybracketly/brackets.html`
2. Click "+ Create Tournament" on the landing page
3. Fill in tournament name, number of teams, and format (single/double elimination)
4. Google Sheets sync is optional — if wanted, paste the deployed Apps Script URL in Settings
5. Tournament data is stored in `localStorage` with the `mybracketly_` prefix

## For a squares board
MyBracketly squares are configured via the Config tab (admin only).
1. Open `https://aaglass20.github.io/mybracketly/squares.html`
2. Log in as Admin
3. Go to **Config** tab and set:
   - Sport / event name
   - Team names (row team and column team)
   - Payout amounts per quarter/period
   - Lock date (when squares stop being claimable)
4. Google Sheets sync: paste Apps Script URL in Config → Sheets Settings if backing up to Sheets
5. To reset for a new game: Admin → Config → "Reset Board" (clears all claimed squares and scores)

## If Google Sheets backend is needed
Point user to `mybracketly/setup/` or `mybracketly/docs/` for the Apps Script setup guide.
Remind them: Apps Script must be deployed as a web app with "Anyone" access.
