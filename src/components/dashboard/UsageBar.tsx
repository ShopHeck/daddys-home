"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type UsageBarProps = {
  usagePercent: number;
  colorClass: string;
};

export function UsageBar({ usagePercent, colorClass }: UsageBarProps) {
  const [width, setWidth] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

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
