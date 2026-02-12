import { DEFAULT_BUTTON_FIXED_OFFSET, DEFAULT_WIDGET_GAP } from "./constants";
import type {
  BoopButtonPlacement,
  BoopFixedOffset,
  BoopPanelPlacement,
  BoopPanelVariant
} from "./types";

type ResolvePanelPlacementInput = {
  mode: BoopPanelVariant;
  rawPanelPlacement?: BoopPanelPlacement;
  rawPanelFixedOffset?: BoopFixedOffset;
  buttonPlacement: BoopButtonPlacement;
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

export const resolvePanelPlacement = ({
  mode,
  rawPanelPlacement,
  rawPanelFixedOffset,
  buttonPlacement
}: ResolvePanelPlacementInput): BoopPanelPlacement => {
  if (mode !== "widget") {
    return rawPanelPlacement ?? "center";
  }

  if (rawPanelPlacement) {
    return rawPanelPlacement;
  }

  return rawPanelFixedOffset || buttonPlacement === "fixed" ? "fixed" : "center";
};

export const resolvePanelFixedOffset = (
  panelOffset: BoopFixedOffset | undefined,
  buttonOffset: BoopFixedOffset | undefined
): BoopFixedOffset =>
  panelOffset ?? addOffsetGap(resolveBaseButtonOffset(buttonOffset), DEFAULT_WIDGET_GAP);
