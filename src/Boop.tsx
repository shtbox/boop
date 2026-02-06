import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState
} from "react";
import { buildBoopMotionStyles, resolveAnimationState } from "./boop/animation";
import { useBoopVisibility } from "./boop/hooks/useBoopVisibility";
import { combineBoopOptions, mergeBoopOptions } from "./boop/options";
import { resolvePanelFixedOffset, resolvePanelPlacement } from "./boop/positioning";
import { submitBoopFeedback } from "./boop/submit";
import { createStyles, getDefaultTheme } from "./boop/styles";
import type { BoopProps, BoopSubmitPayload } from "./boop/types";
import { mergeClassNames } from "./boop/utils";
import { BoopContext } from "./provider/boop-provider";

type SubmitStatus = {
  type: "idle" | "success" | "error";
  message?: string;
};

export const Boop = ({ options }: BoopProps) => {
  const boopContext = useContext(BoopContext);
  const combinedOptions = useMemo(
    () => combineBoopOptions(boopContext?.options, options),
    [boopContext?.options, options]
  );
  const resolvedOptions = useMemo(
    () => mergeBoopOptions(combinedOptions),
    [combinedOptions]
  );
  const {
    endpoint,
    darkMode,
    mode,
    widgetOptions,
    sidebarOptions,
    behavior,
    animation,
    backdrop,
    callbacks,
    style,
    metadata,
    slots
  } = resolvedOptions;
  const { classNames, styleOverrides, theme, useDefaultStyles } = style;
  const { autoOpen, closeOnSubmit } = behavior;
  const { onOpen, onClose, onFieldChange } = callbacks;
  const { title, labels, placeholders, button, panel, successMessage, errorMessage } =
    mode === "widget" ? widgetOptions : sidebarOptions;
  const rawPanelOptions = (mode === "widget" ? options?.widgetOptions : options?.sidebarOptions)
    ?.panel;
  const buttonPlacement = button?.placement ?? "inline";
  const panelPlacement = resolvePanelPlacement({
    mode,
    rawPanelPlacement: rawPanelOptions?.placement,
    rawPanelFixedOffset: rawPanelOptions?.fixedOffset,
    buttonPlacement
  });
  const panelFixedOffset =
    mode === "widget" && panelPlacement === "fixed"
      ? resolvePanelFixedOffset(panel?.fixedOffset, button?.fixedOffset)
      : undefined;
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

  const getStyle = useCallback(
    (key: keyof typeof styles) => ({
      ...(useDefaultStyles ? styles[key] : {}),
      ...(styleOverrides?.[key] ?? {})
    }),
    [styleOverrides, styles, useDefaultStyles]
  );

  const animationState = resolveAnimationState(animation, backdrop);
  const { isRendered, isVisible, open: openVisibility, close } = useBoopVisibility({
    shouldAnimate: animationState.shouldAnimate,
    durationMs: animationState.durationMs,
    onOpen,
    onClose
  });

  const open = useCallback(() => {
    setStatus({ type: "idle" });
    openVisibility();
  }, [openVisibility]);

  useEffect(() => {
    if (autoOpen) {
      open();
    }
  }, [autoOpen, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const payload: BoopSubmitPayload = {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: message.trim()
      };

      await submitBoopFeedback({
        endpoint,
        callbacks,
        metadata,
        payload
      });
      setStatus({ type: "success", message: successMessage });
      setMessage("");
      if (closeOnSubmit) {
        close();
      }
    } catch (error) {
      const submitError = error instanceof Error ? error : new Error(errorMessage);
      setStatus({ type: "error", message: submitError.message || errorMessage });
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

  const {
    panelMotionStyle,
    panelTransitionStyle,
    overlayBaseStyle,
    overlayBackdropStyle,
    overlayTransitionStyle
  } = buildBoopMotionStyles({
    mode,
    panelPlacement,
    isVisible,
    animationState,
    getStyle
  });

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
                  : button?.fixedOffset
                  ? { position: "fixed", zIndex: 10010 }
                  : {}),
                ...(button?.fixedOffset ?? {})
              }
            : null)
        }}
        onClick={open}
        aria-haspopup="dialog"
      >
        {button?.label ?? "Feedback"}
      </button>

      {isRendered ? (
        <div
          className={mergeClassNames("boop-overlay", classNames?.overlay)}
          style={{
            ...overlayBaseStyle,
            ...overlayBackdropStyle,
            ...overlayTransitionStyle
          }}
          role="presentation"
          onClick={handleOverlayClick}
        >
          <div
            className={mergeClassNames("boop-panel", classNames?.panel)}
            style={{
              ...(mode === "widget" ? getStyle("panelWidget") : getStyle("panel")),
              ...(mode === "widget" && panelPlacement === "fixed"
                ? { position: "fixed", ...(panelFixedOffset ?? {}) }
                : {}),
              ...(panel?.width ? { maxWidth: panel.width } : {}),
              ...(panel?.maxHeight ? { maxHeight: panel.maxHeight } : {}),
              ...panelTransitionStyle,
              ...panelMotionStyle
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
              {slots.footer}
            </div>
            {resolvedOptions?.attribution && (
            <div
              className={mergeClassNames("boop-attribution", classNames?.attribution)}
              style={getStyle("attribution")}
            >
              Powered by{" "}
              <a
                href="https://shtbox.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{color: "inherit"}}
              >
                Boop
              </a>
            </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
