"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { startFlow, type FlowMode } from "@/lib/flow-engine";
import { whenIdle } from "@/lib/idle";

// The light field behind every public page: lively on the home page, calm elsewhere.
export default function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof startFlow>>(null);
  const [ready, setReady] = useState(false);
  const mode: FlowMode = usePathname() === "/" ? "full" : "calm";
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    // Start after the page is interactive, so the light never competes with content.
    const begin = () => {
      if (cancelled) return;
      try {
        engine.current = startFlow(canvas, {
          mode: modeRef.current,
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
        if (engine.current) setReady(true);
      } catch {
        engine.current = null;
      }
    };
    const cancelIdle = whenIdle(begin, 1200);
    return () => {
      cancelled = true;
      cancelIdle();
      engine.current?.stop();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setMode(mode);
  }, [mode]);

  return (
    <canvas
      ref={ref}
      className="flow-field"
      data-ready={ready || undefined}
      aria-hidden="true"
    />
  );
}
