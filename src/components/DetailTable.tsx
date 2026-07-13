import { useEffect, useState } from "react";
import { statusMeta, stateMeta, leaveTypeMeta, type EnrichedRow } from "../lib/transform";
import { formatDate } from "../lib/dates";

const PAGE = 50;

function StatusPill({ status }: { status: string }) {
  const m = statusMeta(status);
  return <span className={`pill p-${m.cls}`}>{m.label}</span>;
}

function StateChip({ state }: { state: EnrichedRow["state"] }) {
  const m = stateMeta(state);
  return (
    <span className={`chip ch-${m.cls}`}>
      <span className="dot" />
      {m.label}
    </span>
  );
}

/** Flat leave table. `showType` adds a Leave-type column (used on All leaves). */
export function DetailTable({
  rows,
  showType = false,
}: {
  rows: EnrichedRow[];
  showType?: boolean;
}) {
  const [limit, setLimit] = useState(PAGE);
  // Reset paging whenever the filtered set changes size.
  useEffect(() => setLimit(PAGE), [rows]);

  if (!rows.length) {
    return <div className="empty">No leaves match the current filters.</div>;
  }
  const shown = rows.slice(0, limit);

  return (
    <>
      <div className="table-scroll">
        <table className="leave-table">
          <thead>
            <tr>
              <th>MM ID</th>
              <th>Employee</th>
              {showType && <th>Leave type</th>}
              <th>Country</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Return date</th>
              <th>Leave status</th>
              <th>Approval status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={`${r.mediamintId}-${i}`}>
                <td className="mono">{r.mediamintId || "—"}</td>
                <td className="nm">{r.employeeName || "—"}</td>
                {showType && <td>{leaveTypeMeta(r.leaveType).label}</td>}
                <td>{r.country || "—"}</td>
                <td>{formatDate(r.start)}</td>
                <td>{formatDate(r.end)}</td>
                <td>{formatDate(r.ret)}</td>
                <td>
                  <StateChip state={r.state} />
                </td>
                <td>
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button className="link-btn" onClick={() => setLimit((l) => l + PAGE)}>
          Show more ({(rows.length - limit).toLocaleString()} remaining)
        </button>
      )}
    </>
  );
}
