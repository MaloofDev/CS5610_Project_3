import { useEffect, useState } from "react";
import { apiGet } from "./api.js";

/**
 * Fetches a path and refetches when it changes. Pass null to skip.
 * Keeps the previous data while the next request loads.
 */
export default function useApiGet(path) {
  const [result, setResult] = useState({ path: null });

  useEffect(() => {
    if (!path) return;
    let active = true;
    apiGet(path)
      .then((data) => active && setResult({ path, data }))
      .catch((error) => active && setResult({ path, error }));
    return () => {
      active = false;
    };
  }, [path]);

  const loading = Boolean(path) && result.path !== path;
  return {
    data: result.data ?? null,
    error: loading ? null : (result.error ?? null),
    loading,
  };
}
