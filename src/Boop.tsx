import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { DEFAULT_BUTTON_FIXED_OFFSET, DEFAULT_WIDGET_GAP } from "./boop/constants";
import { combineBoopOptions, mergeBoopOptions } from "./boop/options";
import { submitBoopFeedback } from "./boop/submit";
import { createStyles, getDefaultTheme } from "./boop/styles";
import type { BoopFixedOffset, BoopProps, BoopSubmitPayload } from "./boop/types";
import { mergeClassNames } from "./boop/utils";
import { BoopContext } from "./provider/boop-provider";

type SubmitStatus = {
  type: "idle" | "success" | "error";
  message?: string;
};

const addOffsetGap = (offset: BoopFixedOffset, gap: number): BoopFixedOffset => ({
  ...(offset.top !== undefined ? { top: offset.top + gap } : {}),
  ...(offset.right !== undefined ? { right: offset.right + gap } : {}),
  ...(offset.bottom !== undefined ? { bottom: offset.bottom + gap } : {}),
  ...(offset.left !== undefined ? { left: offset.left + gap } : {})
});

const resolveBaseButtonOffset = (offset?: BoopFixedOffset): BoopFixedOffset => ({
  ...DEFAULT_BUTTON_FIXED_OFFSET,
  ...(offset ?? {})
});

const resolvePanelFixedOffset = (
  panelOffset: BoopFixedOffset | undefined,
  buttonOffset: BoopFixedOffset | undefined
): BoopFixedOffset =>
  panelOffset ?? addOffsetGap(resolveBaseButtonOffset(buttonOffset), DEFAULT_WIDGET_GAP);

const formatDistance = (distance: number | string) =>
  typeof distance === "number" ? `${distance}px` : distance;

