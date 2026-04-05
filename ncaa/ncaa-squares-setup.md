# NCAA Tournament 100 Squares - Google Sheets Setup

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "NCAA Tournament 100 Squares"

### Tab 1: "Grid" (rename the first tab)

This is a 10x10 grid for square owners. Leave it mostly empty to start.

- Row 1 is a header row (leave as-is or add column labels — the script ignores row 1)
- Rows 2-11 correspond to grid rows 0-9
- Columns B-K correspond to grid columns 0-9 (Column A is unused/labels)

All cells B2:K11 start empty. Names will be written here when squares are claimed.

### Tab 2: "Numbers"

Create a new tab named "Numbers" with this layout:

| A | B |
|---|---|
| RowNumbers | |
| ColNumbers | |
| Generated | FALSE |

- B1: Comma-separated row numbers (filled when generated, e.g., "3,7,1,9,0,5,2,8,4,6")
- B2: Comma-separated column numbers (filled when generated)
- B3: TRUE or FALSE (whether numbers have been generated)

### Tab 3: "Config"

Create a new tab named "Config" with these headers and 7 data rows:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Round | GamesCount | Amount | InverseAmount | ExcludeNormal | ExcludeInverse |
| First Four | 4 | 0 | 0 | TRUE | TRUE |
| First Round (Round of 64) | 32 | 0 | 0 | FALSE | TRUE |
| Second Round (Round of 32) | 16 | 0 | 0 | FALSE | TRUE |
| Sweet 16 | 8 | 0 | 0 | FALSE | FALSE |
| Elite Eight | 4 | 0 | 0 | FALSE | FALSE |
| Final Four | 2 | 0 | 0 | FALSE | FALSE |
| Championship | 1 | 0 | 0 | FALSE | FALSE |

- **ExcludeNormal** (column E): TRUE/FALSE — when TRUE, this round's games are excluded from the Normal pool results
- **ExcludeInverse** (column F): TRUE/FALSE — when TRUE, this round's games are excluded from the Inverse pool results
- Default exclusions match tournament rules: First Four excluded from both pools; Round of 64 and Round of 32 excluded from inverse pool only

### Tab 4: "PaidUsers"

Create a new tab named "PaidUsers" with this layout:

| A | B | C |
|---|---|---|
| Name | Paid | Notes |

- Column A: User name (lowercase, trimmed) — this is the key
- Column B: TRUE or FALSE
- Column C: Free-text notes (e.g. "paid by John", "Venmo", "owes for 2 squares")

Rows will be added/updated automatically when the admin marks users as paid/unpaid or edits notes.

### Tab 5: "LinkedGames"

Create a new tab named "LinkedGames" with this layout:

| A | B |
|---|---|
| GameID | ApiGameID |

- Column A: Tournament game ID (1-67)
- Column B: ESPN API game ID that is linked to this tournament game

Rows will be added/updated automatically when the admin links a tournament game to an ESPN live game. This tab enables linked game selections to persist across devices.

### Tab 6: "LockedGames"

Create a new tab named "LockedGames" with this layout:

| A |
|---|
| GameID |

- Column A: Tournament game ID (1-67) of a locked-in game

Rows will be added/updated automatically when the admin locks in a game score. This tab enables locked game state to persist across devices.

### Tab 7: "PayoutGroups"

Create a new tab named "PayoutGroups" with this layout:

| A | B |
|---|---|
| UserKey | PayoutRecipientKey |

- Column A: User name key (lowercase, trimmed) — the person who won
- Column B: Payout recipient key (lowercase, trimmed) — the Venmo account that receives the payout

This allows grouping multiple users under a single Venmo payout recipient. For example, if "john" pays via Venmo for "jane" and "bob", rows would be:

```
jane, john
bob, john
```

Users not listed default to paying out to themselves. Rows will be added/updated automatically when the admin assigns payout recipients on the Users tab.

### Tab 7b: "PaidPayouts"

Create a new tab named "PaidPayouts" with this layout:

| A | B |
|---|---|
| RecipientKey | Paid |

- Column A: Payout recipient key (lowercase, trimmed)
- Column B: Boolean (TRUE if that recipient has been paid their winnings)

Rows will be added/updated automatically when the admin clicks "Mark Paid" / "Mark Not Paid" on the Payout Summary by Recipient table in the Users tab. This lets the admin track Venmo payouts across devices.

### Tab 8: "Games"

Create a new tab named "Games" with these headers and 67 data rows:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| GameID | Round | Team1 | Team2 | Score1 | Score2 |

Add 67 rows with GameID 1-67, organized by round:

