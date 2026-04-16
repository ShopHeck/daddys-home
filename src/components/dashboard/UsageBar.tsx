"use client";

import { useEffect, useState } from "react";

type UsageBarProps = {
  usagePercent: number;
  colorClass: string;
};

export function UsageBar({ usagePercent, colorClass }: UsageBarProps) {
  const [width, setWidth] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setWidth(usagePercent);
      return;
    }

    const rafId = requestAnimationFrame(() => {
      setWidth(usagePercent);
    });

    return () => cancelAnimationFrame(rafId);
  }, [usagePercent, prefersReducedMotion]);

  return (
    <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-slate-900">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{
          width: `${width}%`,
          transition: prefersReducedMotion
            ? "none"
            : "width 800ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
