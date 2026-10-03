"use client";

import { useEffect, useRef, useState } from "react";
import { startHero } from "@/lib/hero-engine";
import { whenIdle } from "@/lib/idle";

// Where the photo is anchored when it's cropped (CSS object-position, as fractions).
const POSITION: [number, number] = [0.55, 0.25];

export default function HeroPortrait({ alt }: { alt: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    const begin = () => {
      if (cancelled) return;
      try {
        stop = startHero(canvas, {
          colorSrc: "/images/hero/johan.webp",
          dataSrc: "/images/hero/johan-data.webp",
          position: POSITION,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onReady: () => !cancelled && setLive(true),
        });
      } catch {
        stop = null;
      }
    };
    const cancelIdle = whenIdle(begin, 1500);
    return () => {
      cancelled = true;
      cancelIdle();
      stop?.();
    };
  }, []);

  return (
    <div className="hero-portrait" data-live={live || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero/johan-static.webp"
        alt={alt}
        width={2000}
        height={1333}
        fetchPriority="high"
        style={{ objectPosition: `${POSITION[0] * 100}% ${POSITION[1] * 100}%` }}
      />
      <canvas ref={ref} aria-hidden="true" />
    </div>
  );
}
