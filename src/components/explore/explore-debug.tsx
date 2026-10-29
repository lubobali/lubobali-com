"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// TEMPORARY (2026-10-29): Explore shows only the search bar on Lubo's iPad
// mini, and a test browser can't reproduce it. With ?debug in the URL this
// prints the real sizes on the device. Remove once the iPad bug is fixed.
// Only with ?debug (never in Lighthouse: a box on every staging page
// pushed the home LCP over budget, CI 147): one box on the page, one in
// the open panel.
const debugOn = () => typeof location !== "undefined" && location.search.includes("debug");

export function ExploreDebug({ where }: { where: "page" | "panel" }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!debugOn()) return; // renders nothing on the live site
    const h = (el: Element | null | undefined) => (el ? Math.round(el.getBoundingClientRect().height) : -1);
    const measure = () => {
      const d = document.querySelector<HTMLDialogElement>("dialog.explore-dialog");
      const cs = d ? getComputedStyle(d) : null;
      const vv = window.visualViewport;
      setLines([
        `BUILD ipad-debug-6 | ${where} | dialog open: ${!!d?.open}`,
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
    // The only part of the panel visible on the iPad is the search bar,
    // so the key numbers also go into its placeholder and the tab title.
    const short = () => {
      const d = document.querySelector<HTMLDialogElement>("dialog.explore-dialog");
      const input = d?.querySelector("input");
      if (!d || !input) return;
      const kids = [...(d.querySelector(".explore-panel")?.children ?? [])].map((k) => Math.round(k.getBoundingClientRect().height)).join(",");
      const vv = window.visualViewport;
      const txt = `D${Math.round(d.getBoundingClientRect().height)} M${getComputedStyle(d).maxHeight} K[${kids}] W${innerHeight} V${vv ? Math.round(vv.height) : "-"} F${document.activeElement?.tagName}`;
      input.placeholder = txt;
      document.title = txt;
    };
    const t = setInterval(() => {
      measure();
      short();
    }, 700);
    measure();
    return () => clearInterval(t);
  }, [where]);

  if (!lines.length) return null;
  return createPortal(
    <pre
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        ...(where === "page" ? { bottom: 8 } : { top: 140 }),
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
    </pre>,
    where === "page" ? document.body : (document.querySelector("dialog.explore-dialog") ?? document.body),
  );
}
