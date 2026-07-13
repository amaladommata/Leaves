import { leaveTypeMeta, type Filters as FilterState } from "../lib/transform";
import { fyLabel } from "../lib/dates";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  showLeaveType: boolean;
  leaveTypes: string[];
  statuses: string[];
  fyOptions: number[];
}

export function Filters({
  filters,
  onChange,
  showLeaveType,
  leaveTypes,
  statuses,
  fyOptions,
}: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const setRange = (patch: Partial<FilterState["range"]>) =>
    onChange({ ...filters, range: { ...filters.range, ...patch } });

  return (
    <div className="filters">
      <div className="filter-row">
        <input
          className="field search"
          type="search"
          placeholder="Search name, ID, manager or country…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />

        {showLeaveType && (
          <select
            className="field"
            value={filters.leaveType}
            onChange={(e) => set({ leaveType: e.target.value })}
          >
            <option value="">All leave types</option>
            {leaveTypes.map((t) => (
              <option key={t} value={t}>
                {leaveTypeMeta(t).label}
              </option>
            ))}
          </select>
        )}

        <select
          className="field"
          value={filters.leaveStatus}
          onChange={(e) => set({ leaveStatus: e.target.value as FilterState["leaveStatus"] })}
        >
          <option value="">All leave statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="field"
          value={filters.approval}
          onChange={(e) => set({ approval: e.target.value })}
        >
          <option value="">All approvals</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="field"
          value={filters.range.mode}
          onChange={(e) => setRange({ mode: e.target.value })}
        >
          {fyOptions.map((y) => (
            <option key={y} value={`fy:${y}`}>
              {fyLabel(y)}
            </option>
          ))}
          <option value="all">All time</option>
          <option value="custom">Custom range…</option>
        </select>
      </div>

      {filters.range.mode === "custom" && (
        <div className="filter-row custom-range">
          <label className="daterange">
            From
            <input
              type="date"
              value={filters.range.customFrom}
              onChange={(e) => setRange({ customFrom: e.target.value })}
            />
          </label>
          <label className="daterange">
            To
            <input
              type="date"
              value={filters.range.customTo}
              onChange={(e) => setRange({ customTo: e.target.value })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
