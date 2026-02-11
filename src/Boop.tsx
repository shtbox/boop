import React, {
  forwardRef,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { buildBoopMotionStyles, resolveAnimationState } from "./boop/animation";
import { useBoopVisibility } from "./boop/hooks/useBoopVisibility";
import { combineBoopOptions, mergeBoopOptions } from "./boop/options";
import { resolvePanelFixedOffset, resolvePanelPlacement } from "./boop/positioning";
import { ensureConsoleCapture } from "./boop/stack";
import { submitBoopFeedback } from "./boop/submit";
import { createStyles, getDefaultTheme } from "./boop/styles";
import type {
  BoopFieldName,
  BoopFieldValues,
  BoopHandle,
  BoopProps,
  BoopRef,
  BoopSubmitPayload
} from "./boop/types";
import { mergeClassNames } from "./boop/utils";
import { BoopContext } from "./provider/boop-provider";

type SubmitStatus = {
  type: "idle" | "success" | "error";
  message?: string;
};

type BoopComponent = (props: BoopProps & { ref?: BoopRef }) => JSX.Element;

export const Boop = forwardRef<BoopHandle, BoopProps>(({ options }, ref) => {
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
    urlResolver,
    includeStackTrace,
    onSuccessRenderer,
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
  const [lastSuccessPayload, setLastSuccessPayload] =
    useState<BoopSubmitPayload | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const successAnimationRef = useRef<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);
  const panelPointerDownRef = useRef(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
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
    setSuccessVisible(false);
    openVisibility();
  }, [openVisibility]);

  const setFieldValue = useCallback(
    (field: BoopFieldName, value: string) => {
      if (field === "name") {
        setName(value);
      } else if (field === "email") {
        setEmail(value);
      } else {
        setMessage(value);
      }
      onFieldChange?.(field, value);
    },
    [onFieldChange]
  );

  const setFieldValues = useCallback(
    (values?: BoopFieldValues) => {
      if (!values) {
        return;
      }
      if (values.name !== undefined) {
        setFieldValue("name", values.name);
      }
      if (values.email !== undefined) {
        setFieldValue("email", values.email);
      }
      if (values.message !== undefined) {
        setFieldValue("message", values.message);
      }
    },
    [setFieldValue]
  );

  useImperativeHandle(
    ref,
    () => ({
      setFieldValue,
      setFieldValues
    }),
    [setFieldValue, setFieldValues]
  );

  const successTransitionMs = Math.max(animationState.durationMs, 500);
  const lockContentHeight = useCallback(
    (element: HTMLElement | null) => {
      if (!animationState.shouldAnimate || !element) {
        return;
      }
      const nextHeight = element.offsetHeight;
      if (nextHeight) {
        setContentHeight(nextHeight);
      }
    },
    [animationState.shouldAnimate]
  );

  useEffect(() => {
    if (includeStackTrace) {
      ensureConsoleCapture();
    }
  }, [includeStackTrace]);

  useEffect(() => {
    if (autoOpen) {
      open();
    }
  }, [autoOpen, open]);

  useEffect(() => {
    setFieldValues(resolvedOptions.fieldValues);
  }, [resolvedOptions.fieldValues, setFieldValues]);

  useEffect(() => {
    if (!animationState.shouldAnimate) {
      setContentHeight(null);
      return;
    }

    if (status.type === "success" && !closeOnSubmit) {
      lockContentHeight(successRef.current);
    } else {
      lockContentHeight(formRef.current);
    }
  }, [animationState.shouldAnimate, closeOnSubmit, lockContentHeight, status.type]);

  useEffect(() => {
    if (contentHeight === null || !animationState.shouldAnimate) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setContentHeight(null);
    }, successTransitionMs);
    return () => window.clearTimeout(timeout);
  }, [animationState.shouldAnimate, contentHeight, successTransitionMs]);

  useEffect(() => {
    if (successAnimationRef.current !== undefined) {
      window.cancelAnimationFrame(successAnimationRef.current);
      successAnimationRef.current = undefined;
    }
    if (status.type === "success" && !closeOnSubmit) {
      setSuccessVisible(false);
      successAnimationRef.current = window.requestAnimationFrame(() => {
        setSuccessVisible(true);
      });
    }
    return () => {
      if (successAnimationRef.current !== undefined) {
        window.cancelAnimationFrame(successAnimationRef.current);
        successAnimationRef.current = undefined;
      }
    };
  }, [closeOnSubmit, status.type]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }

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
        payload,
        urlResolver,
        includeStackTrace
      });
      lockContentHeight(formRef.current);
      setStatus({ type: "success", message: successMessage });
      setLastSuccessPayload(payload);
      setMessage("");
      if (closeOnSubmit) {
        close();
      } else {
        setSuccessVisible(true);
      }
    } catch (error) {
      const submitError = error instanceof Error ? error : new Error(errorMessage);
      setStatus({ type: "error", message: submitError.message || errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSuccess = useCallback(() => {
    lockContentHeight(successRef.current);
    setStatus({ type: "idle" });
    setSuccessVisible(false);
  }, [lockContentHeight]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (panelPointerDownRef.current) {
      panelPointerDownRef.current = false;
      return;
    }
    close();
  };

  const handlePanelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handlePanelPointerDown = () => {
    panelPointerDownRef.current = true;
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
            onPointerDown={handlePanelPointerDown}
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

            <div
              style={
                contentHeight !== null && animationState.shouldAnimate
                  ? {
                      height: contentHeight,
                      overflow: "hidden",
                      transition: `height ${successTransitionMs}ms ${animationState.easing}`,
                      willChange: "height"
                    }
                  : undefined
              }
            >
              {status.type === "success" && !closeOnSubmit ? (
                <div
                  ref={successRef}
                  className={mergeClassNames("boop-success", classNames?.form)}
                  style={{
                    ...getStyle("form"),
                    ...(animationState.shouldAnimate
                      ? {
                          transition: `opacity ${successTransitionMs}ms ${animationState.easing}, transform ${successTransitionMs}ms ${animationState.easing}`,
                          opacity: successVisible ? 1 : 0,
                          transform: successVisible
                            ? "translateY(0) scale(1)"
                            : "translateY(12px) scale(0.98)",
                          willChange: "transform, opacity"
                        }
                      : {})
                  }}
                >
                  {lastSuccessPayload && onSuccessRenderer
                    ? onSuccessRenderer(lastSuccessPayload, {
                        close,
                        reset: handleResetSuccess
                      })
                    : null}
                  {!onSuccessRenderer ? (
                    <p style={{ margin: 0 }}>{successMessage}</p>
                  ) : null}
                </div>
              ) : (
                <form
                  ref={formRef}
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
                    id={`${titleId}-name`}
                    name="name"
                      value={name}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("name", event.target.value);
                      }}
                      placeholder={placeholderText.name}
                      style={getStyle("input")}
                      disabled={isSubmitting}
                    />
                  </label>

                  <label
                    className={mergeClassNames("boop-field", classNames?.field)}
                    style={getStyle("field")}
                  >
                    {labelText.email}
                  <input
                      type="email"
                    id={`${titleId}-email`}
                    name="email"
                      value={email}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("email", event.target.value);
                      }}
                      placeholder={placeholderText.email}
                      style={getStyle("input")}
                      disabled={isSubmitting}
                    />
                  </label>

                  <label
                    className={mergeClassNames("boop-field", classNames?.field)}
                    style={getStyle("field")}
                  >
                    {labelText.message}
                  <textarea
                    id={`${titleId}-message`}
                    name="message"
                      value={message}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setFieldValue("message", event.target.value);
                      }}
                      placeholder={placeholderText.message}
                      style={{ ...getStyle("input"), ...getStyle("textarea") }}
                      className={mergeClassNames("boop-textarea", classNames?.textarea)}
                      autoFocus
                      required
                      disabled={isSubmitting}
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
              )}
            </div>

            <div
              className={mergeClassNames("boop-footer", classNames?.footer)}
              style={getStyle("footer")}
            >
              {status.type === "error" ? (
                <div className="boop-error-message-container" style={getStyle("errorMessageContainer")}>
                  <span className="boop-error-message" aria-live="polite" style={getStyle("errorMessage")}>{status.message}</span>
                </div>
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
                  style={{ color: "inherit" }}
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
}) as BoopComponent;
