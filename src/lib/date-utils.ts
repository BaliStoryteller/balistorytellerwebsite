export function formatShortDate(iso?: string): string {
  if (!iso) return 'Open';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortWindow(from?: string, until?: string): string {
  const fmt = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };
  if (from && until) return `${fmt(from)} – ${fmt(until)}`;
  if (from) return `From ${fmt(from)}`;
  if (until) return `Until ${fmt(until)}`;
  return 'Year-round';
}
