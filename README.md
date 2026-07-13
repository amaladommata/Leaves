# Leave Tracker Dashboard

A React dashboard for company leave data, styled after the weekly leave
tracker layout. Data is read **live from a private Google Sheet** — edit the
sheet and the dashboard updates on its own (it re-polls every 60 seconds and
whenever you switch back to the tab). Built with Vite + React, deploys to
Vercel as a static site.

![Leave Tracker](docs/preview.png)

## How it works

```
Private Google Sheet
      │  (Apps Script web app, runs as you, returns JSON)
      ▼
React dashboard on Vercel
```

Your **sheet stays private** — it is never shared publicly. A tiny Google Apps
Script deployed *from the sheet* runs under your own account and serves the rows
as JSON to the dashboard.

Until a web app is connected, the dashboard shows bundled **demo data** so you
can see the layout immediately.

---

## Setup

### 1. Prepare your Google Sheet

Put your leave data in a Google Sheet. Keep the header row exactly as your
export has it:

> `Employee Name`, `Mediamint ID`, `Email`, `Manager Name`, `Leave Type`,
> `No. of Days/Hours`, `Applied On`, `Leave Dates`, `Reason`, `Day`,
> `Start Date`, `End Date`, `Status`

(Column order doesn't matter — columns are matched by header name. Extra
columns are ignored. An optional `Country` / `Location` column is used by the
country chart.)

**Keep the sheet private — do not change its sharing.**

### 2. Deploy the Apps Script web app

1. In the sheet, open **Extensions → Apps Script**.
2. Delete any code there and paste the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs). If your tab isn't named
   `Sheet1`, change the `SHEET_NAME` line at the top.
3. Click **Deploy → New deployment**. For *Select type* choose **Web app**, then:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**, authorize when prompted, and **copy the Web app URL** — it
   ends in `/exec`.

> This keeps the sheet private. The script runs as you; only the JSON rows are
> exposed at the `/exec` URL.

### 3. Point the dashboard at it (Vercel)

1. In your Vercel project → **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `VITE_SHEET_API_URL` | the `/exec` Web app URL from step 2 |

   (If you previously added `VITE_SHEET_ID` / `VITE_SHEET_NAME`, you can delete
   them — they're no longer used.)

2. **Redeploy** so the new value is picked up: **Deployments → ⋯ on the latest →
   Redeploy**. Vite bakes env vars in at build time, so a redeploy is required.

Done — the dashboard now reads your private sheet.

> **To update the dashboard, just edit the sheet.** New rows and status changes
> appear on their own within a minute (or immediately via the **Refresh**
> button). Change the Apps Script later? Use **Deploy → Manage deployments →
> edit → Version: New version** so the same `/exec` URL keeps working.

---

## Run locally

```bash
npm install
cp .env.example .env      # then fill in VITE_SHEET_API_URL
npm run dev               # http://localhost:5173
```

Leave `.env` blank to preview with the bundled demo data.

```bash
npm run build             # production build into dist/
npm run preview           # serve the production build locally
```

---

## What's on the dashboard

A left **sidebar** switches between four views:

- **Maternity** (`ML`), **Medical >1wk** (sick leave `SL` of a week or more), and
  **Long leave / LOP** (`LOP`) — each is a focused page with an employee detail
  table and four activity cards: **Total · Ongoing · Upcoming · Returning this week**.
- **All leaves** — the company-wide overview: **New requests · Approved · Rejected ·
  Withdrawn · Total** cards, a **Leaves by type** donut, a **Leaves by country**
  bar chart, and a full employee detail table (with a Leave-type column).

Every page shares the same filter bar — **search · leave type** (All leaves only)
**· leave status · approval status · date range** — and the same detail table
columns: MM ID · Employee · Country · Start · End · Return · Leave status · Approval.

### Leave status & dates

- **Leave status** is computed against today: **Upcoming** (starts after today),
  **Ongoing** (today falls within the leave), **Completed** (already ended).
- Because the sheet's `Start Date`/`End Date` columns are blank for sick leave and
  single-day entries, the **leave window is derived from the `Leave Dates` list**
  (first date → last date), falling back to the Start/End columns when present.
- **Return date** = the day after the leave ends. **Returning this week** counts
  leaves ending in the current Mon–Sun week.

### Date range

The date filter defaults to the **current financial year** (India, Apr 1 – Mar 31).
The dropdown also lists prior FYs, **All time**, and a **Custom range** (two date
pickers). It filters on each leave's start date.

> **Country column (optional).** If your sheet has a `Country` (or `Location`)
> column it is used directly. If it doesn't, every row defaults to **India** —
> change that default in `src/lib/types.ts` (`DEFAULT_COUNTRY`).

## Customizing

| Want to change… | Edit |
| --- | --- |
| Sidebar categories & titles | `src/lib/transform.ts` (`VIEWS`, `inCategory`) |
| "Long medical" threshold | `src/lib/transform.ts` (`LONG_MEDICAL_MIN_DAYS`) |
| Leave-type names & colors | `src/lib/transform.ts` (`LEAVE_TYPES`) |
| Approval / leave-status labels & colors | `src/lib/transform.ts` (`statusMeta`, `stateMeta`) |
| Financial-year start / date logic | `src/lib/dates.ts` |
| How often it re-polls | `src/lib/config.ts` (`REFRESH_INTERVAL_MS`) |
| Column → field mapping | `src/lib/types.ts` (`HEADER_MAP`) |
| Colors, spacing, light theme | `src/styles.css` |

## Notes

- Leave types are mapped from their codes: `PTO` → Paid Time Off, `OT` →
  Overtime, `SL` → Sick Leave, `CL` → Casual Leave, `RH` → Restricted Holiday,
  `LOP` → Loss of Pay, `ML` → Maternity, `PL` → Paternity, `WFH` → Work From
  Home, `OD` → On Duty. Add or change these in `LEAVE_TYPES`.
- The demo data uses fictional names — no real employee data is stored in this
  repo. Real data only ever lives in your Google Sheet.
