import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { combineBoopOptions, mergeBoopOptions } from "../boop/options";
import { ensureConsoleCapture } from "../boop/stack";
import { submitBoopFeedback } from "../boop/submit";
import type { BoopFieldName, BoopFieldValues, BoopOptions, BoopSubmitPayload } from "../boop/types";

export type BoopContextValue = {
  options: BoopOptions;
  setOptions: React.Dispatch<React.SetStateAction<BoopOptions>>;
  updateOptions: (updates: BoopOptions) => void;
  resetOptions: () => void;
  submitFeedback: (payload: BoopSubmitPayload, overrides?: BoopOptions) => Promise<Response>;
  setFieldValue: (field: BoopFieldName, value: string) => void;
  setFieldValues: (values: BoopFieldValues) => void;
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
        urlResolver: resolved.urlResolver,
        includeStackTrace: resolved.includeStackTrace
      });
    },
    [options]
  );

  const setFieldValue = useCallback(
    (field: BoopFieldName, value: string) => {
      setOptions((current) => ({
        ...current,
        fieldValues: { ...(current.fieldValues ?? {}), [field]: value }
      }));
    },
    []
  );

  const setFieldValues = useCallback((values: BoopFieldValues) => {
    setOptions((current) => ({
      ...current,
      fieldValues: { ...(current.fieldValues ?? {}), ...values }
    }));
  }, []);

  useEffect(() => {
    if (options.includeStackTrace) {
      ensureConsoleCapture();
    }
  }, [options.includeStackTrace]);

  const value = useMemo(
    () => ({
      options,
      setOptions,
      updateOptions,
      resetOptions,
      submitFeedback,
      setFieldValue,
      setFieldValues
    }),
    [options, setOptions, resetOptions, submitFeedback, updateOptions, setFieldValue, setFieldValues]
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