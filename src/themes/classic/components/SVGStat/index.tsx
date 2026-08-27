import { lazy, Suspense, useEffect, useMemo } from 'react';
import { totalStat } from '@assets/index';
import { loadSvgComponent } from '../../utils/svgUtils';
import { initSvgColorAdjustments } from '../../utils/colorUtils';
import useActivities from '../../hooks/useActivities';
import { DIST_UNIT, M_TO_DIST, M_TO_ELEV } from '../../utils/utils';
import { convertMovingTime2Sec } from '../../utils/utils';
import { SHOW_ELEVATION_GAIN } from '../../utils/const';

// Lazy load both github.svg and grid.svg
const GithubSvg = lazy(() => loadSvgComponent(totalStat, './github.svg'));

const GridSvg = lazy(() => loadSvgComponent(totalStat, './grid.svg'));

const SVGStat = () => {
  const { activities } = useActivities();

  useEffect(() => {
    // Initialize SVG color adjustments when component mounts
    const timer = setTimeout(() => {
      initSvgColorAdjustments();
    }, 100); // Small delay to ensure SVG is rendered

    return () => clearTimeout(timer);
  }, []);

  const allTimeStats = useMemo(() => {
    const totalCount = activities.length;
    const totalDistance = activities.reduce((s, a) => s + (a.distance || 0), 0) / M_TO_DIST;
    const totalTimeSeconds = activities.reduce(
      (s, a) => s + convertMovingTime2Sec(a.moving_time),
      0
    );
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const totalTimeFormatted = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    const totalElevation = activities.reduce(
      (s, a) => s + (a.elevation_gain || 0),
      0
    ) * M_TO_ELEV;
    const maxDistance = Math.max(...activities.map((a) => a.distance || 0)) / M_TO_DIST;
    const avgDistance = totalDistance / totalCount;

    return { totalCount, totalDistance, totalTimeFormatted, totalElevation, maxDistance, avgDistance };
  }, [activities]);

  return (
    <div id="svgStat">
      <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">All-Time Summary</h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-[var(--color-muted)]">Rides</span>
            <p className="text-lg font-bold">{allTimeStats.totalCount}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Distance</span>
            <p className="text-lg font-bold">{allTimeStats.totalDistance.toFixed(1)} {DIST_UNIT}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Time</span>
            <p className="text-lg font-bold">{allTimeStats.totalTimeFormatted}</p>
          </div>
          {SHOW_ELEVATION_GAIN && (
            <div>
              <span className="text-[var(--color-muted)]">Elevation</span>
              <p className="text-lg font-bold">{allTimeStats.totalElevation.toFixed(0)} m</p>
            </div>
          )}
          <div>
            <span className="text-[var(--color-muted)]">Max</span>
            <p className="text-lg font-bold">{allTimeStats.maxDistance.toFixed(1)} {DIST_UNIT}</p>
          </div>
          <div>
            <span className="text-[var(--color-muted)]">Avg</span>
            <p className="text-lg font-bold">{allTimeStats.avgDistance.toFixed(1)} {DIST_UNIT}</p>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <GithubSvg className="github-svg mt-4 h-auto w-full" />
        <GridSvg className="grid-svg mt-4 h-auto w-full" />
      </Suspense>
    </div>
  );
};

export default SVGStat;
