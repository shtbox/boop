import { DEFAULT_ENDPOINT } from "./constants";
import type {
  BoopBehaviorOptions,
  BoopCallbacks,
  BoopLabels,
  BoopOptions,
  BoopPlaceholders,
  BoopStyleOptions,
  BoopVariantOptions,
  BoopSlots,
  BoopPanelVariant
} from "./types";

export type ResolvedBoopOptions = {
  endpoint: string;
  darkMode: boolean;
  mode: BoopPanelVariant;
  widgetOptions: BoopVariantOptions;
  sidebarOptions: BoopVariantOptions;
  behavior: BoopBehaviorOptions;
  callbacks: BoopCallbacks;
  style: BoopStyleOptions;
  metadata?: Record<string, unknown>;
  slots: BoopSlots;
};

const defaultLabels: BoopLabels = {
  name: "Name",
  email: "Email",
  message: "Message",
  submit: "Send feedback",
  close: "Close feedback"
};

const defaultPlaceholders: BoopPlaceholders = {
  name: "Your name",
  email: "you@example.com",
  message: "What would you like to share?"
};

const createDefaultVariantOptions = (): BoopVariantOptions => ({
  title: "Send feedback",
  labels: { ...defaultLabels },
  placeholders: { ...defaultPlaceholders },
  buttonLabel: "Feedback",
  buttonPlacement: "inline",
  successMessage: "Thanks for the feedback!",
  errorMessage: "Unable to submit feedback."
});

const defaultBehaviorOptions: BoopBehaviorOptions = {
  autoOpen: false,
  closeOnSubmit: false
};

const defaultStyleOptions: BoopStyleOptions = {
  useDefaultStyles: true
};

export const defaultBoopOptions: ResolvedBoopOptions = {
  endpoint: DEFAULT_ENDPOINT,
  darkMode: false,
  mode: "sidebar",
  widgetOptions: createDefaultVariantOptions(),
  sidebarOptions: createDefaultVariantOptions(),
  behavior: defaultBehaviorOptions,
  callbacks: {},
  style: defaultStyleOptions,
  metadata: undefined,
  slots: {}
};

const mergeVariantOptions = (
  base: BoopVariantOptions,
  overrides?: BoopVariantOptions
): BoopVariantOptions => ({
  ...base,
  ...overrides,
  labels: { ...(base.labels ?? {}), ...(overrides?.labels ?? {}) },
  placeholders: { ...(base.placeholders ?? {}), ...(overrides?.placeholders ?? {}) }
});

const mergeStyleOptions = (
  base: BoopStyleOptions,
  overrides?: BoopStyleOptions
): BoopStyleOptions => ({
  ...base,
  ...overrides,
  classNames: { ...(base.classNames ?? {}), ...(overrides?.classNames ?? {}) },
  styleOverrides: {
    ...(base.styleOverrides ?? {}),
    ...(overrides?.styleOverrides ?? {})
  },
  theme: { ...(base.theme ?? {}), ...(overrides?.theme ?? {}) }
});

export const mergeBoopOptions = (options?: BoopOptions): ResolvedBoopOptions => ({
  endpoint: options?.endpoint ?? defaultBoopOptions.endpoint,
  darkMode: options?.darkMode ?? defaultBoopOptions.darkMode,
  mode: options?.mode ?? defaultBoopOptions.mode,
  widgetOptions: mergeVariantOptions(
    createDefaultVariantOptions(),
    options?.widgetOptions
  ),
  sidebarOptions: mergeVariantOptions(
    createDefaultVariantOptions(),
    options?.sidebarOptions
  ),
  behavior: { ...defaultBehaviorOptions, ...(options?.behavior ?? {}) },
  callbacks: { ...(options?.callbacks ?? {}) },
  style: mergeStyleOptions(defaultStyleOptions, options?.style),
  metadata: options?.metadata,
  slots: { ...(options?.slots ?? {}) }
});
