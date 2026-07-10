import { useMemo, useState } from "react";
import { useLeaveData } from "./lib/useLeaveData";
import {
  applyFilters,
  leavesByType,
  leavesByCountry,
  summarize,
  presentLeaveTypes,
  presentStatuses,
  presentCountries,
  type Filters as FilterState,
} from "./lib/transform";
import { StatCards } from "./components/StatCards";
import { LeaveTypePie } from "./components/LeaveTypePie";
import { CountryBar } from "./components/CountryBar";
import { Filters } from "./components/Filters";
import { LeaveTable } from "./components/LeaveTable";

const EMPTY_FILTERS: FilterState = {
  leaveType: "",
  status: "",
  country: "",
  search: "",
};

export default function App() {
  const { rows, loading, error, lastUpdated, usingSample, refresh } = useLeaveData();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const summary = useMemo(() => summarize(filtered), [filtered]);
  const slices = useMemo(() => leavesByType(filtered), [filtered]);
  const countries = useMemo(() => leavesByCountry(filtered), [filtered]);
  const leaveTypes = useMemo(() => presentLeaveTypes(rows), [rows]);
  const statuses = useMemo(() => presentStatuses(rows), [rows]);
  const countryOptions = useMemo(() => presentCountries(rows), [rows]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <h1>Leave Tracker</h1>
            <p className="subtitle">
              {usingSample
                ? "Showing demo data — connect a Google Sheet to go live"
                : "Live from Google Sheets · updates automatically"}
            </p>
          </div>
        </div>
        <div className="topbar-right">
          {lastUpdated && (
            <span className="updated">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button className="refresh-btn" onClick={refresh} disabled={loading}>
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
          No Google Sheet connected yet. Set <code>VITE_SHEET_ID</code> to display your live
          data — see the README for the 2-minute setup.
        </div>
      )}

      <Filters
        filters={filters}
        onChange={setFilters}
        leaveTypes={leaveTypes}
        statuses={statuses}
        countries={countryOptions}
      />

      <StatCards summary={summary} />

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

      <div className="panel">
        <h2 className="panel-title">Leave records</h2>
        <LeaveTable rows={filtered} />
      </div>

      <footer className="footer">
        {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} records shown
      </footer>
    </div>
  );
}
