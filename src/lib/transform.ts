import type { LeaveRow } from "./types";
import {
  leaveWindow,
  returnDate,
  leaveState,
  fyStartYear,
  fyRange,
  weekRange,
  withinRange,
  parseDateLoose,
  type LeaveState,
} from "./dates";

// --- Leave-type metadata (light-mode categorical palette) --------------------
// Color follows the entity (a fixed hue per leave type), never its rank.

export interface LeaveTypeMeta {
  code: string;
  label: string;
  color: string;
}

const OTHER_COLOR = "#898781";

const LEAVE_TYPES: Record<string, LeaveTypeMeta> = {
  PTO: { code: "PTO", label: "Paid Time Off", color: "#2a78d6" }, // blue
  OT: { code: "OT", label: "Overtime", color: "#1baf7a" }, // aqua
  SL: { code: "SL", label: "Sick Leave", color: "#eda100" }, // yellow
  CL: { code: "CL", label: "Casual Leave", color: "#4a3aa7" }, // violet
  RH: { code: "RH", label: "Restricted Holiday", color: "#008300" }, // green
  LOP: { code: "LOP", label: "Loss of Pay", color: "#e34948" }, // red
  ML: { code: "ML", label: "Maternity Leave", color: "#e87ba4" }, // magenta
  PL: { code: "PL", label: "Paternity Leave", color: "#eb6834" }, // orange
  WFH: { code: "WFH", label: "Work From Home", color: OTHER_COLOR },
  OD: { code: "OD", label: "On Duty", color: OTHER_COLOR },
};

export function leaveTypeMeta(code: string): LeaveTypeMeta {
  return (
    LEAVE_TYPES[code?.toUpperCase?.() ?? ""] ?? {
      code: code || "—",
      label: code || "Other",
      color: OTHER_COLOR,
    }
  );
}

// --- Approval-status metadata (light-mode pills) -----------------------------

export interface StatusMeta {
  label: string;
  cls: string; // css class suffix, e.g. "good"
}

export function statusMeta(status: string): StatusMeta {
  const s = status.toLowerCase();
  if (s === "approved") return { label: "Approved", cls: "good" };
  if (s === "pending") return { label: "Pending", cls: "warn" };
  if (s === "rejected") return { label: "Rejected", cls: "crit" };
  if (s.startsWith("withdraw")) return { label: status, cls: "wdrw" };
  return { label: status || "—", cls: "muted" };
}

/** Leave-state chip metadata (Upcoming / Ongoing / Completed). */
export function stateMeta(state: LeaveState): { label: string; cls: string } {
  switch (state) {
    case "ongoing":
      return { label: "Ongoing", cls: "ongoing" };
    case "upcoming":
      return { label: "Upcoming", cls: "upcoming" };
    case "completed":
      return { label: "Completed", cls: "done" };
    default:
      return { label: "—", cls: "muted" };
  }
}

// --- Row enrichment ----------------------------------------------------------

/** A sick/medical leave of this many days or more counts as "long". */
export const LONG_MEDICAL_MIN_DAYS = 7;

