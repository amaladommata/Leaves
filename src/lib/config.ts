// ---------------------------------------------------------------------------
// Google Sheet connection
//
// The dashboard reads its data live from a Google Sheet. To connect your own
// sheet, set these two values as environment variables in Vercel (or in a
// local .env file):
//
//   VITE_SHEET_ID    – the long id in the sheet URL:
//                      https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
//   VITE_SHEET_NAME  – the tab name to read (defaults to "Sheet1")
//
// The sheet must be shared as "Anyone with the link – Viewer" so the browser
// can read it. See README.md for the full step-by-step.
//
// If no sheet is configured the dashboard falls back to bundled demo data so
// you can still see the layout.
// ---------------------------------------------------------------------------

export const SHEET_ID: string = import.meta.env.VITE_SHEET_ID ?? "";
export const SHEET_NAME: string = import.meta.env.VITE_SHEET_NAME ?? "Sheet1";

/** How often (ms) to re-poll the sheet so edits show up automatically. */
export const REFRESH_INTERVAL_MS = 60_000;

export const hasSheet = SHEET_ID.trim().length > 0;

/** gviz CSV endpoint – works for any link-viewable sheet, no API key needed. */
export function sheetCsvUrl(): string {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: SHEET_NAME,
  });
  return `${base}?${params.toString()}`;
}
