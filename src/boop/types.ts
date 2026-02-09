import React from "react";

export type BoopClassNames = Partial<{
  root: string;
  button: string;
  overlay: string;
  panel: string;
  header: string;
  form: string;
  field: string;
  textarea: string;
  submit: string;
  close: string;
  footer: string;
  attribution: string;
  errorMessageContainer: string;
  errorMessage: string;
}>;

export type BoopButtonPlacement = "inline" | "fixed";
export type BoopPanelPlacement = "center" | "fixed";
export type BoopPanelVariant = "sidebar" | "widget";

export type BoopFieldName = "name" | "email" | "message";

export type BoopFixedOffset = Partial<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type BoopButtonOptions = Partial<{
  label: string;
  placement: BoopButtonPlacement;
  fixedOffset: BoopFixedOffset;
}>;

export type BoopPanelOptions = Partial<{
  placement: BoopPanelPlacement;
  fixedOffset: BoopFixedOffset;
  width: number | string;
  maxHeight: number | string;
}>;

export type BoopWidgetAnimation = Partial<{
  fade: boolean;
  slide: boolean;
  grow: boolean;
  slideDistance: number;
  scale: number;
}>;

export type BoopSidebarAnimation = Partial<{
  slide: boolean;
  slideDistance: number | string;
}>;

export type BoopAnimationOptions = Partial<{
  enabled: boolean;
  durationMs: number;
  easing: string;
  widget: BoopWidgetAnimation;
  sidebar: BoopSidebarAnimation;
}>;

export type BoopBackdropOptions = Partial<{
  enabled: boolean;
  fade: boolean;
}>;

export type BoopLabels = Partial<{
  name: string;
  email: string;
  message: string;
  submit: string;
  close: string;
}>;

export type BoopPlaceholders = Partial<{
  name: string;
  email: string;
  message: string;
}>;

export type BoopTheme = Record<string, string>;

export type BoopStyleKey =
  | "root"
  | "button"
  | "buttonFixed"
  | "overlay"
  | "overlayCenter"
  | "panel"
  | "panelWidget"
  | "header"
  | "form"
  | "field"
  | "input"
  | "textarea"
  | "submit"
  | "close"
  | "footer"
  | "attribution"
  | "errorMessageContainer"
  | "errorMessage";

export type BoopBehaviorOptions = Partial<{
  autoOpen: boolean;
  closeOnSubmit: boolean;
}>;

export type BoopCallbacks = Partial<{
  onOpen: () => void;
  onClose: () => void;
  onSubmitStart: () => void;
  onValidationError: (field: BoopFieldName, message: string) => void;
  onFieldChange: (field: BoopFieldName, value: string) => void;
  onSubmitSuccess: (response: Response) => void;
  onSubmitError: (error: Error) => void;
}>;

export type BoopVariantOptions = Partial<{
  title: string;
  labels: BoopLabels;
  placeholders: BoopPlaceholders;
  button: BoopButtonOptions;
  panel: BoopPanelOptions;
  successMessage: string;
  errorMessage: string;
}>;

export type BoopStyleOptions = Partial<{
  classNames: BoopClassNames;
  styleOverrides: Partial<Record<BoopStyleKey, React.CSSProperties>>;
  theme: BoopTheme;
  useDefaultStyles: boolean;
}>;

export type BoopSlots = Partial<{
  footer: React.ReactNode;
}>;

export type BoopSubmitPayload = {
  name?: string;
  email?: string;
  message: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

export type BoopUrlResolver = () => string | undefined;

export type BoopSuccessRendererHelpers = {
  close: () => void;
  reset: () => void;
};

export type BoopSuccessRenderer = (
  payload: BoopSubmitPayload,
  helpers: BoopSuccessRendererHelpers
) => React.ReactNode;

export type BoopOptions = Partial<{
  projectId: string;
  endpoint: string;
  darkMode: boolean;
  mode: BoopPanelVariant;
  widgetOptions: BoopVariantOptions;
  sidebarOptions: BoopVariantOptions;
  behavior: BoopBehaviorOptions;
  callbacks: BoopCallbacks;
  style: BoopStyleOptions;
  animation: BoopAnimationOptions;
  backdrop: BoopBackdropOptions;
  urlResolver: BoopUrlResolver;
  includeStackTrace: boolean;
  onSuccessRenderer: BoopSuccessRenderer;
  metadata: Record<string, unknown>;
  slots: BoopSlots;
  attribution: boolean;
}>;

export interface BoopProps {
  options?: BoopOptions;
}
