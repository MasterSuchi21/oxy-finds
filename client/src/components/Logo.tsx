import { LogoMark } from './LogoMark';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 28 : 34} />
      <span className="flex items-baseline gap-1 font-display leading-none">
        <span className={`font-bold tracking-tight text-frost ${compact ? 'text-sm' : 'text-lg'}`}>
          Oxy
        </span>
        <span className={`font-bold tracking-tight text-brand-gradient ${compact ? 'text-sm' : 'text-lg'}`}>
          Finds
        </span>
      </span>
    </span>
  );
}
