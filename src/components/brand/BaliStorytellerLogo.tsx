import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light' | 'auto';
  compact?: boolean;
  className?: string;
}

export function BaliStorytellerLogo({
  variant = 'auto',
  compact = false,
  className = '',
}: LogoProps) {
  const ink =
    variant === 'light'
      ? '#F7F5EF'
      : variant === 'dark'
      ? '#191A18'
      : 'var(--ink)';
  const accent =
    variant === 'light'
      ? '#D8F36A'
      : variant === 'dark'
      ? '#344B35'
      : 'var(--accent-ink)';
  const gold = '#B69A58';

  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="10"
          stroke={gold}
          strokeOpacity="0.65"
          strokeWidth="1.25"
        />
        {/* Balinese Candi Bentar split gate + lotus compass */}
        <path
          d="M11 26L14.5 11.5H16.6L16.2 26H11Z"
          fill={ink}
        />
        <path
          d="M25 26L21.5 11.5H19.4L19.8 26H25Z"
          fill={ink}
        />
        <circle cx="18" cy="9.5" r="2" fill={accent} />
        <path
          d="M12.5 27.5H23.5"
          stroke={gold}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className="font-serif-display text-[14px] sm:text-[17px] font-bold tracking-[0.09em] sm:tracking-[0.12em] uppercase whitespace-nowrap"
          style={{ color: ink }}
        >
          Bali Storyteller
        </span>
        {!compact && (
          <span
            className="hidden sm:block mt-0.5 text-[9px] font-medium tracking-[0.22em] uppercase opacity-75"
            style={{ color: ink }}
          >
            Discover Through Local Eyes
          </span>
        )}
      </span>
    </span>
  );
}
