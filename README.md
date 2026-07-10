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

- **Stat cards** — new (pending) requests, approved, rejected, and total leaves.
- **Leaves by type** — donut chart with a per-type breakdown; the long tail of
  rare types folds into "Other."
- **Leaves by country** — bar chart of leaves per country (see the note below on
  the optional `Country` column).
- **Leave records** — every leave, grouped by type, with a colored status pill.
- **Filters** — search by name / ID / manager, plus leave-type, status, and
  country dropdowns. All charts and cards respond to the filters.

> **Country column (optional).** If your sheet has a `Country` (or `Location`)
> column it is used directly. If it doesn't, every row defaults to **India** —
> change that default in `src/lib/types.ts` (`DEFAULT_COUNTRY`), or add a
> `Country` column to your sheet to break the bar chart out by office.

## Customizing

| Want to change… | Edit |
| --- | --- |
| Leave-type names & colors | `src/lib/transform.ts` (`LEAVE_TYPES`) |
| Status colors / labels | `src/lib/transform.ts` (`statusMeta`) |
| How often it re-polls | `src/lib/config.ts` (`REFRESH_INTERVAL_MS`) |
| Column → field mapping | `src/lib/types.ts` (`HEADER_MAP`) |
| Colors, spacing, dark theme | `src/styles.css` |

## Notes

- Leave types are mapped from their codes: `PTO` → Paid Time Off, `OT` →
  Overtime, `SL` → Sick Leave, `CL` → Casual Leave, `RH` → Restricted Holiday,
  `LOP` → Loss of Pay, `ML` → Maternity, `PL` → Paternity, `WFH` → Work From
  Home, `OD` → On Duty. Add or change these in `LEAVE_TYPES`.
- The demo data uses fictional names — no real employee data is stored in this
  repo. Real data only ever lives in your Google Sheet.
