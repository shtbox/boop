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

export interface BoopProps {
  endpoint?: string;
  darkMode?: boolean;
  classNames?: BoopClassNames;
  styleOverrides?: Partial<Record<BoopStyleKey, React.CSSProperties>>;
  theme?: BoopTheme;
  useDefaultStyles?: boolean;
  buttonPlacement?: BoopButtonPlacement;
  fixedOffset?: BoopFixedOffset;
  panelVariant?: BoopPanelVariant;
  panelWidth?: number | string;
  panelMaxHeight?: number | string;
  buttonLabel?: string;
  title?: string;
  labels?: BoopLabels;
  placeholders?: BoopPlaceholders;
  successMessage?: string;
  errorMessage?: string;
  autoOpen?: boolean;
  closeOnSubmit?: boolean;
  metadata?: Record<string, unknown>;
  children?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  onSubmitStart?: () => void;
  onValidationError?: (field: BoopFieldName, message: string) => void;
  onFieldChange?: (field: BoopFieldName, value: string) => void;
  onSubmitSuccess?: (response: Response) => void;
  onSubmitError?: (error: Error) => void;
}
