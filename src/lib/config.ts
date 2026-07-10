// ---------------------------------------------------------------------------
// Google Sheet connection (private sheet, via an Apps Script web app)
//
// The dashboard reads its data from a Google Apps Script "web app" that you
// deploy from your own (private) sheet. The sheet itself stays private — it is
// never shared publicly. The script runs as you and returns the rows as JSON.
//
// Set this one environment variable in Vercel (Project → Settings →
// Environment Variables) and locally in a .env file:
//
//   VITE_SHEET_API_URL – the "/exec" web-app URL you get when you deploy the
//                        Apps Script (see apps-script/Code.gs and README.md)
//
// If it is not set, the dashboard falls back to bundled demo data so you can
// still see the layout.
// ---------------------------------------------------------------------------

export const SHEET_API_URL: string = import.meta.env.VITE_SHEET_API_URL ?? "";

/** How often (ms) to re-poll so sheet edits show up automatically. */
export const REFRESH_INTERVAL_MS = 60_000;

export const hasSheet = SHEET_API_URL.trim().length > 0;
