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

| A | B | C | D |
|---|---|---|---|
| Round | GamesCount | Amount | InverseAmount |
| First Four | 4 | 0 | 0 |
| First Round (Round of 64) | 32 | 0 | 0 |
| Second Round (Round of 32) | 16 | 0 | 0 |
| Sweet 16 | 8 | 0 | 0 |
| Elite Eight | 4 | 0 | 0 |
| Final Four | 2 | 0 | 0 |
| Championship | 1 | 0 | 0 |

### Tab 4: "Games"

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
        inverseAmount: configData[i][3] || 0
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

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      grid: grid,
      numbers: numbers,
      config: config,
      games: games
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
        // Row is i + 2 (1-based + header row)
        configSheet.getRange(i + 2, 3).setValue(rounds[i].amount);
        configSheet.getRange(i + 2, 4).setValue(rounds[i].inverseAmount);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Config saved'
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

---

## Notes

- The page works fully in offline mode when `SHEETS_CONFIGURED` is `false`
- All saves are "fire and forget" (optimistic updates) — the UI updates immediately regardless of whether the server call succeeds
- If you need to redeploy after code changes, go to Deploy > Manage deployments > Edit
- The Apps Script `doGet` returns all data in one call to minimize load time
