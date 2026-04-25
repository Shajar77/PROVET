"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Hash } from "viem";

interface TransactionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  hash: Hash | null;
}

interface UseTransactionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (hash: Hash) => void;
  onError?: (error: string) => void;
}

export function useTransaction(options: UseTransactionOptions = {}) {
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    hash: null,
  });

  const execute = useCallback(
    async (transactionFn: () => Promise<{ success: boolean; hash?: Hash; error?: string }>) => {
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        hash: null,
      });

      try {
        const result = await transactionFn();

        if (result.success && result.hash) {
          setState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null,
            hash: result.hash,
          });

          toast.success(
            options.successMessage || `Transaction successful! Hash: ${result.hash.slice(0, 10)}...`
          );

          options.onSuccess?.(result.hash);
          return result;
        } else {
          throw new Error(result.error || "Transaction failed");
        }
      } catch (error: unknown) {
        const errorMessage =
          (error instanceof Error ? error.message : undefined) ||
          options.errorMessage ||
          "Transaction failed";

        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: errorMessage,
          hash: null,
        });

        toast.error(errorMessage);
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      hash: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
