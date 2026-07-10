import { HEADER_MAP, DEFAULT_COUNTRY, type LeaveRow } from "./types";
import { hasSheet, SHEET_API_URL } from "./config";
import { SAMPLE_ROWS } from "./sample";

/** A single row from the Apps Script, keyed by the sheet's header names. */
type SheetRecord = Record<string, string>;

function rowFromRecord(rec: SheetRecord): LeaveRow {
  const out: Partial<LeaveRow> = {};
  for (const [rawKey, rawVal] of Object.entries(rec)) {
    const field = HEADER_MAP[rawKey.trim().toLowerCase()];
    if (field) out[field] = (rawVal ?? "").toString().trim();
  }
  const base: LeaveRow = {
    employeeName: "",
    mediamintId: "",
    email: "",
    managerName: "",
    leaveType: "",
    daysHours: "",
    appliedOn: "",
    leaveDates: "",
    reason: "",
    day: "",
    startDate: "",
    endDate: "",
    status: "",
    country: "",
    ...out,
  };
  if (!base.country) base.country = DEFAULT_COUNTRY;
  return base;
}

/**
 * Loads leave rows from the Apps Script web app (which reads your private
 * sheet). Falls back to bundled demo data when no web app is configured, so the
 * layout always renders.
 */
export async function loadLeaveRows(): Promise<LeaveRow[]> {
  if (!hasSheet) return SAMPLE_ROWS;

  let res: Response;
  try {
    res = await fetch(SHEET_API_URL, { cache: "no-store", redirect: "follow" });
  } catch {
    throw new Error(
      "Couldn't reach the data web app. Check that VITE_SHEET_API_URL is the " +
        '"/exec" URL and the Apps Script is deployed with access set to "Anyone".',
    );
  }
  if (!res.ok) {
    throw new Error(
      `Data web app returned ${res.status}. Re-deploy the Apps Script with ` +
        'access "Anyone" and make sure VITE_SHEET_API_URL points at the "/exec" URL.',
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "The data web app didn't return JSON — this usually means the Apps " +
        'Script access isn\'t set to "Anyone", so Google served a sign-in page.',
    );
  }

  const payload = data as { records?: SheetRecord[]; error?: string };
  if (payload?.error) throw new Error(`Apps Script error: ${payload.error}`);

  const records: SheetRecord[] = Array.isArray(data)
    ? (data as SheetRecord[])
    : (payload.records ?? []);

  return records
    .map(rowFromRecord)
    .filter((r) => r.mediamintId || r.employeeName);
}
