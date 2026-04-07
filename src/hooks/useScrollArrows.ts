"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollArrows() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rafId = useRef(0);

  const update = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Watch for children being added/removed (async-loaded items)
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [update]);

  const scroll = useCallback((direction: "left" | "right", fraction = 0.75) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * fraction;
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }, []);

  return { scrollRef, canScrollLeft, canScrollRight, scroll };
}
