import { useMemo, useState } from "react";
import type { LeaveRow } from "../lib/types";
import { leaveTypeMeta, statusMeta, sortByAppliedDesc } from "../lib/transform";

const GROUP_LIMIT = 8; // rows shown per group before "show all"

function StatusPill({ status }: { status: string }) {
  const m = statusMeta(status);
  return (
    <span className="pill" style={{ ["--pill" as string]: m.color }}>
      {m.label}
    </span>
  );
}

function Group({ code, rows }: { code: string; rows: LeaveRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const meta = leaveTypeMeta(code);
  const shown = expanded ? rows : rows.slice(0, GROUP_LIMIT);

  return (
    <section className="leave-group">
      <header className="leave-group-head">
        <span className="swatch" style={{ background: meta.color }} />
        <h3>{meta.label}</h3>
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

export function LeaveTable({ rows }: { rows: LeaveRow[] }) {
  const groups = useMemo(() => {
    const byType = new Map<string, LeaveRow[]>();
    for (const r of rows) {
      const code = (r.leaveType || "—").toUpperCase();
      const arr = byType.get(code) ?? [];
      arr.push(r);
      byType.set(code, arr);
    }
    return [...byType.entries()]
      .map(([code, list]) => ({ code, list: sortByAppliedDesc(list) }))
      .sort((a, b) => b.list.length - a.list.length);
  }, [rows]);

  if (!rows.length) {
    return <div className="empty">No leave records match the current filters.</div>;
  }

  return (
    <div className="leave-groups">
      {groups.map((g) => (
        <Group key={g.code} code={g.code} rows={g.list} />
      ))}
    </div>
  );
}
