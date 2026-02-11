import { describe, expect, it } from "vitest";
import type { BoopStyleKey } from "../types";
import { buildBoopMotionStyles, resolveAnimationState } from "../animation";

const getStyle = (key: BoopStyleKey) => {
  if (key === "overlayCenter") {
    return { backgroundColor: "rgba(0, 0, 0, 0.4)" };
  }
  if (key === "overlay") {
    return { backgroundColor: "rgba(0, 0, 0, 0.6)" };
  }
  return {};
};

describe("resolveAnimationState", () => {
  it("disables animation when enabled is false", () => {
    const state = resolveAnimationState({ enabled: false });
    expect(state.shouldAnimate).toBe(false);
  });

  it("disables animation when duration is zero", () => {
    const state = resolveAnimationState({ durationMs: 0 });
    expect(state.shouldAnimate).toBe(false);
  });
});

describe("buildBoopMotionStyles", () => {
  it("builds widget motion styles with opacity and transform", () => {
    const animationState = resolveAnimationState();
    const styles = buildBoopMotionStyles({
      mode: "widget",
      panelPlacement: "center",
      isVisible: false,
      animationState,
      getStyle
    });

    expect(styles.panelMotionStyle.opacity).toBe(0);
    expect(styles.panelMotionStyle.transform).toContain("translateY(12px)");
    expect(styles.panelMotionStyle.transform).toContain("scale(0.98)");
    expect(styles.overlayBackdropStyle.backgroundColor).toBe("transparent");
  });

  it("builds sidebar motion styles with translateX", () => {
    const animationState = resolveAnimationState({
      sidebar: { slideDistance: 300 }
    });
    const styles = buildBoopMotionStyles({
      mode: "sidebar",
      panelPlacement: "center",
      isVisible: false,
      animationState,
      getStyle
    });

    expect(styles.panelMotionStyle.transform).toContain("translateX(300px)");
  });
});