/** Parses the leave length in days from "No. of Days/Hours"; hours-based → 0. */
export function parseLeaveDays(row: LeaveRow): number {
  const s = row.daysHours.toLowerCase();
  if (s.includes("hour")) return 0;
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

export interface EnrichedRow extends LeaveRow {
  start: Date | null;
  end: Date | null;
  ret: Date | null;
  lengthDays: number;
  state: LeaveState;
}

/** Compute each row's leave window, return date, length, and current state. */
export function enrichRows(rows: LeaveRow[], today: Date): EnrichedRow[] {
  return rows.map((r) => {
    const { start, end } = leaveWindow(r);
    return {
      ...r,
      start,
      end,
      ret: returnDate(end),
      lengthDays: parseLeaveDays(r),
      state: leaveState(start, end, today),
    };
  });
}

// --- Category (sidebar tab) --------------------------------------------------

export type ViewKey = "maternity" | "medical" | "lop" | "all";

export const VIEWS: { key: ViewKey; label: string; title: string; dot: string }[] = [
  { key: "maternity", label: "Maternity", title: "Maternity Leave", dot: "#e87ba4" },
  { key: "medical", label: "Medical >1wk", title: "Medical Leave (> 1 week)", dot: "#eda100" },
  { key: "lop", label: "Long leave / LOP", title: "Long Leave / LOP", dot: "#e34948" },
  { key: "all", label: "All leaves", title: "All Leaves", dot: "#2a78d6" },
];

export function inCategory(r: EnrichedRow, view: ViewKey): boolean {
  const t = r.leaveType.toUpperCase();
  switch (view) {
    case "maternity":
      return t === "ML";
    case "medical":
      return t === "SL" && r.lengthDays >= LONG_MEDICAL_MIN_DAYS;
    case "lop":
      return t === "LOP";
    case "all":
      return true;
  }
}

// --- Filtering ---------------------------------------------------------------

export interface DateRange {
  mode: string; // "fy:<startYear>" | "all" | "custom"
  customFrom: string; // yyyy-mm-dd
  customTo: string;
}

export interface Filters {
  search: string;
  leaveStatus: "" | LeaveState; // "" = all
  approval: string; // "" = all, else exact status
  leaveType: string; // "" = all (All-leaves page only)
  range: DateRange;
}

export function resolveRange(range: DateRange): { from: Date | null; to: Date | null } {
  if (range.mode === "all") return { from: null, to: null };
  if (range.mode === "custom") {
    return { from: parseDateLoose(range.customFrom), to: parseDateLoose(range.customTo) };
  }
  const m = range.mode.match(/^fy:(\d+)$/);
  if (m) {
    const { from, to } = fyRange(+m[1]);
    return { from, to };
  }
  return { from: null, to: null };
}

export function applyFilters(
  rows: EnrichedRow[],
  f: Filters,
  view: ViewKey,
): EnrichedRow[] {
  const q = f.search.trim().toLowerCase();
  const { from, to } = resolveRange(f.range);
  return rows.filter((r) => {
    if (!inCategory(r, view)) return false;
    if (view === "all" && f.leaveType && r.leaveType.toUpperCase() !== f.leaveType) {
      return false;
    }
    if (f.leaveStatus && r.state !== f.leaveStatus) return false;
    if (f.approval && r.status !== f.approval) return false;
    if ((from || to) && !withinRange(r.start, from, to)) return false;
    if (q) {
      const hay =
        `${r.employeeName} ${r.mediamintId} ${r.managerName} ${r.country} ${r.email}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Soonest/most-recent first: by start date descending, undated last. */
export function sortByStartDesc(rows: EnrichedRow[]): EnrichedRow[] {
  return [...rows].sort((a, b) => (b.start?.getTime() ?? -Infinity) - (a.start?.getTime() ?? -Infinity));
}

// --- Summaries ---------------------------------------------------------------

export interface ApprovalSummary {
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  total: number;
}

export function summarize(rows: LeaveRow[]): ApprovalSummary {
  let pending = 0,
    approved = 0,
    rejected = 0,
    withdrawn = 0;
  for (const r of rows) {
    const s = r.status.toLowerCase();
    if (s === "pending") pending++;
    else if (s === "approved") approved++;
    else if (s === "rejected") rejected++;
    else if (s === "withdrawn") withdrawn++;
  }
  return { pending, approved, rejected, withdrawn, total: rows.length };
}

export interface ActivitySummary {
  total: number;
  ongoing: number;
  upcoming: number;
  returningThisWeek: number;
}

export function activitySummary(rows: EnrichedRow[], today: Date): ActivitySummary {
  const wk = weekRange(today);
  let ongoing = 0,
    upcoming = 0,
    returning = 0;
  for (const r of rows) {
    if (r.state === "ongoing") ongoing++;
    else if (r.state === "upcoming") upcoming++;
    if (withinRange(r.end, wk.from, wk.to)) returning++;
  }
  return { total: rows.length, ongoing, upcoming, returningThisWeek: returning };
}

// --- Chart aggregations ------------------------------------------------------

export interface TypeSlice {
  code: string;
  label: string;
  color: string;
  value: number;
  pct: number;
}

export function leavesByType(rows: LeaveRow[], maxSlices = 8): TypeSlice[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const code = (r.leaveType || "—").toUpperCase();
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  const total = rows.length || 1;
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, maxSlices);
  const tail = sorted.slice(maxSlices);

  const slices: TypeSlice[] = head.map(([code, value]) => {
    const m = leaveTypeMeta(code);
    return { code, label: m.label, color: m.color, value, pct: value / total };
  });
  if (tail.length) {
    const value = tail.reduce((s, [, v]) => s + v, 0);
    slices.push({ code: "OTHER", label: "Other", color: OTHER_COLOR, value, pct: value / total });
  }
  return slices;
}

export interface CountryBucket {
  country: string;
  value: number;
}

export function leavesByCountry(rows: LeaveRow[]): CountryBucket[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = r.country?.trim() || "Unknown";
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value);
}

// --- Filter menu options -----------------------------------------------------

export function presentLeaveTypes(rows: LeaveRow[]): string[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const code = (r.leaveType || "").toUpperCase();
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

export function presentStatuses(rows: LeaveRow[]): string[] {
  const seen = new Set<string>();
  for (const r of rows) if (r.status) seen.add(r.status);
  return [...seen];
}

/** Financial years present in the data, newest first. */
export function availableFYs(rows: EnrichedRow[]): number[] {
  const set = new Set<number>();
  for (const r of rows) if (r.start) set.add(fyStartYear(r.start));
  return [...set].sort((a, b) => b - a);
}
