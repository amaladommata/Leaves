import type { Filters as FilterState } from "../lib/transform";
import { leaveTypeMeta } from "../lib/transform";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  leaveTypes: string[];
  statuses: string[];
}

export function Filters({ filters, onChange, leaveTypes, statuses }: Props) {
  return (
    <div className="filters">
      <input
        className="search"
        type="search"
        placeholder="Search name, ID or manager…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <select
        value={filters.leaveType}
        onChange={(e) => onChange({ ...filters, leaveType: e.target.value })}
      >
        <option value="">All leave types</option>
        {leaveTypes.map((t) => (
          <option key={t} value={t}>
            {leaveTypeMeta(t).label}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
