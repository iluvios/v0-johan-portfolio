"use client";

import { useReducedMotion } from "motion/react";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy } from "@/lib/portfolio";

const LINE = "M15 62 Q 46 6 78 46 Q 112 16 145 70";

// Movement: a parkour line hopping across three blocks.
function MovementGlyph({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 160 100" className="glyph glyph-movement" aria-hidden="true">
      <defs>
        <linearGradient id="glyph-line" x1="0" x2="1">
          <stop offset="0" stopColor="#5fe1f7" />
          <stop offset="1" stopColor="#ffc04d" />
        </linearGradient>
      </defs>
      <rect x="4" y="62" width="22" height="38" rx="2" />
      <rect x="66" y="46" width="24" height="54" rx="2" />
      <rect x="134" y="70" width="22" height="30" rx="2" />
      <path className="glyph-route" d={LINE} pathLength={100} />
      <path className="glyph-trace" d={LINE} pathLength={100} stroke="url(#glyph-line)" />
      <circle className="glyph-runner" r="3.4" cx={still ? 78 : 0} cy={still ? 46 : 0}>
        {!still && (
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path={LINE}
            calcMode="spline"
            keyPoints="0;1"
            keyTimes="0;1"
            keySplines="0.45 0 0.55 1"
          />
        )}
      </circle>
    </svg>
  );
}

// Creativity: white light in, a spectrum out.
function CreativityGlyph() {
  const beams = [
    { y: 28, color: "#5fe1f7" },
    { y: 44, color: "#7aa2ff" },
    { y: 60, color: "#ffc04d" },
    { y: 76, color: "#ff7a6e" },
  ];
  return (
    <svg viewBox="0 0 160 100" className="glyph glyph-creativity" aria-hidden="true">
      <path className="glyph-beam-in" d="M4 64 L66 52" pathLength={100} />
      {beams.map((beam, i) => (
        <path
          key={beam.y}
          className="glyph-beam"
          d={`M94 52 L156 ${beam.y}`}
          pathLength={100}
          stroke={beam.color}
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
      <path className="glyph-prism" d="M80 16 L106 82 L54 82 Z" />
    </svg>
  );
}

// An ensō as a filled brush stroke: heavy where the brush lands, thinning out at the end.
function enso() {
  const cx = 80;
  const cy = 50;
  const steps = 96;
  const start = (-72 * Math.PI) / 180;
  const sweep = (322 * Math.PI) / 180;
  const outer: string[] = [];
  const inner: string[] = [];
  const center: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    const r = 33 + 1.3 * Math.sin(a * 3 + 0.8);
    const w = 0.8 + 7.2 * Math.min(1, t / 0.07) * (1 - 0.72 * Math.pow(t, 1.4));
    const pt = (rr: number) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    outer.push(pt(r + w / 2));
    inner.unshift(pt(r - w / 2));
    center.push(pt(r));
  }
  return {
    shape: `M${outer.join(" L")} L${inner.join(" L")} Z`,
    line: `M${center.join(" L")}`,
  };
}
const ENSO = enso();

// Mind: the ensō paints itself, rests, and starts again.
function MindGlyph() {
  return (
    <svg viewBox="0 0 160 100" className="glyph glyph-mind" aria-hidden="true">
      <defs>
        <filter id="glyph-brush" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.5" />
        </filter>
        <mask id="glyph-enso-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="100">
          <path className="glyph-enso-reveal" d={ENSO.line} pathLength={100} />
        </mask>
      </defs>
      <path
        className="glyph-enso"
        d={ENSO.shape}
        mask="url(#glyph-enso-reveal)"
        filter="url(#glyph-brush)"
      />
    </svg>
  );
}

export default function OffTheClock() {
  const { copy } = usePortfolioCopy();
  const still = !!useReducedMotion();
  const glyphs = [
    <MovementGlyph key="movement" still={still} />,
    <CreativityGlyph key="creativity" />,
    <MindGlyph key="mind" />,
  ];
  return (
    <div className="off-clock">
      <p className="eyebrow">{copy.offClock}</p>
      <Reveal>
        <ul className="off-clock-grid">
          {copy.offItems.map((item, i) => (
            <li key={item.title} className="off-clock-item">
              {glyphs[i]}
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>
      <blockquote className="off-clock-quote">
        <p>“{copy.offQuote}”</p>
        <footer>Alan Watts</footer>
      </blockquote>
    </div>
  );
}
