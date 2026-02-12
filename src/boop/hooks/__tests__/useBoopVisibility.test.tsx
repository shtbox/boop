import React, { forwardRef, useImperativeHandle } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBoopVisibility } from "../useBoopVisibility";

type HookHandle = {
  open: () => void;
  close: () => void;
  getState: () => { isRendered: boolean; isVisible: boolean };
};

type HookHarnessProps = {
  shouldAnimate: boolean;
  durationMs: number;
  onOpen?: () => void;
  onClose?: () => void;
};

const HookHarness = forwardRef<HookHandle, HookHarnessProps>(
  ({ shouldAnimate, durationMs, onOpen, onClose }, ref) => {
    const { isRendered, isVisible, open, close } = useBoopVisibility({
      shouldAnimate,
      durationMs,
      onOpen,
      onClose
    });

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
        getState: () => ({ isRendered, isVisible })
      }),
      [close, isRendered, isVisible, open]
    );

    return null;
  }
);

HookHarness.displayName = "HookHarness";

describe("useBoopVisibility", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("toggles visibility immediately when animations are disabled", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const ref = React.createRef<HookHandle>();

    render(
      <HookHarness
        ref={ref}
        shouldAnimate={false}
        durationMs={200}
        onOpen={onOpen}
        onClose={onClose}
      />
    );

    act(() => {
      ref.current?.open();
    });

    expect(ref.current?.getState()).toEqual({ isRendered: true, isVisible: true });
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => {
      ref.current?.close();
    });

    expect(ref.current?.getState()).toEqual({ isRendered: false, isVisible: false });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses animation timing when enabled", () => {
    vi.useFakeTimers();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const ref = React.createRef<HookHandle>();

    render(<HookHarness ref={ref} shouldAnimate={true} durationMs={150} />);

    act(() => {
      ref.current?.open();
    });

    expect(ref.current?.getState()).toEqual({ isRendered: true, isVisible: true });

    act(() => {
      ref.current?.close();
    });

    expect(ref.current?.getState()).toEqual({ isRendered: true, isVisible: false });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(ref.current?.getState()).toEqual({ isRendered: false, isVisible: false });
  });

  it("closes on Escape key press", () => {
    const ref = React.createRef<HookHandle>();

    render(<HookHarness ref={ref} shouldAnimate={false} durationMs={150} />);

    act(() => {
      ref.current?.open();
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(ref.current?.getState()).toEqual({ isRendered: false, isVisible: false });
  });
});
