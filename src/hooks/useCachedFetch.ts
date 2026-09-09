"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCachedFetch<T>(url: string, options?: { revalidateOnFocus?: boolean }) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 60 detik dedup
    focusThrottleInterval: 30000,
    ...options,
  });

  return {
    data,
    loading: isLoading,
    error,
    refresh: () => mutate(),
  };
}
