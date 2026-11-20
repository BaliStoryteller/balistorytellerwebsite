/**
 * Safely extracts an 11-character YouTube video ID from standard watch,
 * short youtu.be, shorts, or embed URLs. Returns null if invalid.
 */
export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    let candidate: string | null = null;
    if (host === 'youtu.be') {
      candidate = parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        candidate = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        candidate = parsed.pathname.split('/')[2] ?? null;
      } else if (parsed.pathname.startsWith('/shorts/')) {
        candidate = parsed.pathname.split('/')[2] ?? null;
      }
    }

    if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
      return candidate;
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = extractYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}
