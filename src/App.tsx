import { useMemo, useState } from "react";
import { useLeaveData } from "./lib/useLeaveData";
import {
  enrichRows,
  applyFilters,
  sortByStartDesc,
  summarize,
  activitySummary,
  leavesByType,
  leavesByCountry,
  presentLeaveTypes,
  presentStatuses,
  availableFYs,
  VIEWS,
  type ViewKey,
  type Filters as FilterState,
} from "./lib/transform";
import { startOfDay, fyStartYear } from "./lib/dates";
import { Sidebar } from "./components/Sidebar";
import { Filters } from "./components/Filters";
import { StatCards, type StatCard } from "./components/StatCards";
import { DetailTable } from "./components/DetailTable";
import { LeaveTypePie } from "./components/LeaveTypePie";
import { CountryBar } from "./components/CountryBar";

export default function App() {
  const { rows, loading, error, lastUpdated, usingSample, refresh } = useLeaveData();

  const today = useMemo(() => startOfDay(new Date()), []);
  const currentFY = fyStartYear(today);

  const [view, setView] = useState<ViewKey>("all");

  // Each page keeps its own independent filter selection.
  const makeDefault = (): FilterState => ({
    search: "",
    leaveStatus: [],
    approval: [],
    leaveType: [],
    range: { mode: `fy:${currentFY}`, customFrom: "", customTo: "" },
  });
  const [filtersByView, setFiltersByView] = useState<Record<ViewKey, FilterState>>(() => ({
    maternity: makeDefault(),
    medical: makeDefault(),
    lop: makeDefault(),
    all: makeDefault(),
  }));
  const filters = filtersByView[view];
  const setFilters = (next: FilterState) =>
    setFiltersByView((prev) => ({ ...prev, [view]: next }));

  const enriched = useMemo(() => enrichRows(rows, today), [rows, today]);
  const filtered = useMemo(() => applyFilters(enriched, filters, view), [enriched, filters, view]);
  const tableRows = useMemo(() => sortByStartDesc(filtered), [filtered]);

  const fyOptions = useMemo(() => {
    const set = new Set(availableFYs(enriched));
    set.add(currentFY);
    return [...set].sort((a, b) => b - a);
  }, [enriched, currentFY]);
  const leaveTypes = useMemo(() => presentLeaveTypes(enriched), [enriched]);
  const statuses = useMemo(() => presentStatuses(enriched), [enriched]);

  // Page-specific derived data
  const approval = useMemo(() => summarize(filtered), [filtered]);
  const activity = useMemo(() => activitySummary(filtered, today), [filtered, today]);
  const slices = useMemo(() => leavesByType(filtered), [filtered]);
  const countries = useMemo(() => leavesByCountry(filtered), [filtered]);

  const meta = VIEWS.find((v) => v.key === view)!;
  const isAll = view === "all";

  const cards: StatCard[] = isAll
    ? [
        { label: "New requests", value: approval.pending, tone: "blue" },
        { label: "Approved", value: approval.approved, tone: "good" },
        { label: "Rejected", value: approval.rejected, tone: "crit" },
        { label: "Withdrawn", value: approval.withdrawn, tone: "wdrw" },
        { label: "Total leaves", value: approval.total, tone: "neutral" },
      ]
    : [
        { label: "Total leaves", value: activity.total, tone: "neutral" },
        { label: "Ongoing", value: activity.ongoing, tone: "warn", dot: "#e69a00" },
        { label: "Upcoming", value: activity.upcoming, tone: "blue", dot: "#2a78d6" },
        { label: "Returning this week", value: activity.returningThisWeek, tone: "good", dot: "#0ca30c" },
      ];

  return (
    <div className="shell">
      <Sidebar view={view} onSelect={setView} />

      <main className="main">
        <header className="head">
          <div className="head-l">
            <span className="head-mark" aria-hidden />
            <div>
              <h1>{meta.title}</h1>
            </div>
          </div>
          <div className="head-r">
            {lastUpdated && (
              <span className="updated">
                Updated{" "}
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button className="btn" onClick={refresh} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="banner error">
            <strong>Couldn’t load the sheet.</strong> {error}
          </div>
        )}
        {usingSample && !error && (
          <div className="banner info">
            No Google Sheet connected yet. Set <code>VITE_SHEET_API_URL</code> to display your
            live data — see the README for the Apps Script setup.
          </div>
        )}

        <Filters
          filters={filters}
          onChange={setFilters}
          showLeaveType={isAll}
          leaveTypes={leaveTypes}
          statuses={statuses}
          fyOptions={fyOptions}
        />

        <StatCards cards={cards} />

        {isAll && (
          <div className="chart-row">
            <div className="panel">
              <h2 className="panel-title">Leaves by type</h2>
              <LeaveTypePie slices={slices} />
            </div>
            <div className="panel">
              <h2 className="panel-title">Leaves by country</h2>
              <CountryBar data={countries} />
            </div>
          </div>
        )}

        <div className="panel">
          <h2 className="panel-title">{meta.title} — employee detail</h2>
          <DetailTable rows={tableRows} showType={isAll} />
        </div>

        <footer className="footer">
          {filtered.length.toLocaleString()} {isAll ? "leaves" : "cases"} shown
        </footer>
      </main>
    </div>
  );
}
