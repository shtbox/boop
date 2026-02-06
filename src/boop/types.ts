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
}>;

export type BoopButtonPlacement = "inline" | "fixed";
export type BoopPanelVariant = "sidebar" | "widget";

export type BoopFieldName = "name" | "email" | "message";

export type BoopFixedOffset = Partial<{
  top: number;
  right: number;
  bottom: number;
  left: number;
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
  | "footer";

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
  buttonLabel: string;
  buttonPlacement: BoopButtonPlacement;
  fixedOffset: BoopFixedOffset;
  panelWidth: number | string;
  panelMaxHeight: number | string;
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

export type BoopOptions = Partial<{
  endpoint: string;
  darkMode: boolean;
  mode: BoopPanelVariant;
  widgetOptions: BoopVariantOptions;
  sidebarOptions: BoopVariantOptions;
  behavior: BoopBehaviorOptions;
  callbacks: BoopCallbacks;
  style: BoopStyleOptions;
  metadata: Record<string, unknown>;
  slots: BoopSlots;
}>;

export interface BoopProps {
  options?: BoopOptions;
}
