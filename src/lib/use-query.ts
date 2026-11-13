import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface QueryState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
}

export function useQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList, enabled = true) {
  const [state, setState] = useState<QueryState<T>>({ data: null, error: null, loading: enabled });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, error: null, loading: true }));
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      },
      (error) => {
        if (!controller.signal.aborted) setState((s) => ({ ...s, error, loading: false }));
      },
    );
    return () => controller.abort(); // a newer request supersedes this one: no stale responses
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, refetch };
}