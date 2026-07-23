'use client';

import { useState, useCallback } from 'react';

interface OptimisticMutationOptions<T, R> {
  mutationFn: (data: T) => Promise<R>;
  onOptimisticUpdate: (data: T) => void;
  onSuccess?: (result: R) => void;
  onError?: (error: Error, originalData: T) => void;
  rollback: () => void;
}

export function useOptimisticMutation<T, R>({
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
  rollback,
}: OptimisticMutationOptions<T, R>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: T) => {
      setIsPending(true);
      setError(null);

      onOptimisticUpdate(data);

      try {
        const result = await mutationFn(data);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error('Unknown error');
        setError(errorObject);
        onError?.(errorObject, data);
        rollback();
        throw errorObject;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, onOptimisticUpdate, onSuccess, onError, rollback]
  );

  return { mutate, isPending, error };
}
