"use client";

import { useEffect, useMemo, useRef, useState } from 'react';

type TrackItem = {
  id: number;
  created_at: string; // ISO string
  lat: number;
  lng: number;
  source: string | null;
  accuracy: number | null;
};

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function LatestTracking() {
  const [items, setItems] = useState<TrackItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const mounted = useRef(true);

  const fetchLatest = async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/track/latest', { signal, cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!mounted.current) return;
      setItems(json.items || []);
      setError(null);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError('Failed to load');
    }
  };

  useEffect(() => {
    const c = new AbortController();
    fetchLatest(c.signal);
    const id = setInterval(() => {
      setTick((t) => t + 1);
      fetchLatest(c.signal);
    }, 60000);
    return () => {
      mounted.current = false;
      c.abort();
      clearInterval(id);
    };
  }, []);

  const content = useMemo(() => {
    if (items == null) {
      return (
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-100 rounded" />
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
          <div className="h-3 w-4/6 bg-gray-100 rounded" />
        </div>
      );
    }
    if (!items.length) {
      return <div className="text-sm text-gray-500">No tracking data yet.</div>;
    }
    return (
      <div className="-mx-2">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-2 py-2 w-28">Time</th>
              <th className="px-2 py-2">Coordinates</th>
              <th className="px-2 py-2 w-24">Source</th>
              <th className="px-2 py-2 w-24">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-gray-100 text-sm">
                <td className="px-2 py-2 whitespace-nowrap" title={new Date(it.created_at).toLocaleString()}>
                  {timeAgo(it.created_at)}
                </td>
                <td className="px-2 py-2 font-mono text-[13px] break-all">
                  {it.lat.toFixed(6)}, {it.lng.toFixed(6)}
                </td>
                <td className="px-2 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    it.source === 'gps'
                      ? 'bg-green-100 text-green-800'
                      : it.source === 'ip'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {it.source?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </td>
                <td className="px-2 py-2">
                  {typeof it.accuracy === 'number' ? `±${Math.round(it.accuracy)}m` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [items, tick]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Recent Tracking (last 20)</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1" /> Live
          </span>
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>
      {content}
    </div>
  );
}
