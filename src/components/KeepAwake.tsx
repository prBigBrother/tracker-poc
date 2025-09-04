'use client';

import { useEffect, useRef } from 'react';

/**
 * Keeps the screen awake while the app is visible.
 * - Uses the Screen Wake Lock API when available.
 * - Requests on the first user interaction (required by some browsers).
 * - Re-acquires on visibility/orientation changes.
 */
export default function KeepAwake() {
  const wakeLockRef = useRef<any | null>(null);
  const enabledRef = useRef(false);

  const requestWakeLock = async () => {
    try {
      const wl = await (navigator as any).wakeLock?.request('screen');
      if (!wl) return; // Not supported
      wakeLockRef.current = wl;
      wl.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Ignore errors (e.g., denied, not allowed without gesture)
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release?.();
    } catch {
      // ignore
    } finally {
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    // Only run in browsers
    if (typeof window === 'undefined') return;

    const onFirstInteract = () => {
      if (enabledRef.current) return;
      enabledRef.current = true;
      requestWakeLock();
      // After first enable, remove these bootstrapping listeners
      window.removeEventListener('pointerdown', onFirstInteract, { capture: true } as any);
      window.removeEventListener('keydown', onFirstInteract, { capture: true } as any);
    };

    // Bootstrap: wait for a user gesture to request wake lock
    window.addEventListener('pointerdown', onFirstInteract, { capture: true } as any);
    window.addEventListener('keydown', onFirstInteract, { capture: true } as any);

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        // Re-acquire when tab becomes visible again
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    const onOrientation = () => {
      if (!enabledRef.current) return;
      // Some browsers release on orientation change; attempt to re-acquire
      requestWakeLock();
    };

    try {
      (screen as any).orientation?.addEventListener?.('change', onOrientation);
    } catch {
      // orientation API may not exist
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      try {
        (screen as any).orientation?.removeEventListener?.('change', onOrientation);
      } catch {}
      try {
        window.removeEventListener('pointerdown', onFirstInteract, { capture: true } as any);
        window.removeEventListener('keydown', onFirstInteract, { capture: true } as any);
      } catch {}
      releaseWakeLock();
    };
  }, []);

  return null;
}

