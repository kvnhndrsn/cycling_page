import { useState, useEffect } from 'react';

interface EverystreetStats {
  place: string;
  generated: string;
  rides: number;
  street_segments: number;
  total_km: number;
  ridden_km: number;
  missing_km: number;
  pct_complete: number;
}

import statsUrl from '@/static/everystreet-stats.json?url';

export default function EverystreetSection() {
  const [stats, setStats] = useState<EverystreetStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(statsUrl)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error || !stats) return null;

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (stats.pct_complete / 100) * circumference;

  return (
    <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition-all duration-300 hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/5 hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold">Regina SK — #everystreet</h2>
        <a
          href="/everystreet/"
          className="ml-auto text-xs text-[var(--color-accent)] hover:underline"
        >
          Full map →
        </a>
      </div>

      {/* Progress ring + key stats */}
      <div className="flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{stats.pct_complete}%</span>
            <span className="text-[10px] text-[var(--color-muted)]">complete</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--color-muted)]">Ridden</p>
            <p className="text-lg font-bold">{stats.ridden_km} km</p>
          </div>
          <div>
            <p className="text-[var(--color-muted)]">Missing</p>
            <p className="text-lg font-bold">{stats.missing_km} km</p>
          </div>
          <div>
            <p className="text-[var(--color-muted)]">Total</p>
            <p className="text-lg font-bold">{stats.total_km} km</p>
          </div>
          <div>
            <p className="text-[var(--color-muted)]">Rides</p>
            <p className="text-lg font-bold">{stats.rides}</p>
          </div>
        </div>
      </div>

      {/* Embedded map */}
      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--color-border)]">
        <iframe
          src="/everystreet/map.html"
          className="h-[500px] w-full border-0"
          loading="lazy"
          title="Everystreet Coverage Map"
        />
      </div>
    </div>
  );
}
