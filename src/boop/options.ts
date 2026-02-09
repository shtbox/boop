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
  BoopUrlResolver,
  BoopSuccessRenderer
} from "./types";

export type ResolvedBoopOptions = {
  projectId: string;  // required
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
  includeStackTrace: boolean;
  onSuccessRenderer?: BoopSuccessRenderer;
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
  title: "Feedback",
  labels: { ...defaultLabels },
  placeholders: { ...defaultPlaceholders },
  button: {
    label: "Feedback",
    placement: "inline"
  },
  panel: {
    placement: "center"
  },
  successMessage: "Your feedback has been submitted successfully.",
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
  projectId: "",
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
  includeStackTrace: false,
  onSuccessRenderer: undefined,
  metadata: undefined,
  slots: {},
  attribution: true
};

const resolveProjectId = (projectId?: string) => projectId?.trim() ?? "";

const resolveEndpoint = (baseEndpoint: string, projectId: string) => {
  if (baseEndpoint !== DEFAULT_ENDPOINT) {
    return baseEndpoint;
  }
  if (!projectId) {
    throw new Error(
      "Boop requires a projectId when using the default endpoint. Set options.projectId or provider defaultOptions.projectId."
    );
  }
  const normalized = baseEndpoint.endsWith("/") ? baseEndpoint.slice(0, -1) : baseEndpoint;
  return `${normalized}/${projectId}`;
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
  includeStackTrace:
    overrides?.includeStackTrace ?? base?.includeStackTrace ?? defaultBoopOptions.includeStackTrace,
  onSuccessRenderer: overrides?.onSuccessRenderer ?? base?.onSuccessRenderer,
  metadata: mergeMetadata(base?.metadata, overrides?.metadata),
  slots: { ...(base?.slots ?? {}), ...(overrides?.slots ?? {}) },
  attribution: base?.attribution ?? overrides?.attribution ?? true
});

export const mergeBoopOptions = (options?: BoopOptions): ResolvedBoopOptions => {
  const projectId = resolveProjectId(options?.projectId ?? defaultBoopOptions.projectId);

  return {
    projectId,
    endpoint: resolveEndpoint(
      options?.endpoint ?? defaultBoopOptions.endpoint,
      projectId
    ),
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
    includeStackTrace: options?.includeStackTrace ?? defaultBoopOptions.includeStackTrace,
    onSuccessRenderer: options?.onSuccessRenderer,
    metadata: options?.metadata,
    slots: { ...(options?.slots ?? {}) },
    attribution: options?.attribution ?? true
  };
};
