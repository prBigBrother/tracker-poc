import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Location Tracker',
    short_name: 'Tracker',
    description: 'Real-time GPS tracking on Google Maps',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1220',
    theme_color: '#0ea5e9',
    icons: [
      // Prefer PNGs; falling back to existing assets
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    id: '/?source=pwa',
    categories: ['navigation', 'utilities', 'productivity'],
    prefer_related_applications: false,
  };
}
