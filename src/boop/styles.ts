import React from "react";
import type { BoopTheme } from "./types";

export type BoopStyles = {
  root: React.CSSProperties;
  button: React.CSSProperties;
  buttonFixed: React.CSSProperties;
  overlay: React.CSSProperties;
  overlayCenter: React.CSSProperties;
  panel: React.CSSProperties;
  panelWidget: React.CSSProperties;
  header: React.CSSProperties;
  form: React.CSSProperties;
  field: React.CSSProperties;
  input: React.CSSProperties;
  textarea: React.CSSProperties;
  submit: React.CSSProperties;
  close: React.CSSProperties;
  footer: React.CSSProperties;
};

const defaultTheme = (darkMode: boolean) =>
  darkMode
    ? {
        "--boop-background": "#111827",
        "--boop-panel": "#0f172a",
        "--boop-text": "#e2e8f0",
        "--boop-muted-text": "#94a3b8",
        "--boop-border": "#1f2937",
        "--boop-button": "#22c55e",
        "--boop-button-text": "#0b1220",
        "--boop-overlay": "rgba(15, 23, 42, 0.7)",
        "--boop-input-bg": "#0b1220"
      }
    : {
        "--boop-background": "#ffffff",
        "--boop-panel": "#ffffff",
        "--boop-text": "#0f172a",
        "--boop-muted-text": "#475569",
        "--boop-border": "#e2e8f0",
        "--boop-button": "#16a34a",
        "--boop-button-text": "#ffffff",
        "--boop-overlay": "rgba(15, 23, 42, 0.35)",
        "--boop-input-bg": "#ffffff"
      };

export const getDefaultTheme = (darkMode: boolean): BoopTheme =>
  defaultTheme(darkMode);

const cssVar = (name: string, fallback: string) => `var(${name}, ${fallback})`;

export const createStyles = (darkMode: boolean): BoopStyles => {
  const theme = defaultTheme(darkMode);
  const colors = {
    background: cssVar("--boop-background", theme["--boop-background"]),
    panel: cssVar("--boop-panel", theme["--boop-panel"]),
    text: cssVar("--boop-text", theme["--boop-text"]),
    mutedText: cssVar("--boop-muted-text", theme["--boop-muted-text"]),
    border: cssVar("--boop-border", theme["--boop-border"]),
    button: cssVar("--boop-button", theme["--boop-button"]),
    buttonText: cssVar("--boop-button-text", theme["--boop-button-text"]),
    overlay: cssVar("--boop-overlay", theme["--boop-overlay"]),
    inputBg: cssVar("--boop-input-bg", theme["--boop-input-bg"])
  };

  return {
    root: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
      color: colors.text
    },
    button: {
      background: colors.button,
      color: colors.buttonText,
      border: "none",
      borderRadius: 999,
      padding: "10px 18px",
      fontSize: 14,
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.2)"
    },
    buttonFixed: {
      position: "fixed" as const,
      right: 24,
      bottom: 24,
      zIndex: 10010
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: colors.overlay,
      display: "flex",
      justifyContent: "flex-end",
      zIndex: 10000
    },
    overlayCenter: {
      position: "fixed",
      inset: 0,
      background: colors.overlay,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000
    },
    panel: {
      width: "100%",
      maxWidth: 420,
      background: colors.panel,
      color: colors.text,
      height: "100%",
      padding: 24,
      boxShadow: "0 10px 40px rgba(15, 23, 42, 0.3)",
      borderLeft: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
      zIndex: 10001
    },
    panelWidget: {
      width: "100%",
      maxWidth: 420,
      background: colors.panel,
      color: colors.text,
      padding: 24,
      borderRadius: 16,
      boxShadow: "0 14px 40px rgba(15, 23, 42, 0.35)",
      border: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
      maxHeight: "80vh",
      overflow: "auto",
      zIndex: 10001
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 12
    },
    field: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 6,
      fontSize: 13,
      color: colors.mutedText
    },
    input: {
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      padding: "10px 12px",
      fontSize: 14,
      background: colors.inputBg,
      color: colors.text
    },
    textarea: {
      minHeight: 110,
      resize: "vertical"
    },
    submit: {
      background: colors.button,
      color: colors.buttonText,
      border: "none",
      borderRadius: 12,
      padding: "10px 16px",
      fontSize: 14,
      cursor: "pointer"
    },
    close: {
      background: "transparent",
      border: "none",
      color: colors.mutedText,
      cursor: "pointer",
      fontSize: 20,
      lineHeight: 1
    },
    footer: {
      fontSize: 13,
      color: colors.mutedText,
      display: "flex",
      flexDirection: "column" as const,
      gap: 8
    }
  };
};
