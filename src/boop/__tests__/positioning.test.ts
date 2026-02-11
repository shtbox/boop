import { describe, expect, it } from "vitest";
import { DEFAULT_BUTTON_FIXED_OFFSET, DEFAULT_WIDGET_GAP } from "../constants";
import { resolvePanelFixedOffset, resolvePanelPlacement } from "../positioning";

describe("resolvePanelPlacement", () => {
  it("returns raw placement for non-widget modes", () => {
    expect(
      resolvePanelPlacement({
        mode: "sidebar",
        rawPanelPlacement: "fixed",
        buttonPlacement: "inline"
      })
    ).toBe("fixed");
  });

  it("defaults to fixed placement for widgets with fixed buttons", () => {
    expect(
      resolvePanelPlacement({
        mode: "widget",
        buttonPlacement: "fixed"
      })
    ).toBe("fixed");
  });
});

describe("resolvePanelFixedOffset", () => {
  it("returns the panel offset when provided", () => {
    expect(resolvePanelFixedOffset({ right: 8 }, { right: 16 })).toEqual({ right: 8 });
  });

  it("adds the widget gap to the resolved button offset", () => {
    const offset = resolvePanelFixedOffset(undefined, { right: 10, bottom: 10 });

    expect(offset.right).toBe(10 + DEFAULT_WIDGET_GAP);
    expect(offset.bottom).toBe(10 + DEFAULT_WIDGET_GAP);
    expect(offset.left).toBeUndefined();
    expect(offset.top).toBeUndefined();
    expect(DEFAULT_BUTTON_FIXED_OFFSET.right).toBeDefined();
  });
});
