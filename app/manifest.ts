import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Andwell Innovation Command Center',
    short_name: 'Andwell CIC',
    description: 'Competitive intelligence, growth planning, and board-ready strategy for Andwell Health Partners.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e27',
    theme_color: '#0a0e27',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
