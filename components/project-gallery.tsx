"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Pause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePortfolioCopy } from "@/lib/portfolio";
import { isVideoUrl } from "@/lib/media";

/** Height / width above which a screenshot (full landing page, email) scrolls instead of shrinking. */
const TALL_RATIO = 1.2;
const AUTO_SCROLL_DELAY_MS = 1500;
const AUTO_SCROLL_PX_PER_SECOND = 60;

export default function ProjectGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const { copy } = usePortfolioCopy();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const count = images.length;
  const current = Math.min(index, Math.max(0, count - 1));
  const [tall, setTall] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentImage = images[current];
  const isTall = Boolean(tall[currentImage]);

  function measure(src: string, img: HTMLImageElement) {
    if (!img.naturalWidth) return;
    const isTallImage = img.naturalHeight / img.naturalWidth > TALL_RATIO;
    setTall((prev) => (prev[src] === isTallImage ? prev : { ...prev, [src]: isTallImage }));
  }

  // Large screenshots take a while to finish downloading; their size is known much earlier.
  useEffect(() => {
    if (!currentImage || isVideoUrl(currentImage) || currentImage in tall) return;
    const probe = new Image();
    probe.src = currentImage;
    const timer = window.setInterval(() => {
      if (probe.naturalWidth) {
        clearInterval(timer);
        measure(currentImage, probe);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [currentImage, tall]);

  // Tall screenshots start at the top, then drift down slowly until the visitor scrolls themselves.
  useEffect(() => {
    const frame = scrollRef.current;
    if (!frame) return;
    frame.scrollTop = 0;
    if (!isTall || reduce || open) return;
    let raf = 0;
    let last = 0;
    let position = 0;
    let stopped = false;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
    const step = (time: number) => {
      if (stopped) return;
      if (last) {
        position += ((time - last) / 1000) * AUTO_SCROLL_PX_PER_SECOND;
        frame.scrollTop = position;
      }
      last = time;
      if (position < frame.scrollHeight - frame.clientHeight) raf = requestAnimationFrame(step);
    };
    const start = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, AUTO_SCROLL_DELAY_MS);
    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    events.forEach((name) => frame.addEventListener(name, stop, { passive: true }));
    return () => {
      clearTimeout(start);
      stop();
      events.forEach((name) => frame.removeEventListener(name, stop));
    };
  }, [currentImage, isTall, reduce, open]);

  useEffect(() => {
    if (!playing || open || reduce || count < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % count);
    }, 4000);
    const stopWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", stopWhenHidden);
    };
  }, [playing, open, reduce, count]);

  function move(amount: number) {
    setPlaying(false);
    setIndex((value) => (value + amount + count) % count);
  }
  if (!count) return null;
  const controls = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={copy.previous}
        onClick={() => move(-1)}
      >
        <ChevronLeft />
      </Button>
      <span
        className="min-w-14 text-center text-sm text-muted-foreground"
        aria-live="polite"
      >
        {current + 1} / {count}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={copy.next}
        onClick={() => move(1)}
      >
        <ChevronRight />
      </Button>
    </div>
  );

  return (
    <section aria-label={copy.gallery}>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          setPlaying(false);
        }}
      >
        {isVideoUrl(images[current]) ? (
          <div className="gallery-main">
            <video
              key={images[current]}
              src={images[current]}
              controls
              playsInline
              preload="metadata"
              aria-label={`${title} — ${copy.image} ${current + 1}`}
              onPlay={() => setPlaying(false)}
            />
          </div>
        ) : isTall ? (
          <div className="gallery-main">
            <div
              ref={scrollRef}
              className="gallery-scroll"
              tabIndex={0}
              aria-label={`${title} — ${copy.image} ${current + 1}`}
            >
              <img
                src={currentImage}
                alt={`${title} — ${copy.image} ${current + 1}`}
                decoding="async"
                onLoad={(e) => measure(currentImage, e.currentTarget)}
              />
            </div>
            <DialogTrigger asChild>
              <button type="button" className="project-open" aria-label={`${copy.zoom}: ${title}`}>
                <Maximize2 size={20} />
              </button>
            </DialogTrigger>
          </div>
        ) : (
          <DialogTrigger asChild>
            <button
              type="button"
              className="gallery-main"
              aria-label={`${copy.zoom}: ${title}`}
            >
              <img
                src={images[current]}
                alt={`${title} — ${copy.image} ${current + 1}`}
                width={1600}
                height={1000}
                decoding="async"
                onLoad={(e) => measure(currentImage, e.currentTarget)}
              />
              <span className="project-open" aria-hidden="true">
                <Maximize2 size={20} />
              </span>
            </button>
          </DialogTrigger>
        )}
        <DialogContent
          closeLabel={copy.close}
          className="w-[calc(100%-1.5rem)] max-w-7xl max-h-[95dvh] overflow-y-auto"
          onKeyDown={(event) => {
            if (count > 1 && event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
            if (count > 1 && event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
          }}
        >
          <DialogTitle className="pr-12">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {copy.gallery}
          </DialogDescription>
          {isVideoUrl(images[current]) ? (
            <video
              key={images[current]}
              src={images[current]}
              controls
              playsInline
              preload="metadata"
              className="max-h-[70dvh] w-full"
            />
          ) : (
            <img
              src={images[current]}
              alt={`${title} — ${copy.image} ${current + 1}`}
              className={isTall ? "w-full" : "max-h-[70dvh] w-full object-contain"}
            />
          )}
          {count > 1 && <div className="flex justify-center">{controls}</div>}
        </DialogContent>
      </Dialog>
      {count > 1 && (
        <>
          <div className="gallery-controls">
            {controls}
            {!reduce && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                aria-pressed={playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? (
                  <Pause data-icon="inline-start" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                {playing ? copy.pause : copy.play}
              </Button>
            )}
          </div>
          <div className="gallery-thumbnails">
            {images.map((image, i) => (
              <button
                type="button"
                key={image}
                className="gallery-thumbnail"
                aria-label={`${copy.image} ${i + 1}`}
                aria-pressed={i === current}
                onClick={() => {
                  setPlaying(false);
                  setIndex(i);
                }}
              >
                {isVideoUrl(image) ? (
                  <video src={image} muted playsInline preload="metadata" />
                ) : (
                  <img
                    src={image}
                    alt=""
                    className={tall[image] ? "object-top" : undefined}
                    onLoad={(e) => measure(image, e.currentTarget)}
                    width={176}
                    height={116}
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
