import type { LeaveRow } from "./types";

// --- Leave-type metadata -----------------------------------------------------
// Color follows the entity (a fixed hue per leave type), never its rank, so a
// filter that changes which types are visible never repaints the survivors.
// Hues are the validated dark-mode categorical slots from the design system.

export interface LeaveTypeMeta {
  code: string;
  label: string;
  color: string;
}

const OTHER_COLOR = "#898781"; // muted – used for the folded "Other" bucket

const LEAVE_TYPES: Record<string, LeaveTypeMeta> = {
  PTO: { code: "PTO", label: "Paid Time Off", color: "#3987e5" }, // blue
  OT: { code: "OT", label: "Overtime", color: "#199e70" }, // aqua
  SL: { code: "SL", label: "Sick Leave", color: "#c98500" }, // yellow
  CL: { code: "CL", label: "Casual Leave", color: "#008300" }, // green
  RH: { code: "RH", label: "Restricted Holiday", color: "#9085e9" }, // violet
  LOP: { code: "LOP", label: "Loss of Pay", color: "#e66767" }, // red
  ML: { code: "ML", label: "Maternity Leave", color: "#d55181" }, // magenta
  PL: { code: "PL", label: "Paternity Leave", color: "#d95926" }, // orange
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

// --- Status metadata (reserved status palette, never themed) -----------------

export interface StatusMeta {
  label: string;
  color: string;
}

export function statusMeta(status: string): StatusMeta {
  const s = status.toLowerCase();
  if (s === "approved") return { label: "Approved", color: "#0ca30c" };
  if (s === "pending") return { label: "Pending", color: "#fab219" };
  if (s === "rejected") return { label: "Rejected", color: "#d03b3b" };
  if (s.startsWith("withdraw")) return { label: status, color: "#ec835a" };
  return { label: status || "—", color: OTHER_COLOR };
}

// --- Aggregations ------------------------------------------------------------

export interface Summary {
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  total: number;
}

export function summarize(rows: LeaveRow[]): Summary {
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let withdrawn = 0;
  for (const r of rows) {
    const s = r.status.toLowerCase();
    if (s === "pending") pending++;
    else if (s === "approved") approved++;
    else if (s === "rejected") rejected++;
    else if (s === "withdrawn") withdrawn++;
  }
  return { pending, approved, rejected, withdrawn, total: rows.length };
}

export interface TypeSlice {
  code: string;
  label: string;
  color: string;
  value: number;
  pct: number;
}

/** Counts per leave type, largest first, folding the long tail into "Other". */
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
    slices.push({
      code: "OTHER",
      label: "Other",
      color: OTHER_COLOR,
      value,
      pct: value / total,
    });
  }
  return slices;
}

export interface MonthBucket {
  key: string; // YYYY-MM
  label: string; // "Jul 25"
  value: number;
}

function parseAppliedMonth(applied: string): string | null {
  if (!applied) return null;
  const m = applied.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(applied);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return null;
}

/** Applications per month for the trailing `months` window. */
export function leavesByMonth(rows: LeaveRow[], months = 12): MonthBucket[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = parseAppliedMonth(r.appliedOn);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = [...counts.keys()].sort();
  const window = keys.slice(-months);
  return window.map((key) => {
    const [y, mo] = key.split("-");
    const date = new Date(Number(y), Number(mo) - 1, 1);
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return { key, label, value: counts.get(key) ?? 0 };
  });
}

export interface CountryBucket {
  country: string;
  value: number;
}

/** Leave counts per country, largest first (drives the country bar chart). */
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

/** Distinct leave-type codes present, most common first (for the filter menu). */
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

export function presentCountries(rows: LeaveRow[]): string[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = r.country?.trim();
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

// --- Filtering ---------------------------------------------------------------

export interface Filters {
  leaveType: string; // "" = all
  status: string; // "" = all
  country: string; // "" = all
  search: string;
}

export function applyFilters(rows: LeaveRow[], f: Filters): LeaveRow[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.leaveType && r.leaveType.toUpperCase() !== f.leaveType) return false;
    if (f.status && r.status !== f.status) return false;
    if (f.country && r.country !== f.country) return false;
    if (q) {
      const hay = `${r.employeeName} ${r.mediamintId} ${r.managerName} ${r.email}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Sort by most-recently applied first; blank/unknown dates sink to the bottom. */
export function sortByAppliedDesc(rows: LeaveRow[]): LeaveRow[] {
  return [...rows].sort((a, b) => {
    const ta = Date.parse(a.appliedOn) || 0;
    const tb = Date.parse(b.appliedOn) || 0;
    return tb - ta;
  });
}
