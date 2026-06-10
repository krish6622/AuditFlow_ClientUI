import { useEffect, useState } from "react";

import { ApiError, dashboardApi } from "@/lib/api";
import type { DashboardSummary } from "@/types/dashboard";

interface State {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

/** Loads the dashboard summary once on mount. */
export function useDashboard(): State & { reload: () => void } {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    dashboardApi
      .summary()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active)
          setState({
            data: null,
            loading: false,
            error: err instanceof ApiError ? err.message : "Failed to load dashboard",
          });
      });
    return () => {
      active = false;
    };
  }, [nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
