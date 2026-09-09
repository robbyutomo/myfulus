"use client";

import { useState, useEffect, useCallback } from "react";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 detik

export function useCachedFetch<T>(url: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Cek cache
    const cached = cache.get(url);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data as T);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat data");
      const result = await res.json();
      
      // Simpan ke cache
      cache.set(url, { data: result, timestamp: Date.now() });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    cache.delete(url);
    fetchData(true);
  }, [url, fetchData]);

  return { data, loading, error, refresh };
}