const buildTransform = (parts: Array<string | undefined>) => {
  const value = parts.filter(Boolean).join(" ");
  return value.length ? value : undefined;
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
  const variantOptions = mode === "widget" ? widgetOptions : sidebarOptions;
  const { classNames, styleOverrides, theme, useDefaultStyles } = style;
  const { autoOpen, closeOnSubmit } = behavior;
  const { onOpen, onClose, onFieldChange } = callbacks;
  const { title, labels, placeholders, button, panel, successMessage, errorMessage } =
    variantOptions;
  const rawVariantOptions = mode === "widget" ? options?.widgetOptions : options?.sidebarOptions;
  const rawPanelPlacement = rawVariantOptions?.panel?.placement;
  const rawPanelFixedOffset = rawVariantOptions?.panel?.fixedOffset;
  const buttonLabel = button?.label ?? "Feedback";
  const buttonPlacement = button?.placement ?? "inline";
  const buttonFixedOffset = button?.fixedOffset;
  const panelPlacement =
    rawPanelPlacement ??
    (mode === "widget" && (rawPanelFixedOffset || buttonPlacement === "fixed")
      ? "fixed"
      : "center");
  const panelFixedOffset =
    mode === "widget" && panelPlacement === "fixed"
      ? resolvePanelFixedOffset(panel?.fixedOffset, buttonFixedOffset)
      : undefined;
  const panelWidth = panel?.width;
  const panelMaxHeight = panel?.maxHeight;
  const footerSlot = slots.footer;
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const titleId = useId();
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationTimeoutRef = useRef<number | undefined>(undefined);

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

  const animationEnabled = animation?.enabled ?? true;
  const animationDurationMs = animation?.durationMs ?? 220;
  const animationEasing = animation?.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)";
  const widgetAnimation = {
    fade: true,
    slide: true,
    grow: true,
    slideDistance: 12,
    scale: 0.98,
    ...(animation?.widget ?? {})
  };
  const sidebarAnimation = {
    slide: true,
    slideDistance: "100%",
    ...(animation?.sidebar ?? {})
  };
  const backdropEnabled = backdrop?.enabled ?? true;
  const backdropFade = backdrop?.fade ?? true;
  const shouldAnimate = animationEnabled && animationDurationMs > 0;

  const setVisibility = useCallback(
    (visible: boolean) => {
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      if (animationTimeoutRef.current !== undefined) {
        window.clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = undefined;
      }
      if (!shouldAnimate) {
        setIsRendered(visible);
        setIsVisible(visible);
        return;
      }
      if (visible) {
        setIsRendered(true);
        animationFrameRef.current = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      } else {
        setIsVisible(false);
        animationTimeoutRef.current = window.setTimeout(() => {
          setIsRendered(false);
        }, animationDurationMs);
      }
    },
    [animationDurationMs, shouldAnimate]
  );

  const resetStatus = useCallback(() => setStatus({ type: "idle" }), []);

  const open = useCallback(() => {
    resetStatus();
    setVisibility(true);
    onOpen?.();
  }, [onOpen, resetStatus, setVisibility]);

  const close = useCallback(() => {
    setVisibility(false);
    onClose?.();
  }, [onClose, setVisibility]);

  useEffect(() => {
    if (autoOpen) {
      open();
    }
  }, [autoOpen, open]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (animationTimeoutRef.current !== undefined) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRendered) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, isRendered]);

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

  const panelTransition = shouldAnimate
    ? [
        (mode === "widget" && (widgetAnimation.slide || widgetAnimation.grow)) ||
        (mode !== "widget" && sidebarAnimation.slide)
          ? `transform ${animationDurationMs}ms ${animationEasing}`
          : null,
        mode === "widget" && widgetAnimation.fade
          ? `opacity ${animationDurationMs}ms ${animationEasing}`
          : null
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;
  const widgetTransform = buildTransform([
    widgetAnimation.slide
      ? `translateY(${formatDistance(isVisible ? 0 : widgetAnimation.slideDistance)})`
      : undefined,
    widgetAnimation.grow ? `scale(${isVisible ? 1 : widgetAnimation.scale})` : undefined
  ]);
  const sidebarTransform = sidebarAnimation.slide
    ? `translateX(${isVisible ? "0" : formatDistance(sidebarAnimation.slideDistance)})`
    : undefined;
  const panelMotionStyle =
    mode === "widget"
      ? {
          ...(widgetAnimation.fade ? { opacity: isVisible ? 1 : 0 } : {}),
          ...(widgetTransform ? { transform: widgetTransform } : {})
        }
      : {
          ...(sidebarTransform ? { transform: sidebarTransform } : {})
        };
  const panelTransitionStyle =
    shouldAnimate && panelTransition
      ? { transition: panelTransition, willChange: "transform, opacity" }
      : {};
  const overlayBaseStyle =
    mode === "widget" && panelPlacement === "fixed"
      ? getStyle("overlay")
      : mode === "widget"
      ? getStyle("overlayCenter")
      : getStyle("overlay");
  const overlayBackground =
    typeof overlayBaseStyle.backgroundColor === "string"
      ? overlayBaseStyle.backgroundColor
      : typeof overlayBaseStyle.background === "string"
      ? overlayBaseStyle.background
      : "transparent";
  const overlayBackdropStyle = backdropEnabled
    ? shouldAnimate && backdropFade
      ? { backgroundColor: isVisible ? overlayBackground : "transparent" }
      : { backgroundColor: overlayBackground }
    : { backgroundColor: "transparent" };
  const overlayTransitionStyle =
    shouldAnimate && backdropEnabled && backdropFade
      ? { transition: `background-color ${animationDurationMs}ms ${animationEasing}` }
      : {};

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
                  : buttonFixedOffset
                  ? { position: "fixed", zIndex: 10010 }
                  : {}),
                ...(buttonFixedOffset ?? {})
              }
            : null)
        }}
        onClick={open}
        aria-haspopup="dialog"
      >
        {buttonLabel}
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
              ...(panelWidth ? { maxWidth: panelWidth } : {}),
              ...(panelMaxHeight ? { maxHeight: panelMaxHeight } : {}),
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
              {footerSlot}
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
