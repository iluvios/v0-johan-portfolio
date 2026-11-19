export default function AgencyBrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5 text-foreground">
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="26"
          height="26"
          rx="7"
          stroke="hsl(var(--border))"
          fill="hsl(var(--card))"
        />
        <path
          d="M15.8 5.5L8.5 15.2H13.7L12.2 22.5L19.5 12.8H14.3L15.8 5.5Z"
          fill="url(#energy-bolt)"
        />
        <defs>
          <linearGradient
            id="energy-bolt"
            x1="8.5"
            y1="5.5"
            x2="19.5"
            y2="22.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <span className="flex items-baseline gap-1 font-display text-lg font-medium tracking-[-0.04em]">
        <span>Energy</span>
        <span className="text-accent">Media</span>
      </span>
    </span>
  );
}
