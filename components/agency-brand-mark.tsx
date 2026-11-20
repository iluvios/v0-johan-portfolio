import Image from "next/image";

// Energy Media logo (bars mark with a white wordmark for the dark site).
// Source files, trimmed and on transparent backgrounds, live in public/media/brand.
export default function AgencyBrandMark({ className = "agency-logo" }: { className?: string }) {
  return (
    <Image
      src="/media/brand/energy-media-logo-white.png"
      alt="Energy Media"
      width={900}
      height={225}
      priority
      className={className}
    />
  );
}
