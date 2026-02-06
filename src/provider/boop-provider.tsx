import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { combineBoopOptions, mergeBoopOptions } from "../boop/options";
import { submitBoopFeedback } from "../boop/submit";
import type { BoopOptions, BoopSubmitPayload } from "../boop/types";

export type BoopContextValue = {
  options: BoopOptions;
  setOptions: React.Dispatch<React.SetStateAction<BoopOptions>>;
  updateOptions: (updates: BoopOptions) => void;
  resetOptions: () => void;
  submitFeedback: (payload: BoopSubmitPayload, overrides?: BoopOptions) => Promise<Response>;
};

export const BoopContext = createContext<BoopContextValue | undefined>(undefined);

type BoopProviderProps = {
  children: React.ReactNode;
  defaultOptions?: BoopOptions;
};

export const BoopProvider = ({ children, defaultOptions }: BoopProviderProps) => {
  const [options, setOptions] = useState<BoopOptions>(defaultOptions ?? {});

  const updateOptions = useCallback((updates: BoopOptions) => {
    setOptions((current) => combineBoopOptions(current, updates));
  }, []);

  const resetOptions = useCallback(() => {
    setOptions(defaultOptions ?? {});
  }, [defaultOptions]);

  const submitFeedback = useCallback(
    async (payload: BoopSubmitPayload, overrides?: BoopOptions) => {
      const combined = combineBoopOptions(options, overrides);
      const resolved = mergeBoopOptions(combined);
      return submitBoopFeedback({
        endpoint: resolved.endpoint,
        callbacks: resolved.callbacks,
        metadata: resolved.metadata,
        payload,
        urlResolver: resolved.urlResolver
      });
    },
    [options]
  );

  const value = useMemo(
    () => ({
      options,
      setOptions,
      updateOptions,
      resetOptions,
      submitFeedback
    }),
    [options, setOptions, resetOptions, submitFeedback, updateOptions]
  );

  return <BoopContext.Provider value={value}>{children}</BoopContext.Provider>;
};

export const useBoop = () => {
  const context = useContext(BoopContext);
  if (!context) {
    throw new Error("useBoop must be used within a BoopProvider.");
  }
  return context;
};