import type React from "react";
import type {
  BoopAnimationOptions,
  BoopBackdropOptions,
  BoopPanelPlacement,
  BoopPanelVariant,
  BoopStyleKey
} from "./types";

type ResolvedWidgetAnimation = {
  fade: boolean;
  slide: boolean;
  grow: boolean;
  slideDistance: number;
  scale: number;
};

type ResolvedSidebarAnimation = {
  slide: boolean;
  slideDistance: number | string;
};

export type BoopAnimationState = {
  shouldAnimate: boolean;
  durationMs: number;
  easing: string;
  widget: ResolvedWidgetAnimation;
  sidebar: ResolvedSidebarAnimation;
  backdropEnabled: boolean;
  backdropFade: boolean;
};

export type BoopMotionStyles = {
  panelMotionStyle: React.CSSProperties;
  panelTransitionStyle: React.CSSProperties;
  overlayBaseStyle: React.CSSProperties;
  overlayBackdropStyle: React.CSSProperties;
  overlayTransitionStyle: React.CSSProperties;
};

type BuildMotionStylesInput = {
  mode: BoopPanelVariant;
  panelPlacement: BoopPanelPlacement;
  isVisible: boolean;
  animationState: BoopAnimationState;
  getStyle: (key: BoopStyleKey) => React.CSSProperties;
};

const formatDistance = (distance: number | string) =>
  typeof distance === "number" ? `${distance}px` : distance;

const buildTransform = (parts: Array<string | undefined>) => {
  const value = parts.filter(Boolean).join(" ");
  return value.length ? value : undefined;
};

export const resolveAnimationState = (
  animation?: BoopAnimationOptions,
  backdrop?: BoopBackdropOptions
): BoopAnimationState => {
  const animationEnabled = animation?.enabled ?? true;
  const durationMs = animation?.durationMs ?? 220;
  const easing = animation?.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)";
  const widget = {
    fade: true,
    slide: true,
    grow: true,
    slideDistance: 12,
    scale: 0.98,
    ...(animation?.widget ?? {})
  };
  const sidebar = {
    slide: true,
    slideDistance: "100%",
    ...(animation?.sidebar ?? {})
  };
  const backdropEnabled = backdrop?.enabled ?? true;
  const backdropFade = backdrop?.fade ?? true;
  const shouldAnimate = animationEnabled && durationMs > 0;

  return {
    shouldAnimate,
    durationMs,
    easing,
    widget,
    sidebar,
    backdropEnabled,
    backdropFade
  };
};

export const buildBoopMotionStyles = ({
  mode,
  panelPlacement,
  isVisible,
  animationState,
  getStyle
}: BuildMotionStylesInput): BoopMotionStyles => {
  const { shouldAnimate, durationMs, easing, widget, sidebar, backdropEnabled, backdropFade } =
    animationState;
  const panelTransition = shouldAnimate
    ? [
        (mode === "widget" && (widget.slide || widget.grow)) ||
        (mode !== "widget" && sidebar.slide)
          ? `transform ${durationMs}ms ${easing}`
          : null,
        mode === "widget" && widget.fade ? `opacity ${durationMs}ms ${easing}` : null
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;
  const widgetTransform = buildTransform([
    widget.slide
      ? `translateY(${formatDistance(isVisible ? 0 : widget.slideDistance)})`
      : undefined,
    widget.grow ? `scale(${isVisible ? 1 : widget.scale})` : undefined
  ]);
  const sidebarTransform = sidebar.slide
    ? `translateX(${isVisible ? "0" : formatDistance(sidebar.slideDistance)})`
    : undefined;
  const panelMotionStyle =
    mode === "widget"
      ? {
          ...(widget.fade ? { opacity: isVisible ? 1 : 0 } : {}),
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
      ? { transition: `background-color ${durationMs}ms ${easing}` }
      : {};

  return {
    panelMotionStyle,
    panelTransitionStyle,
    overlayBaseStyle,
    overlayBackdropStyle,
    overlayTransitionStyle
  };
};
