"use client";

import { useEffect, useState } from "react";
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
            />
            <span className="project-open" aria-hidden="true">
              <Maximize2 size={20} />
            </span>
          </button>
        </DialogTrigger>
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
          <img
            src={images[current]}
            alt={`${title} — ${copy.image} ${current + 1}`}
            className="max-h-[70dvh] w-full object-contain"
          />
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
                <img
                  src={image}
                  alt=""
                  width={176}
                  height={116}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
