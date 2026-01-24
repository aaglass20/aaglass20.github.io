# Binho Finger Soccer - Google Sheets Setup

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "Binho Finger Soccer League"

### Sheet 1: "Schedule" (rename the first tab)

Add these headers in row 1:
| A | B | C | D | E |
|---|---|---|---|---|
| GameID | HomeTeam | AwayTeam | HomeScore | AwayScore |

Add the 20 games (rows 2-21):
```
1,Grady,Austin,,
2,Grady,Jordan,,
3,Grady,Mom,,
4,Grady,Dad,,
5,Austin,Grady,,
6,Austin,Jordan,,
7,Austin,Mom,,
8,Austin,Dad,,
9,Jordan,Grady,,
10,Jordan,Austin,,
11,Jordan,Mom,,
12,Jordan,Dad,,
13,Mom,Grady,,
14,Mom,Austin,,
15,Mom,Jordan,,
16,Mom,Dad,,
17,Dad,Grady,,
18,Dad,Austin,,
19,Dad,Jordan,,
20,Dad,Mom,,
```

Leave HomeScore and AwayScore columns empty.

---

## Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const scheduleSheet = ss.getSheetByName('Schedule');

    // Get schedule data
    const scheduleData = scheduleSheet.getDataRange().getValues();
    const headers = scheduleData[0];
    const schedule = [];

    for (let i = 1; i < scheduleData.length; i++) {
      const row = scheduleData[i];
      schedule.push({
        gameId: row[0],
        homeTeam: row[1],
        awayTeam: row[2],
        homeScore: row[3] === '' ? null : row[3],
        awayScore: row[4] === '' ? null : row[4]
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      schedule: schedule
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

    if (data.action === 'updateScore') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const scheduleSheet = ss.getSheetByName('Schedule');

      // Find the row with matching gameId
      const scheduleData = scheduleSheet.getDataRange().getValues();

      for (let i = 1; i < scheduleData.length; i++) {
        if (scheduleData[i][0] === data.gameId) {
          // Update scores (columns D and E, which are indices 4 and 5 in 1-based)
          scheduleSheet.getRange(i + 1, 4).setValue(data.homeScore);
          scheduleSheet.getRange(i + 1, 5).setValue(data.awayScore);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Score updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon) and name the project "Binho Backend"

---

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set these options:
   - Description: "Binho API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts to allow permissions
6. **Copy the Web app URL** (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

---

## Step 4: Update binho.html

1. Open `BDU/binho.html`
2. Find this line near the top of the script:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web app URL

---

## Testing

1. Open binho.html in your browser
2. The schedule should load from Google Sheets
3. Click a game, enter a score, and save
4. Check your Google Sheet - the score should appear
5. Refresh the page - standings should reflect the result

---

## Notes

- The page works offline with default data if Google Sheets isn't configured
- Standings are calculated client-side from the schedule data
- If you need to redeploy after code changes, go to Deploy > Manage deployments > Edit
