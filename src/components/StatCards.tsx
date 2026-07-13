export interface StatCard {
  label: string;
  value: number;
  tone: string; // css class suffix: neutral | good | warn | blue | crit | wdrw
  dot?: string; // optional colored dot before the label
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className={`stat-grid cards-${cards.length}`}>
      {cards.map((c) => (
        <div className={`stat-card tone-${c.tone}`} key={c.label}>
          <div className="stat-label">
            {c.dot && <span className="dot" style={{ background: c.dot }} />}
            {c.label}
          </div>
          <div className="stat-value">{c.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
