'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({
  compact = false,
  onHero = false,
}: {
  compact?: boolean;
  onHero?: boolean;
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('bs:theme', next);
    } catch {
      // ignore storage failure
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[12px] cursor-pointer transition-all ${
        onHero
          ? 'bg-white/14 text-white border border-white/20 hover:bg-white/22 backdrop-blur-md'
          : 'cirrel-btn-ghost text-[var(--ink)]'
      } ${compact ? 'h-9 w-9' : 'h-9 px-3 text-xs font-semibold'}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#D8F36A]" />
      ) : (
        <Moon className={`w-4 h-4 ${onHero ? 'text-white' : 'text-[#344B35]'}`} />
      )}
      {!compact && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
