import { useState } from "react";
import { statusMeta, type DetailGroup } from "../lib/transform";

const GROUP_LIMIT = 8; // rows shown per group before "show all"

function StatusPill({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span className="pill" style={{ ["--pill" as string]: m.color }}>
      {m.label}
    </span>
  );
}

function Group({ group }: { group: DetailGroup }) {
  const [expanded, setExpanded] = useState(false);
  const { rows } = group;
  const shown = expanded ? rows : rows.slice(0, GROUP_LIMIT);

  return (
    <section className="leave-group">
      <header className="leave-group-head">
        <span className="swatch" style={{ background: group.color }} />
        <h3>{group.label}</h3>
        <span className="count-badge">{rows.length}</span>
      </header>
      <div className="table-scroll">
        <table className="leave-table">
          <thead>
            <tr>
              <th>MM ID</th>
              <th>Employee</th>
              <th>Manager</th>
              <th>Applied on</th>
              <th>Leave dates</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={`${r.mediamintId}-${i}`}>
                <td className="mono">{r.mediamintId || "—"}</td>
                <td>{r.employeeName || "—"}</td>
                <td className="muted">{r.managerName || "—"}</td>
                <td className="muted">{r.appliedOn?.slice(0, 10) || "—"}</td>
                <td>{r.leaveDates || "—"}</td>
                <td>{r.daysHours || "—"}</td>
                <td>
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > GROUP_LIMIT && (
        <button className="link-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show all ${rows.length}`}
        </button>
      )}
    </section>
  );
}

export function LeaveTable({ groups }: { groups: DetailGroup[] }) {
  const nonEmpty = groups.filter((g) => g.rows.length > 0);

  if (!nonEmpty.length) {
    return (
      <div className="empty">
        No maternity, long medical, or loss-of-pay cases match the current filters.
      </div>
    );
  }

  return (
    <div className="leave-groups">
      {nonEmpty.map((g) => (
        <Group key={g.key} group={g} />
      ))}
    </div>
  );
}
