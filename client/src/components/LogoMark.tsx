/** Oxy Finds mark — magnifying glass on brand gradient. */
export function LogoMark({ size = 34 }: { size?: number }) {
  const id = 'oxyfinds-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="9" fill={`url(#${id})`} />
      <circle cx="15" cy="15" r="6.5" stroke="white" strokeWidth="2.2" fill="none" opacity="0.95" />
      <path
        d="M20 20l5.5 5.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="15" cy="15" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}
