// Date + financial-year helpers for the leave dashboard.
//
// Why this exists: in the source sheet the Start Date / End Date columns are
// blank ("NA") for sick leave and single-day entries — only the "Leave Dates"
// list is always populated. So we derive each leave's window (first date →
// last date) from "Leave Dates", falling back to the Start/End columns.

import type { LeaveRow } from "./types";

export type LeaveState = "upcoming" | "ongoing" | "completed" | "unknown";

/** Parse "2026-07-07" or "Jul 07 2026" (comma optional) to a local midnight date. */
export function parseDateLoose(input: string): Date | null {
  if (!input) return null;
  const t = input.trim();
  if (!t || t.toUpperCase() === "NA") return null;

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);

  const d = new Date(t.replace(/,/g, ""));
  if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return null;
}

/**
 * First and last calendar day of a leave. Uses the Start Date / End Date columns
 * when present; when either is "NA" (which it always is for sick leave and
 * single-day leaves) that side is taken from the "Leave Dates" list instead —
 * its first token is the start, its last token is the end. A single-day leave
 * therefore gets start = end = that one date.
 */
export function leaveWindow(row: LeaveRow): { start: Date | null; end: Date | null } {
  let start = parseDateLoose(row.startDate);
  let end = parseDateLoose(row.endDate);

  if (!start || !end) {
    const tokens = (row.leaveDates || "")
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length) {
      if (!start) start = parseDateLoose(tokens[0]);
      if (!end) end = parseDateLoose(tokens[tokens.length - 1]);
    }
  }

  if (start && !end) end = start;
  if (end && !start) start = end;

  // Guard against reversed order.
  if (start && end && start.getTime() > end.getTime()) [start, end] = [end, start];
  return { start, end };
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Where the leave sits relative to `today`. */
export function leaveState(
  start: Date | null,
  end: Date | null,
  today: Date,
): LeaveState {
  if (!start || !end) return "unknown";
  const t = today.getTime();
  if (start.getTime() > t) return "upcoming";
  if (end.getTime() < t) return "completed";
  return "ongoing";
}

/** The first day back after a leave (day after it ends). */
export function returnDate(end: Date | null): Date | null {
  if (!end) return null;
  const r = new Date(end);
  r.setDate(r.getDate() + 1);
  return r;
}

/** "Sep 22 2025" — matches the dashboard's display style. */
export function formatDate(d: Date | null): string {
  if (!d) return "—";
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  return `${mon} ${String(d.getDate()).padStart(2, "0")} ${d.getFullYear()}`;
}

// --- Financial year (India: Apr 1 → Mar 31) ---------------------------------

/** The FY a date belongs to, identified by its starting calendar year. */
export function fyStartYear(d: Date): number {
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
}

export function fyLabel(startYear: number): string {
  return `FY ${startYear}–${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/** Inclusive [Apr 1, Mar 31] range for a financial year. */
export function fyRange(startYear: number): { from: Date; to: Date } {
  return {
    from: new Date(startYear, 3, 1),
    to: new Date(startYear + 1, 2, 31),
  };
}

/** Monday-to-Sunday week containing `today`. */
export function weekRange(today: Date): { from: Date; to: Date } {
  const day = today.getDay(); // 0 = Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const from = startOfDay(new Date(today));
  from.setDate(from.getDate() + mondayOffset);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  return { from, to };
}

export function withinRange(d: Date | null, from: Date | null, to: Date | null): boolean {
  if (!d) return false;
  if (from && d.getTime() < from.getTime()) return false;
  if (to && d.getTime() > to.getTime()) return false;
  return true;
}
