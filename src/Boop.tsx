import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { mergeBoopOptions } from "./boop/options";
import { createStyles, getDefaultTheme } from "./boop/styles";
import type { BoopProps } from "./boop/types";
import { isValidEmail, mergeClassNames } from "./boop/utils";

type SubmitStatus = {
  type: "idle" | "success" | "error";
  message?: string;
};

export const Boop = ({ options }: BoopProps) => {
  const resolvedOptions = useMemo(() => mergeBoopOptions(options), [options]);
  const {
    endpoint,
    darkMode,
    mode,
    widgetOptions,
    sidebarOptions,
    behavior,
    callbacks,
    style,
    metadata,
    slots
  } = resolvedOptions;
  const variantOptions = mode === "widget" ? widgetOptions : sidebarOptions;
  const { classNames, styleOverrides, theme, useDefaultStyles } = style;
  const { autoOpen, closeOnSubmit } = behavior;
  const {
    onOpen,
    onClose,
    onSubmitStart,
    onValidationError,
    onFieldChange,
    onSubmitSuccess,
    onSubmitError
  } = callbacks;
  const {
    title,
    labels,
    placeholders,
    buttonLabel,
    buttonPlacement,
    fixedOffset,
    panelWidth,
    panelMaxHeight,
    successMessage,
    errorMessage
  } = variantOptions;
  const footerSlot = slots.footer;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const titleId = useId();

  const styles = useMemo(() => createStyles(darkMode), [darkMode]);
  const themeVars = useMemo(
    () => ({ ...getDefaultTheme(darkMode), ...(theme ?? {}) }),
    [darkMode, theme]
  );

  const labelText = {
    name: labels?.name ?? "Name",
    email: labels?.email ?? "Email",
    message: labels?.message ?? "Message",
    submit: labels?.submit ?? (isSubmitting ? "Sending..." : "Send feedback"),
    close: labels?.close ?? "Close feedback"
  };

  const placeholderText = {
    name: placeholders?.name ?? "Your name",
    email: placeholders?.email ?? "you@example.com",
    message: placeholders?.message ?? "What would you like to share?"
  };

  const getStyle = (key: keyof typeof styles) => ({
    ...(useDefaultStyles ? styles[key] : {}),
    ...(styleOverrides?.[key] ?? {})
  });

  const resetStatus = () => setStatus({ type: "idle" });

  const open = () => {
    resetStatus();
    setIsOpen(true);
    onOpen?.();
  };

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (autoOpen) {
      open();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      const messageText = "Please add a feedback message.";
      setStatus({ type: "error", message: messageText });
      onValidationError?.("message", messageText);
      return;
    }

    if (!isValidEmail(email)) {
      const messageText = "Please provide a valid email address.";
      setStatus({ type: "error", message: messageText });
      onValidationError?.("email", messageText);
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle" });
    onSubmitStart?.();

    try {
      const payload = {
        url: window.location.href,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: message.trim(),
        metadata
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setStatus({ type: "success", message: successMessage });
      setMessage("");
      onSubmitSuccess?.(response);
      if (closeOnSubmit) {
        close();
      }
    } catch (error) {
      const submitError =
        error instanceof Error ? error : new Error(errorMessage);
      setStatus({ type: "error", message: submitError.message || errorMessage });
      onSubmitError?.(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    close();
  };

  const handlePanelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={mergeClassNames(
        `boop-root${darkMode ? " boop-dark" : ""}`,
        classNames?.root
      )}
      style={{ ...getStyle("root"), ...themeVars }}
      data-theme={darkMode ? "dark" : "light"}
    >
      <button
        type="button"
        className={mergeClassNames("boop-button", classNames?.button)}
        style={{
          ...getStyle("button"),
          ...(buttonPlacement === "fixed"
            ? {
                ...(useDefaultStyles
                  ? getStyle("buttonFixed")
                  : fixedOffset
                  ? { position: "fixed", zIndex: 10010 }
                  : {}),
                ...(fixedOffset ?? {})
              }
            : null)
        }}
        onClick={open}
        aria-haspopup="dialog"
      >
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          className={mergeClassNames("boop-overlay", classNames?.overlay)}
          style={
            mode === "widget" && fixedOffset
              ? getStyle("overlay")
              : mode === "widget"
              ? getStyle("overlayCenter")
              : getStyle("overlay")
          }
          role="presentation"
          onClick={handleOverlayClick}
        >
          <div
            className={mergeClassNames("boop-panel", classNames?.panel)}
            style={{
              ...(mode === "widget" ? getStyle("panelWidget") : getStyle("panel")),
              ...(mode === "widget" && fixedOffset
                ? { position: "fixed", ...fixedOffset }
                : {}),
              ...(panelWidth ? { maxWidth: panelWidth } : {}),
              ...(panelMaxHeight ? { maxHeight: panelMaxHeight } : {})
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={handlePanelClick}
          >
            <div
              className={mergeClassNames("boop-header", classNames?.header)}
              style={getStyle("header")}
            >
              <h2 id={titleId} style={{ margin: 0, fontSize: 18 }}>
                {title}
              </h2>
              <button
                type="button"
                aria-label={labelText.close}
                onClick={close}
                className={mergeClassNames("boop-close", classNames?.close)}
                style={getStyle("close")}
              >
                ×
              </button>
            </div>

            <form
              className={mergeClassNames("boop-form", classNames?.form)}
              style={getStyle("form")}
              noValidate
              onSubmit={handleSubmit}
            >
              <label
                className={mergeClassNames("boop-field", classNames?.field)}
                style={getStyle("field")}
              >
                {labelText.name}
                <input
                  type="text"
                  value={name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setName(event.target.value);
                    onFieldChange?.("name", event.target.value);
                  }}
                  placeholder={placeholderText.name}
                  style={getStyle("input")}
                />
              </label>

              <label
                className={mergeClassNames("boop-field", classNames?.field)}
                style={getStyle("field")}
              >
                {labelText.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(event.target.value);
                    onFieldChange?.("email", event.target.value);
                  }}
                  placeholder={placeholderText.email}
                  style={getStyle("input")}
                />
              </label>

              <label
                className={mergeClassNames("boop-field", classNames?.field)}
                style={getStyle("field")}
              >
                {labelText.message}
                <textarea
                  value={message}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setMessage(event.target.value);
                    onFieldChange?.("message", event.target.value);
                  }}
                  placeholder={placeholderText.message}
                  style={{ ...getStyle("input"), ...getStyle("textarea") }}
                  className={mergeClassNames("boop-textarea", classNames?.textarea)}
                  autoFocus
                  required
                />
              </label>

              <button
                type="submit"
                className={mergeClassNames("boop-submit", classNames?.submit)}
                style={getStyle("submit")}
                disabled={isSubmitting}
              >
                {labelText.submit}
              </button>
            </form>

            <div
              className={mergeClassNames("boop-footer", classNames?.footer)}
              style={getStyle("footer")}
            >
              {status.type !== "idle" ? (
                <span aria-live="polite">{status.message}</span>
              ) : null}
              {footerSlot}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
