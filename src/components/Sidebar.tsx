import { VIEWS, type ViewKey } from "../lib/transform";

interface Props {
  view: ViewKey;
  onSelect: (v: ViewKey) => void;
}

export function Sidebar({ view, onSelect }: Props) {
  return (
    <aside className="side">
      <div className="side-brand">
        <span className="side-mark" aria-hidden />
        <b>Leave Overview</b>
      </div>
      <div className="side-label">Leave category</div>
      <nav>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={`nav-item${v.key === view ? " active" : ""}`}
            onClick={() => onSelect(v.key)}
          >
            <span className="nav-dot" style={{ background: v.dot }} />
            {v.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
