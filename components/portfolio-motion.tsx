"use client";

import { useRef, type ReactNode } from "react";
import {
  LazyMotion,
  domAnimation,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import * as m from "motion/react-m";

export function PortfolioMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ y: 0 }}
      whileInView={reduce ? {} : { y: [20, 0] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </m.div>
  );
}

export function ScrollArtwork({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  return (
    <div ref={ref} className={className}>
      <m.div
        className="artwork-motion"
        style={reduce ? undefined : { y, rotate }}
      >
        {children}
      </m.div>
    </div>
  );
}

export function ScrollWorkItem({
  children,
  onEnter,
}: {
  children: ReactNode;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);
  return (
    <div ref={ref} className="relative">
      <m.div
        className="work-motion"
        style={reduce ? undefined : { scale, y }}
        onViewportEnter={onEnter}
        viewport={{ amount: 0.55 }}
      >
        {children}
      </m.div>
    </div>
  );
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <m.div
      aria-hidden="true"
      className="reading-progress"
      style={{ scaleX: scrollYProgress, originX: 0 }}
    />
  );
}
