import { useState } from "preact/hooks";

export function useDragToResize(panel: { current: HTMLElement | null }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  function startResize(event: PointerEvent) {
    event.preventDefault();
    const rect = panel.current!.getBoundingClientRect();
    const handle = event.currentTarget as HTMLElement;
    const startX = event.clientX;
    const startY = event.clientY;
    const maxWidth = Math.max(260, rect.right - 12);
    const maxHeight = Math.max(300, rect.bottom - 12);
    // The panel is anchored to the right and bottom, so dragging left/up grows it.
    const move = (pointer: PointerEvent) =>
      setSize({
        width: Math.min(Math.max(rect.width + (startX - pointer.clientX), 260), maxWidth),
        height: Math.min(Math.max(rect.height + (startY - pointer.clientY), 300), maxHeight),
      });
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
    };
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  return { size, startResize };
}
