import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface Result<T> {
  key: string | null;
  data: T | null;
  error: unknown;
}

/**
 * Minimal data fetching: refetches when `deps` change, cancels superseded requests (no stale responses), keeps
 * the previous data visible while a new request runs. State is only set from request callbacks, never
 * synchronously inside the effect.
 */
export function useQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList, enabled = true) {
  const [version, setVersion] = useState(0);
  const key = enabled ? JSON.stringify([...deps, version]) : null;
  const [result, setResult] = useState<Result<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: null });
      },
      (error) => {
        if (!controller.signal.aborted) setResult((r) => ({ key, data: r.data, error }));
      },
    );
    return () => controller.abort();
    // `fetcher` is a new closure every render; `key` captures everything it depends on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((update: (prev: T | null) => T | null) => setResult((r) => ({ ...r, data: update(r.data) })), []);

  return {
    data: key === null ? null : result.data,
    error: key !== null && result.key === key ? result.error : null,
    loading: key !== null && result.key !== key,
    refetch,
    setData,
  };
}

/** Typing updates the value after a short pause. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
