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
import type { CountryBucket } from "../lib/transform";

// Single-series magnitude across countries → one hue (blue), no legend needed.
const BAR = "#2a78d6";
const BAR_HOVER = "#1c5cab";

export function CountryBar({ data }: { data: CountryBucket[] }) {
  if (!data.length) {
    return <div className="empty">No leaves match the current filters.</div>;
  }
  // A single country reads better as a narrow bar than one stretched across.
  const barSize = data.length === 1 ? 64 : undefined;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--gridline)" />
        <XAxis
          dataKey="country"
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
                  {Number(payload[0].value).toLocaleString()} leaves
                </span>
              </div>
            );
          }}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          barSize={barSize}
          isAnimationActive={false}
          activeBar={{ fill: BAR_HOVER }}
        >
          {data.map((d) => (
            <Cell key={d.country} fill={BAR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
