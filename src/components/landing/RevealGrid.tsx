"use client";

import { useEffect, useRef, useState, Children, cloneElement, isValidElement, type ReactElement, type ReactNode, type CSSProperties } from "react";

type RevealGridProps = {
  children: ReactNode;
  className?: string;
};

type ElementProps = {
  className?: string;
  style?: CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function RevealGrid({ children, className }: RevealGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setIsVisible(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (!mounted || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const childrenArray = Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      <style>{`
        @keyframes reveal-item {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .reveal-item {
          opacity: 0;
        }
        .reveal-item.revealed {
          animation: reveal-item 400ms ease-out forwards;
          animation-delay: calc(var(--index, 0) * 60ms);
        }
      `}</style>
      {childrenArray.map((child, index) => {
        if (!isValidElement(child)) return child;
        const childProps = child.props as ElementProps;
        const existingClassName = childProps?.className || "";
        const newClassName = `${existingClassName} reveal-item ${isVisible ? "revealed" : ""}`.trim();
        const existingStyle = childProps?.style || {};
        const newStyle: CSSProperties = {
          ...existingStyle,
          "--index": index,
        } as CSSProperties;

        return cloneElement(child as ReactElement<ElementProps>, {
          className: newClassName,
          style: newStyle,
        });
      })}
    </div>
  );
}
