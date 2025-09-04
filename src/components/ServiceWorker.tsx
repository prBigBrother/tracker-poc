"use client";

import { useEffect } from 'react';

export default function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        // Optionally, listen for updates and prompt user to refresh.
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Service worker registration failed:', err);
      }
    };

    // Register on page idle to avoid blocking TTI
    if ('requestIdleCallback' in window) {
      // @ts-ignore - requestIdleCallback exists in browsers
      window.requestIdleCallback(register);
    } else {
      setTimeout(register, 0);
    }
  }, []);

  return null;
}

