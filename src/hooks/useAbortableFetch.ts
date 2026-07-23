'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useAbortableFetch() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWithAbort = useCallback(
    async (url: string, options?: RequestInit) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        return response;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return null;
        }
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return fetchWithAbort;
}
