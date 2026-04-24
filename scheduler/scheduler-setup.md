# Scheduler Setup

A modern scheduling tool with two sides:

- **Consumer** (`/scheduler/`): no login, books 30-min slots in a Mon–Sun grid.
- **Admin** (`/scheduler/admin.html`): PIN login, opens/closes slots, views bookings, edits settings.

The front-end is static HTML/JS. Data persistence uses a Google Sheet via Apps Script. Before wiring up Apps Script the site runs in **demo mode** using `localStorage`, which is perfect for iterating on the UI.

---

## 1. Try the UI in demo mode (no setup)

1. Open `scheduler/index.html` in a browser (or `npx serve scheduler`).
2. Nothing is available yet. Open `scheduler/admin.html`, sign in with PIN **`1234`**.
3. On **Availability**, click locked cells to open 30-min slots.
4. On **Settings**, flip **Site published** on. Adjust hours, advance-days, or PIN.
5. Reload `index.html` — your open slots appear. Click one to book.

All demo data lives in `localStorage` under the key `scheduler-demo-v1`. Clear it in DevTools to reset.

---

## 2. Wire up Google Sheets (for real)

### Create the spreadsheet

1. Create a new Google Sheet.
2. **Extensions → Apps Script** and paste `scheduler/Code.gs` into `Code.gs`. Save.
3. In the script editor, pick the **`setup`** function from the dropdown and click **Run**. Authorize when prompted.
4. Back in the Sheet, you'll see three tabs (`Config`, `Availability`, `Bookings`) with headers, frozen header rows, and seeded config defaults.

From then on, a **Scheduler → Run setup / repair tabs** menu appears at the top of the spreadsheet — you can re-run it anytime to repair missing tabs or headers without losing existing data.

Sheet structure (for reference):

| Sheet | Columns |
|---|---|
| `Config` | `Key`, `Value` |
| `Availability` | `Date` (YYYY-MM-DD), `Time` (HH:MM) |
| `Bookings` | `Date`, `Time`, `Name`, `Phone`, `Team`, `Timestamp` |

`Config` keys (seeded by `setup`):

| Key | Default | Meaning |
|---|---|---|
| `admin_pin` | `1234` | PIN for admin sign-in |
| `advance_days` | `1` | 0 = same-day OK, 1 = tomorrow+, 2 = day-after+ |
| `site_published` | `false` | Consumers only see slots when `true` |
| `start_hour` | `8` | Earliest slot of the day (0–23) |
| `end_hour` | `21` | Day ends at this hour (exclusive) |

### Deploy the Apps Script

1. In the same Apps Script editor, click **Deploy → New deployment** → Type: **Web app**.
2. **Execute as**: `Me`. **Who has access**: `Anyone`.
3. Deploy and copy the `/exec` URL.

### Point the front-end at the script

Edit `scheduler/js/api.js` and paste the `/exec` URL into `API_URL`:

```js
const API_URL = 'https://script.google.com/macros/s/XXXX/exec';
```

Commit and push. The demo layer is automatically bypassed once `API_URL` is set.

---

## 3. Typical admin flow

1. **Sunday evening**: open **Admin → Availability**, click each slot you’re open for next week (or use **Unlock all** and then lock off what you don’t want).
2. **Settings → Site published = ON**.
3. Consumers hit the page, see green “Available” slots, book by entering name + phone + team.
4. Admin sees booked slots in blue with the consumer’s first name; click any booked cell (or use the **Bookings** tab) to see phone and team details.
5. Past days become read-only automatically.

### Advance-booking rule

Controlled by `advance_days`:

- `0` — same-day booking allowed.
- `1` — earliest bookable day is tomorrow.
- `2` — earliest bookable day is the day after tomorrow.
- … and so on.

Today and anything earlier than the window show as **past / closed** to the consumer.

---

## 4. File map

```
scheduler/
  index.html         Consumer view
  admin.html         Admin view (PIN login)
  Code.gs            Apps Script backend
  css/styles.css     Styling
  js/
    utils.js         Date/time helpers
    api.js           Front-end API wrapper (edit API_URL here)
    demo.js          localStorage fallback when API_URL is blank
    consumer.js      Consumer page logic
    admin.js         Admin page logic
  scheduler-setup.md This file
```

---

## 5. Notes

- **Security**: the admin PIN is stored in the `Config` sheet in plain text. This is a soft gate, not real auth. Don’t publish sensitive data through it.
- **Timezone**: dates are stored as `YYYY-MM-DD`. The Apps Script uses the sheet’s timezone for date math; make sure your Sheet timezone matches the region you care about (File → Settings → General).
- **Grid size**: keep `end_hour − start_hour` reasonable (≤ 16). 224 cells max per week renders fine even on mobile; beyond that the grid starts to feel noisy.
- **Booked slots**: even if you toggle a slot back to locked, an existing booking stays in the `Bookings` sheet. Cancel from the booking-details modal to free it up.
