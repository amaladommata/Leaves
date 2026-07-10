import Papa from "papaparse";
import { HEADER_MAP, type LeaveRow } from "./types";
import { hasSheet, sheetCsvUrl } from "./config";
import { SAMPLE_ROWS } from "./sample";

function rowFromRecord(rec: Record<string, string>): LeaveRow {
  const out: Partial<LeaveRow> = {};
  for (const [rawKey, rawVal] of Object.entries(rec)) {
    const field = HEADER_MAP[rawKey.trim().toLowerCase()];
    if (field) out[field] = (rawVal ?? "").trim();
  }
  return {
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
    ...out,
  };
}

/**
 * Loads leave rows from the configured Google Sheet. Falls back to bundled
 * demo data when no sheet is configured (so the layout always renders).
 */
export async function loadLeaveRows(): Promise<LeaveRow[]> {
  if (!hasSheet) return SAMPLE_ROWS;

  const res = await fetch(sheetCsvUrl(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Google Sheet request failed (${res.status}). Check that the sheet is ` +
        `shared as "Anyone with the link – Viewer" and the id/tab are correct.`,
    );
  }
  const csv = await res.text();

  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
  });

  return parsed.data
    .map(rowFromRecord)
    .filter((r) => r.mediamintId || r.employeeName);
}
