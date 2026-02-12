import { useCallback, useEffect, useRef, useState } from "react";

type UseBoopVisibilityOptions = {
  shouldAnimate: boolean;
  durationMs: number;
  onOpen?: () => void;
  onClose?: () => void;
};

export const useBoopVisibility = ({
  shouldAnimate,
  durationMs,
  onOpen,
  onClose
}: UseBoopVisibilityOptions) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationTimeoutRef = useRef<number | undefined>(undefined);

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
        }, durationMs);
      }
    },
    [durationMs, shouldAnimate]
  );

  const open = useCallback(() => {
    setVisibility(true);
    onOpen?.();
  }, [onOpen, setVisibility]);

  const close = useCallback(() => {
    setVisibility(false);
    onClose?.();
  }, [onClose, setVisibility]);

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

  return {
    isRendered,
    isVisible,
    open,
    close
  };
};
