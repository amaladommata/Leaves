import type { Summary } from "../lib/transform";

interface Card {
  key: keyof Summary;
  label: string;
  accent: string;
}

const CARDS: Card[] = [
  { key: "pending", label: "New requests", accent: "#3987e5" },
  { key: "approved", label: "Approved", accent: "#0ca30c" },
  { key: "rejected", label: "Rejected", accent: "#d03b3b" },
  { key: "total", label: "Total leaves", accent: "#c3c2b7" },
];

export function StatCards({ summary }: { summary: Summary }) {
  return (
    <div className="stat-grid">
      {CARDS.map((c) => (
        <div className="stat-card" key={c.key} style={{ ["--accent" as string]: c.accent }}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{summary[c.key].toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
