import type { Metadata } from 'next';
import '@fontsource/urbanist/400.css';
import '@fontsource/urbanist/500.css';
import '@fontsource/urbanist/600.css';
import '@fontsource/urbanist/700.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'BALI STORYTELLER — Discover Bali Through Local Eyes',
  description:
    'A curated, guide-first travel marketplace connecting international travelers with licensed, vetted Balinese local guides and cultural experiences.',
};

const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('bs:theme');
    document.documentElement.dataset.theme = (t === 'light' || t === 'dark') ? t : 'dark';
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased selection:bg-[#D8F36A] selection:text-[#141914] relative">
        {/* Cirrel 4-pool Liquid Glass Ambient Mesh (Green, Emerald, Lime, Gold — Zero Blue) */}
        <div className="cirrel-ambient-bg" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative z-10 w-full max-w-full overflow-x-clip">{children}</div>
      </body>
    </html>
  );
}
