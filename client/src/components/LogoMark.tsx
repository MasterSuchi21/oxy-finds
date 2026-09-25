/** Simple static mark — no animation, no glow. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="#fafafa" />
      <circle cx="16" cy="16" r="7" stroke="#09090b" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="16" r="2.5" fill="#09090b" />
    </svg>
  );
}
