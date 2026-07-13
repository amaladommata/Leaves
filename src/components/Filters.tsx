import { leaveTypeMeta, type Filters as FilterState } from "../lib/transform";
import { fyLabel } from "../lib/dates";
import { MultiSelect } from "./MultiSelect";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  showLeaveType: boolean;
  leaveTypes: string[];
  statuses: string[];
  fyOptions: number[];
}

const LEAVE_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

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
          <MultiSelect
            placeholder="All leave types"
            options={leaveTypes.map((t) => ({ value: t, label: leaveTypeMeta(t).label }))}
            selected={filters.leaveType}
            onChange={(v) => set({ leaveType: v })}
          />
        )}

        <MultiSelect
          placeholder="All leave statuses"
          options={LEAVE_STATUS_OPTIONS}
          selected={filters.leaveStatus}
          onChange={(v) => set({ leaveStatus: v as FilterState["leaveStatus"] })}
        />

        <MultiSelect
          placeholder="All approvals"
          options={statuses.map((s) => ({ value: s, label: s }))}
          selected={filters.approval}
          onChange={(v) => set({ approval: v })}
        />

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
