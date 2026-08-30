import { useEffect, useMemo, useState } from 'react';
import useActivities from '../../hooks/useActivities';
import {
  DIST_UNIT,
  M_TO_DIST,
  M_TO_ELEV,
  convertMovingTime2Sec,
} from '../../utils/utils';
import { SHOW_ELEVATION_GAIN } from '../../utils/const';

import everystreetStatsUrl from '@/static/everystreet-stats.json?url';

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

const SummaryStats = () => {
  const { activities } = useActivities();
  const [esStats, setEsStats] = useState<EverystreetStats | null>(null);

  useEffect(() => {
    fetch(everystreetStatsUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then(setEsStats)
      .catch(() => {});
  }, []);

  const allTimeStats = useMemo(() => {
    const totalCount = activities.length;
    const totalDistance =
      activities.reduce((s, a) => s + (a.distance || 0), 0) / M_TO_DIST;
    const totalTimeSeconds = activities.reduce(
      (s, a) => s + convertMovingTime2Sec(a.moving_time),
      0
    );
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const totalTimeFormatted =
      hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    const totalElevation =
      activities.reduce((s, a) => s + (a.elevation_gain || 0), 0) * M_TO_ELEV;
    const maxDistance =
      Math.max(...activities.map((a) => a.distance || 0)) / M_TO_DIST;
    const avgDistance = totalDistance / totalCount;

    return {
      totalCount,
      totalDistance,
      totalTimeFormatted,
      totalElevation,
      maxDistance,
      avgDistance,
    };
  }, [activities]);

  return (
    <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:grid sm:grid-cols-2 sm:gap-x-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">
          All-Time Summary
        </h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-[var(--color-muted)]">Rides</span>
            <p className="text-lg font-bold">{allTimeStats.totalCount}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Distance</span>
            <p className="text-lg font-bold">
              {allTimeStats.totalDistance.toFixed(1)} {DIST_UNIT}
            </p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Time</span>
            <p className="text-lg font-bold">
              {allTimeStats.totalTimeFormatted}
            </p>
          </div>
          {SHOW_ELEVATION_GAIN && (
            <div>
              <span className="text-[var(--color-muted)]">Elevation</span>
              <p className="text-lg font-bold">
                {allTimeStats.totalElevation.toFixed(0)} m
              </p>
            </div>
          )}
          <div>
            <span className="text-[var(--color-muted)]">Max</span>
            <p className="text-lg font-bold">
              {allTimeStats.maxDistance.toFixed(1)} {DIST_UNIT}
            </p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Avg</span>
            <p className="text-lg font-bold">
              {allTimeStats.avgDistance.toFixed(1)} {DIST_UNIT}
            </p>
          </div>
        </div>
      </div>

      {esStats && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4 sm:mt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">
            Regina SK — Street Coverage
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-[var(--color-muted)]">Ridden</span>
              <p className="text-lg font-bold">{esStats.ridden_km} km</p>
            </div>
            <div>
              <span className="text-[var(--color-muted)]">Missing</span>
              <p className="text-lg font-bold">{esStats.missing_km} km</p>
            </div>
            <div>
              <span className="text-[var(--color-muted)]">Complete</span>
              <p className="text-lg font-bold">{esStats.pct_complete}%</p>
            </div>
          </div>
          <a
            href="/everystreet/map.html"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs text-[var(--color-accent)] hover:underline"
          >
            View full map ↗
          </a>
        </div>
      )}
    </div>
  );
};

export default SummaryStats;
