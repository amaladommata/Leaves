import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { TypeSlice } from "../lib/transform";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function LeaveTypePie({ slices }: { slices: TypeSlice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);

  if (!total) {
    return <div className="empty">No leaves match the current filters.</div>;
  }

  return (
    <div className="pie-wrap">
      <ul className="pie-legend">
        {slices.map((s) => (
          <li key={s.code}>
            <span className="swatch" style={{ background: s.color }} />
            <span className="pie-legend-label">{s.label}</span>
            <span className="pie-legend-val">
              {s.value.toLocaleString()} <span className="muted">({pct(s.pct)})</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="pie-canvas">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={92}
              paddingAngle={2}
              stroke="var(--surface-1)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s) => (
                <Cell key={s.code} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as TypeSlice;
                return (
                  <div className="chart-tip">
                    <span className="swatch" style={{ background: d.color }} />
                    <strong>{d.label}</strong>
                    <span className="muted">
                      {d.value.toLocaleString()} · {pct(d.pct)}
                    </span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
