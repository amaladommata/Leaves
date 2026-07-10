import { useCallback, useEffect, useRef, useState } from "react";
import type { LeaveRow } from "./types";
import { loadLeaveRows } from "./sheet";
import { REFRESH_INTERVAL_MS, hasSheet } from "./config";

interface State {
  rows: LeaveRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  usingSample: boolean;
}

/**
 * Loads leave rows and keeps them fresh: re-polls on an interval and whenever
 * the tab regains focus, so edits made in the Google Sheet appear on their own.
 */
export function useLeaveData() {
  const [state, setState] = useState<State>({
    rows: [],
    loading: true,
    error: null,
    lastUpdated: null,
    usingSample: !hasSheet,
  });
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState((s) => ({ ...s, loading: true }));
    try {
      const rows = await loadLeaveRows();
      setState({
        rows,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        usingSample: !hasSheet,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!hasSheet) return; // sample data never changes, no need to poll

    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { ...state, refresh };
}