- Games 1-4: First Four
- Games 5-36: First Round (Round of 64)
- Games 37-52: Second Round (Round of 32)
- Games 53-60: Sweet 16
- Games 61-64: Elite Eight
- Games 65-66: Final Four
- Game 67: Championship

For example:
```
1,First Four,,,,
2,First Four,,,,
3,First Four,,,,
4,First Four,,,,
5,First Round (Round of 64),,,,
...
67,Championship,,,,
```

Leave Team1, Team2, Score1, and Score2 columns empty.

---

## Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Grid data ---
    const gridSheet = ss.getSheetByName('Grid');
    const gridRange = gridSheet.getRange('B2:K11');
    const gridValues = gridRange.getValues();
    const grid = gridValues.map(function(row) {
      return row.map(function(cell) {
        return cell === '' ? '' : String(cell);
      });
    });

    // --- Numbers ---
    const numbersSheet = ss.getSheetByName('Numbers');
    const numbersData = numbersSheet.getRange('B1:B3').getValues();
    const numbers = {
      rowNumbers: numbersData[0][0] ? String(numbersData[0][0]) : '',
      colNumbers: numbersData[1][0] ? String(numbersData[1][0]) : '',
      generated: numbersData[2][0] === true || numbersData[2][0] === 'TRUE'
    };

    // --- Config ---
    const configSheet = ss.getSheetByName('Config');
    const configData = configSheet.getDataRange().getValues();
    const config = [];
    for (var i = 1; i < configData.length; i++) {
      config.push({
        round: configData[i][0],
        gamesCount: configData[i][1],
        amount: configData[i][2] || 0,
        inverseAmount: configData[i][3] || 0,
        excludeNormal: configData[i][4] === true || configData[i][4] === 'TRUE',
        excludeInverse: configData[i][5] === true || configData[i][5] === 'TRUE'
      });
    }

    // --- Games ---
    const gamesSheet = ss.getSheetByName('Games');
    const gamesData = gamesSheet.getDataRange().getValues();
    const games = [];
    for (var j = 1; j < gamesData.length; j++) {
      games.push({
        gameId: gamesData[j][0],
        round: gamesData[j][1],
        team1: gamesData[j][2] || '',
        team2: gamesData[j][3] || '',
        score1: gamesData[j][4] === '' ? null : gamesData[j][4],
        score2: gamesData[j][5] === '' ? null : gamesData[j][5]
      });
    }

    // --- Linked Games ---
    var linkedGames = {};
    var linkedSheet = ss.getSheetByName('LinkedGames');
    if (linkedSheet && linkedSheet.getLastRow() > 1) {
      var linkedData = linkedSheet.getDataRange().getValues();
      for (var lg = 1; lg < linkedData.length; lg++) {
        var gid = linkedData[lg][0];
        var apiId = linkedData[lg][1];
        if (gid && apiId) {
          linkedGames[String(gid)] = String(apiId);
        }
      }
    }

    // --- Locked Games ---
    var lockedGameIds = [];
    var lockedSheet = ss.getSheetByName('LockedGames');
    if (lockedSheet && lockedSheet.getLastRow() > 1) {
      var lockedData = lockedSheet.getDataRange().getValues();
      for (var lk = 1; lk < lockedData.length; lk++) {
        if (lockedData[lk][0]) {
          lockedGameIds.push(Number(lockedData[lk][0]));
        }
      }
    }

    // --- Paid Users ---
    var paidUsers = {};
    var userNotes = {};
    var paidSheet = ss.getSheetByName('PaidUsers');
    if (paidSheet) {
      var paidData = paidSheet.getDataRange().getValues();
      for (var p = 1; p < paidData.length; p++) {
        var nameKey = paidData[p][0];
        var isPaid = paidData[p][1] === true || paidData[p][1] === 'TRUE';
        var note = paidData[p][2] || '';
        if (nameKey) {
          paidUsers[String(nameKey)] = isPaid;
          if (note) userNotes[String(nameKey)] = String(note);
        }
      }
    }

    // --- Payout Groups ---
    var payoutGroups = {};
    var payoutSheet = ss.getSheetByName('PayoutGroups');
    if (payoutSheet && payoutSheet.getLastRow() > 1) {
      var payoutData = payoutSheet.getDataRange().getValues();
      for (var pg = 1; pg < payoutData.length; pg++) {
        var userKey = payoutData[pg][0];
        var recipientKey = payoutData[pg][1];
        if (userKey && recipientKey) {
          payoutGroups[String(userKey)] = String(recipientKey);
        }
      }
    }

    // --- Paid Payouts ---
    var paidPayouts = {};
    var paidPayoutsSheet = ss.getSheetByName('PaidPayouts');
    if (paidPayoutsSheet && paidPayoutsSheet.getLastRow() > 1) {
      var ppData = paidPayoutsSheet.getDataRange().getValues();
      for (var pp = 1; pp < ppData.length; pp++) {
        var ppKey = ppData[pp][0];
        var ppPaid = ppData[pp][1];
        if (ppKey && ppPaid === true) {
          paidPayouts[String(ppKey)] = true;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      grid: grid,
      numbers: numbers,
      config: config,
      games: games,
      linkedGames: linkedGames,
      lockedGameIds: lockedGameIds,
      paidUsers: paidUsers,
      userNotes: userNotes,
      payoutGroups: payoutGroups,
      paidPayouts: paidPayouts
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'claimSquare') {
      // Write name to Grid tab at the correct cell
      // Row maps to sheet row (row + 2 for 1-based + header)
      // Col maps to sheet column (col + 2 for 1-based + label column A)
      const gridSheet = ss.getSheetByName('Grid');
      gridSheet.getRange(data.row + 2, data.col + 2).setValue(data.name);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Square claimed'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'generateNumbers') {
      const numbersSheet = ss.getSheetByName('Numbers');
      numbersSheet.getRange('B1').setValue(data.rowNumbers);
      numbersSheet.getRange('B2').setValue(data.colNumbers);
      numbersSheet.getRange('B3').setValue(true);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Numbers generated'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveConfig') {
      const configSheet = ss.getSheetByName('Config');
      var rounds = data.rounds;
      for (var i = 0; i < rounds.length; i++) {
        // Amount is column C (3), InverseAmount is column D (4)
        // ExcludeNormal is column E (5), ExcludeInverse is column F (6)
        // Row is i + 2 (1-based + header row)
        configSheet.getRange(i + 2, 3).setValue(rounds[i].amount);
        configSheet.getRange(i + 2, 4).setValue(rounds[i].inverseAmount);
        configSheet.getRange(i + 2, 5).setValue(rounds[i].excludeNormal === true);
        configSheet.getRange(i + 2, 6).setValue(rounds[i].excludeInverse === true);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Config saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveExclusions') {
      const configSheet = ss.getSheetByName('Config');
      var exclusions = data.exclusions;
      for (var i = 0; i < exclusions.length; i++) {
        // ExcludeNormal is column E (5), ExcludeInverse is column F (6)
        configSheet.getRange(i + 2, 5).setValue(exclusions[i].excludeNormal === true);
        configSheet.getRange(i + 2, 6).setValue(exclusions[i].excludeInverse === true);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Exclusions saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveScore') {
      const gamesSheet = ss.getSheetByName('Games');
      const gamesData = gamesSheet.getDataRange().getValues();

      for (var j = 1; j < gamesData.length; j++) {
        if (gamesData[j][0] === data.gameId) {
          // Team1 = col C (3), Team2 = col D (4), Score1 = col E (5), Score2 = col F (6)
          gamesSheet.getRange(j + 1, 3).setValue(data.team1);
          gamesSheet.getRange(j + 1, 4).setValue(data.team2);
          gamesSheet.getRange(j + 1, 5).setValue(data.score1);
          gamesSheet.getRange(j + 1, 6).setValue(data.score2);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Score saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'savePaidUsers') {
      var paidSheet = ss.getSheetByName('PaidUsers');
      if (!paidSheet) {
        paidSheet = ss.insertSheet('PaidUsers');
        paidSheet.getRange('A1').setValue('Name');
        paidSheet.getRange('B1').setValue('Paid');
        paidSheet.getRange('C1').setValue('Notes');
      }

      // Clear existing data (keep header)
      var lastRow = paidSheet.getLastRow();
      if (lastRow > 1) {
        paidSheet.getRange(2, 1, lastRow - 1, 3).clearContent();
      }

      // Write all paid users and notes
      var paidUsers = data.paidUsers;
      var userNotes = data.userNotes || {};
      var names = Object.keys(paidUsers);
      // Also include any names that only have notes
      Object.keys(userNotes).forEach(function(n) {
        if (names.indexOf(n) === -1) names.push(n);
      });
      var row = 2;
      for (var p = 0; p < names.length; p++) {
        paidSheet.getRange(row, 1).setValue(names[p]);
        paidSheet.getRange(row, 2).setValue(paidUsers[names[p]] === true);
        paidSheet.getRange(row, 3).setValue(userNotes[names[p]] || '');
        row++;
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Paid users saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveLockedGames') {
      var lockedSheet = ss.getSheetByName('LockedGames');
      if (!lockedSheet) {
        lockedSheet = ss.insertSheet('LockedGames');
        lockedSheet.getRange('A1').setValue('GameID');
      }

      // Clear existing data (keep header)
      var lastRow = lockedSheet.getLastRow();
      if (lastRow > 1) {
        lockedSheet.getRange(2, 1, lastRow - 1, 1).clearContent();
      }

      // Write all locked game IDs
      var ids = data.lockedGameIds || [];
      for (var lk = 0; lk < ids.length; lk++) {
        lockedSheet.getRange(lk + 2, 1).setValue(Number(ids[lk]));
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Locked games saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveLinkedGames') {
      var linkedSheet = ss.getSheetByName('LinkedGames');
      if (!linkedSheet) {
        linkedSheet = ss.insertSheet('LinkedGames');
        linkedSheet.getRange('A1').setValue('GameID');
        linkedSheet.getRange('B1').setValue('ApiGameID');
      }

      // Clear existing data (keep header)
      var lastRow = linkedSheet.getLastRow();
      if (lastRow > 1) {
        linkedSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      }

      // Write all linked games
      var lgData = data.linkedGames || {};
      var gameIds = Object.keys(lgData);
      var row = 2;
      for (var lg = 0; lg < gameIds.length; lg++) {
        linkedSheet.getRange(row, 1).setValue(Number(gameIds[lg]));
        linkedSheet.getRange(row, 2).setValue(lgData[gameIds[lg]]);
        row++;
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Linked games saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'savePayoutGroups') {
      var payoutSheet = ss.getSheetByName('PayoutGroups');
      if (!payoutSheet) {
        payoutSheet = ss.insertSheet('PayoutGroups');
        payoutSheet.getRange('A1').setValue('UserKey');
        payoutSheet.getRange('B1').setValue('PayoutRecipientKey');
      }

      // Clear existing data (keep header)
      var lastRow = payoutSheet.getLastRow();
      if (lastRow > 1) {
        payoutSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      }

      // Write all payout groups
      var pgData = data.payoutGroups || {};
      var pgKeys = Object.keys(pgData);
      var row = 2;
      for (var pg = 0; pg < pgKeys.length; pg++) {
        payoutSheet.getRange(row, 1).setValue(pgKeys[pg]);
        payoutSheet.getRange(row, 2).setValue(pgData[pgKeys[pg]]);
        row++;
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Payout groups saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'savePaidPayouts') {
      var paidPayoutsSheet = ss.getSheetByName('PaidPayouts');
      if (!paidPayoutsSheet) {
        paidPayoutsSheet = ss.insertSheet('PaidPayouts');
        paidPayoutsSheet.getRange('A1').setValue('RecipientKey');
        paidPayoutsSheet.getRange('B1').setValue('Paid');
      }

      // Clear existing data (keep header)
      var lastRow = paidPayoutsSheet.getLastRow();
      if (lastRow > 1) {
        paidPayoutsSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
      }

      // Write all paid payout recipients
      var ppDataIn = data.paidPayouts || {};
      var ppKeys = Object.keys(ppDataIn);
      var row = 2;
      for (var pp = 0; pp < ppKeys.length; pp++) {
        if (ppDataIn[ppKeys[pp]] === true) {
          paidPayoutsSheet.getRange(row, 1).setValue(ppKeys[pp]);
          paidPayoutsSheet.getRange(row, 2).setValue(true);
          row++;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Paid payouts saved'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Unknown action: ' + data.action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon) and name the project "NCAA Squares Backend"

---

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set these options:
   - Description: "NCAA Squares API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts to allow permissions
6. **Copy the Web app URL** (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

---

## Step 4: Update index.html

1. Open `ncaa/index.html`
2. Find these lines near the top of the script:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   const SHEETS_CONFIGURED = false;
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web app URL
4. Change `SHEETS_CONFIGURED` to `true`

---

## Testing

1. Open `ncaa/index.html` in your browser
2. The grid, config, and games should load from Google Sheets
3. Claim a square — check that the name appears in the Grid tab of your sheet
4. Generate numbers — check the Numbers tab
5. Set config amounts and save — check the Config tab
6. Enter a game score — check the Games tab
7. Refresh the page — all data should persist
8. On the Users tab, assign a payout recipient via the dropdown — check the PayoutGroups tab in the sheet
9. On the Users tab in the Payout Summary by Recipient table, click "Mark Paid" for a recipient — check the PaidPayouts tab in the sheet; reload on another device to confirm the Paid status persists

---

## Notes

- The page works fully in offline mode when `SHEETS_CONFIGURED` is `false`
- All saves are "fire and forget" (optimistic updates) — the UI updates immediately regardless of whether the server call succeeds
- If you need to redeploy after code changes, go to Deploy > Manage deployments > Edit
- The Apps Script `doGet` returns all data in one call to minimize load time
