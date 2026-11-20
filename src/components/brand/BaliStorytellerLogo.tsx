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
  const filterClass =
    variant === 'light'
      ? 'brightness-0 invert'
      : variant === 'dark'
      ? ''
      : '[filter:var(--logo-filter)]';

  const sizeClass = compact
    ? 'h-[21px] sm:h-[24px] w-auto'
    : 'h-[24px] sm:h-[29px] w-auto';

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/bali-storyteller-logo.png"
        alt="Bali Storyteller"
        width={941}
        height={170}
        decoding="async"
        className={`${sizeClass} object-contain shrink-0 transition-[height,filter] duration-200 ${filterClass}`}
      />
    </span>
  );
}
