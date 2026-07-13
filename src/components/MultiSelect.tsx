import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  placeholder: string; // shown when nothing is selected ("All leave statuses")
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** A dropdown of checkboxes so several conditions can be active at once. */
export function MultiSelect({ placeholder, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? "1 selected")
        : `${selected.length} selected`;

  return (
    <div className="ms" ref={ref}>
      <button
        type="button"
        className="field ms-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected.length ? "" : "ms-ph"}>{summary}</span>
        <span className="chev" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="ms-pop" role="listbox">
          {selected.length > 0 && (
            <button type="button" className="ms-clear" onClick={() => onChange([])}>
              Clear selection
            </button>
          )}
          {options.map((o) => (
            <label className="ms-opt" key={o.value}>
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => toggle(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
