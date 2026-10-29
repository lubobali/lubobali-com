"use client";

import { useEffect, useState } from "react";

// TEMPORARY (2026-10-29): Explore shows only the search bar on Lubo's iPad
// mini, and a test browser can't reproduce it. With ?debug in the URL this
// prints the real sizes on the device. Remove once the iPad bug is fixed.
export function ExploreDebug({ dialog }: { dialog: React.RefObject<HTMLDialogElement | null> }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const h = (el: Element | null | undefined) => (el ? Math.round(el.getBoundingClientRect().height) : -1);
    const measure = () => {
      const d = dialog.current;
      const cs = d ? getComputedStyle(d) : null;
      const vv = window.visualViewport;
      setLines([
        `pointer fine: ${matchMedia("(pointer: fine)").matches} | coarse: ${matchMedia("(pointer: coarse)").matches} | any-fine: ${matchMedia("(any-pointer: fine)").matches}`,
        `hover: ${matchMedia("(hover: hover)").matches} | touch points: ${navigator.maxTouchPoints}`,
        `window: ${innerWidth} x ${innerHeight} | visual: ${vv ? `${Math.round(vv.width)} x ${Math.round(vv.height)}` : "none"} | zoom: ${vv ? vv.scale.toFixed(2) : "?"}`,
        `dialog: h=${h(d)} max-h=${cs?.maxHeight} h-css=${cs?.height} margin-top=${cs?.marginTop} top=${d ? Math.round(d.getBoundingClientRect().top) : -1}`,
        `panel: ${h(d?.querySelector(".explore-panel"))} | results: ${h(d?.querySelector(".explore-results"))} | hits: ${d?.querySelectorAll(".explore-results a").length ?? -1}`,
        `focus: ${document.activeElement?.tagName}.${(document.activeElement as HTMLElement | null)?.className?.toString().slice(0, 20)}`,
        `svh: ${CSS.supports("height", "100svh")} | dvh: ${CSS.supports("height", "100dvh")}`,
        `ua: ${navigator.userAgent.slice(0, 120)}`,
      ]);
    };
    const t = setInterval(measure, 700);
    measure();
    return () => clearInterval(t);
  }, [dialog]);

  return (
    <pre
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        top: 140,
        zIndex: 99,
        margin: 0,
        padding: 10,
        background: "#000",
        color: "#7CFC9A",
        font: "12px/1.45 ui-monospace, monospace",
        whiteSpace: "pre-wrap",
        borderRadius: 8,
        pointerEvents: "none",
      }}
    >
      {lines.join("\n")}
    </pre>
  );
}
