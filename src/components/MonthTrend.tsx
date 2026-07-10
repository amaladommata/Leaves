import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { MonthBucket } from "../lib/transform";

// Single-series magnitude over time → one hue (blue), no legend needed.
const BAR = "#3987e5";
const BAR_HOVER = "#5598e7";

export function MonthTrend({ data }: { data: MonthBucket[] }) {
  if (!data.length) {
    return <div className="empty">No dated applications to chart.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="chart-tip">
                <strong>{label}</strong>
                <span className="muted">
                  {Number(payload[0].value).toLocaleString()} applications
                </span>
              </div>
            );
          }}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
          activeBar={{ fill: BAR_HOVER }}
        >
          {data.map((d) => (
            <Cell key={d.key} fill={BAR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
