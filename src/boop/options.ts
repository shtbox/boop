import { DEFAULT_ENDPOINT } from "./constants";
import type {
  BoopBehaviorOptions,
  BoopAnimationOptions,
  BoopBackdropOptions,
  BoopCallbacks,
  BoopLabels,
  BoopOptions,
  BoopPlaceholders,
  BoopStyleOptions,
  BoopVariantOptions,
  BoopSlots,
  BoopPanelVariant,
  BoopUrlResolver
} from "./types";

export type ResolvedBoopOptions = {
  endpoint: string;
  darkMode: boolean;
  mode: BoopPanelVariant;
  widgetOptions: BoopVariantOptions;
  sidebarOptions: BoopVariantOptions;
  behavior: BoopBehaviorOptions;
  animation: BoopAnimationOptions;
  backdrop: BoopBackdropOptions;
  callbacks: BoopCallbacks;
  style: BoopStyleOptions;
  urlResolver?: BoopUrlResolver;
  metadata?: Record<string, unknown>;
  slots: BoopSlots;
  attribution: boolean;
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
  button: {
    label: "Feedback",
    placement: "inline"
  },
  panel: {
    placement: "center"
  },
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

const defaultAnimationOptions: BoopAnimationOptions = {
  enabled: true,
  durationMs: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  widget: {
    fade: true,
    slide: true,
    grow: true,
    slideDistance: 12,
    scale: 0.98
  },
  sidebar: {
    slide: true,
    slideDistance: "100%"
  }
};

const defaultBackdropOptions: BoopBackdropOptions = {
  enabled: true,
  fade: true
};

export const defaultBoopOptions: ResolvedBoopOptions = {
  endpoint: DEFAULT_ENDPOINT,
  darkMode: false,
  mode: "sidebar",
  widgetOptions: createDefaultVariantOptions(),
  sidebarOptions: createDefaultVariantOptions(),
  behavior: defaultBehaviorOptions,
  animation: defaultAnimationOptions,
  backdrop: defaultBackdropOptions,
  callbacks: {},
  style: defaultStyleOptions,
  metadata: undefined,
  slots: {},
  attribution: true
};

const mergeVariantOptions = (
  base: BoopVariantOptions,
  overrides?: BoopVariantOptions
): BoopVariantOptions => ({
  ...base,
  ...overrides,
  labels: { ...(base.labels ?? {}), ...(overrides?.labels ?? {}) },
  placeholders: { ...(base.placeholders ?? {}), ...(overrides?.placeholders ?? {}) },
  button: { ...(base.button ?? {}), ...(overrides?.button ?? {}) },
  panel: { ...(base.panel ?? {}), ...(overrides?.panel ?? {}) }
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

const mergeAnimationOptions = (
  base: BoopAnimationOptions,
  overrides?: BoopAnimationOptions
): BoopAnimationOptions => ({
  ...base,
  ...overrides,
  widget: { ...(base.widget ?? {}), ...(overrides?.widget ?? {}) },
  sidebar: { ...(base.sidebar ?? {}), ...(overrides?.sidebar ?? {}) }
});

const mergeMetadata = (
  base?: Record<string, unknown>,
  overrides?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!base && !overrides) {
    return undefined;
  }
  return { ...(base ?? {}), ...(overrides ?? {}) };
};

export const combineBoopOptions = (
  base?: BoopOptions,
  overrides?: BoopOptions
): BoopOptions => ({
  ...base,
  ...overrides,
  widgetOptions: mergeVariantOptions(base?.widgetOptions ?? {}, overrides?.widgetOptions),
  sidebarOptions: mergeVariantOptions(base?.sidebarOptions ?? {}, overrides?.sidebarOptions),
  behavior: { ...(base?.behavior ?? {}), ...(overrides?.behavior ?? {}) },
  animation: mergeAnimationOptions(base?.animation ?? {}, overrides?.animation),
  backdrop: { ...(base?.backdrop ?? {}), ...(overrides?.backdrop ?? {}) },
  callbacks: { ...(base?.callbacks ?? {}), ...(overrides?.callbacks ?? {}) },
  style: mergeStyleOptions(base?.style ?? {}, overrides?.style),
  urlResolver: overrides?.urlResolver ?? base?.urlResolver,
  metadata: mergeMetadata(base?.metadata, overrides?.metadata),
  slots: { ...(base?.slots ?? {}), ...(overrides?.slots ?? {}) },
  attribution: base?.attribution ?? overrides?.attribution ?? true
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
  animation: mergeAnimationOptions(defaultAnimationOptions, options?.animation),
  backdrop: { ...defaultBackdropOptions, ...(options?.backdrop ?? {}) },
  callbacks: { ...(options?.callbacks ?? {}) },
  style: mergeStyleOptions(defaultStyleOptions, options?.style),
  urlResolver: options?.urlResolver,
  metadata: options?.metadata,
  slots: { ...(options?.slots ?? {}) },
  attribution: options?.attribution ?? true
});
