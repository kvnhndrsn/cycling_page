import { lazy, Suspense } from 'react';
import Stat from '../Stat';
import useActivities from '../../hooks/useActivities';
import type { Activity } from '../../utils/utils';
import { formatPace, convertMovingTime2Sec } from '../../utils/utils';
import useHover from '@core/hooks/useHover';
import { yearStats, githubYearStats } from '@assets/index';
import { loadSvgComponent } from '../../utils/svgUtils';
import { SHOW_ELEVATION_GAIN } from '../../utils/const';
import { DIST_UNIT, M_TO_DIST, M_TO_ELEV } from '../../utils/utils';

const yearSvgs = Object.fromEntries(
  Object.keys(yearStats).map((path) => [
    path,
    lazy(() => loadSvgComponent(yearStats, path)),
  ])
);

const githubYearSvgs = Object.fromEntries(
  Object.keys(githubYearStats).map((path) => [
    path,
    lazy(() => loadSvgComponent(githubYearStats, path)),
  ])
);

interface YearStatAccumulator {
  averageHeartRateTotal: number;
  heartRateNullCount: number;
  runCount: number;
  streak: number;
  totalDistance: number;
  totalElevationGain: number;
  totalMetersForPace: number;
  totalSecondsForPace: number;
  totalTimeSeconds: number;
  maxDistance: number;
}

interface YearStatSummary {
  averageHeartRate: string;
  averagePace: string;
  hasHeartRate: boolean;
  runCount: number;
  streak: number;
  totalDistance: number;
  totalElevationGain: string;
  totalTimeFormatted: string;
  maxDistance: number;
  avgDistance: number;
}

const createAccumulator = (): YearStatAccumulator => ({
  averageHeartRateTotal: 0,
  heartRateNullCount: 0,
  runCount: 0,
  streak: 0,
  totalDistance: 0,
  totalElevationGain: 0,
  totalMetersForPace: 0,
  totalSecondsForPace: 0,
  totalTimeSeconds: 0,
  maxDistance: 0,
});

const addRunToAccumulator = (
  accumulator: YearStatAccumulator,
  run: Activity
) => {
  accumulator.runCount += 1;
  accumulator.totalDistance += run.distance || 0;
  accumulator.totalElevationGain += run.elevation_gain || 0;
  accumulator.totalTimeSeconds += convertMovingTime2Sec(run.moving_time);
  accumulator.maxDistance = Math.max(accumulator.maxDistance, run.distance || 0);

  if (run.average_speed) {
    accumulator.totalMetersForPace += run.distance || 0;
    accumulator.totalSecondsForPace += (run.distance || 0) / run.average_speed;
  }

  if (run.average_heartrate) {
    accumulator.averageHeartRateTotal += run.average_heartrate;
  } else {
    accumulator.heartRateNullCount += 1;
  }

  if (run.streak) {
    accumulator.streak = Math.max(accumulator.streak, run.streak);
  }
};

const formatTotalTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

const finalizeYearStat = (
  accumulator: YearStatAccumulator
): YearStatSummary => {
  const heartRateCount = accumulator.runCount - accumulator.heartRateNullCount;

  return {
    averageHeartRate: (
      accumulator.averageHeartRateTotal / heartRateCount
    ).toFixed(0),
    averagePace: formatPace(
      accumulator.totalMetersForPace / accumulator.totalSecondsForPace
    ),
    hasHeartRate: accumulator.averageHeartRateTotal !== 0,
    runCount: accumulator.runCount,
    streak: accumulator.streak,
    totalDistance: parseFloat(
      (accumulator.totalDistance / M_TO_DIST).toFixed(1)
    ),
    totalElevationGain: (accumulator.totalElevationGain * M_TO_ELEV).toFixed(0),
    totalTimeFormatted: formatTotalTime(accumulator.totalTimeSeconds),
    maxDistance: parseFloat(
      (accumulator.maxDistance / M_TO_DIST).toFixed(1)
    ),
    avgDistance: parseFloat(
      (accumulator.totalDistance / M_TO_DIST / accumulator.runCount).toFixed(1)
    ),
  };
};

const yearStatCache = new WeakMap<Activity[], Map<string, YearStatSummary>>();

const getYearStatSummaries = (activityData: Activity[]) => {
  const cachedSummaries = yearStatCache.get(activityData);
  if (cachedSummaries) return cachedSummaries;

  const accumulators = new Map<string, YearStatAccumulator>();
  accumulators.set('Total', createAccumulator());

  activityData.forEach((run) => {
    const year = run.start_date_local.slice(0, 4);
    if (!accumulators.has(year)) {
      accumulators.set(year, createAccumulator());
    }
    addRunToAccumulator(accumulators.get('Total')!, run);
    addRunToAccumulator(accumulators.get(year)!, run);
  });

  const summaries = new Map(
    Array.from(accumulators, ([year, accumulator]) => [
      year,
      finalizeYearStat(accumulator),
    ])
  );
  yearStatCache.set(activityData, summaries);
  return summaries;
};

const YearStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { activities } = useActivities();
  // for hover
  const [hovered, eventHandlers] = useHover();
  // lazy Component
  const YearSVG = yearSvgs[`./year_${year}.svg`];
  const GithubYearSVG = githubYearSvgs[`./github_${year}.svg`];
  const summary = getYearStatSummaries(activities).get(year);

  if (!summary) return null;

  return (
    <div className="cursor-pointer" onClick={() => onClick(year)}>
      <section {...eventHandlers}>
        <Stat value={year} description=" Journey" />
        <Stat value={summary.runCount} description=" Rides" />
        <Stat value={summary.totalDistance} description={` ${DIST_UNIT}`} />
        {SHOW_ELEVATION_GAIN && (
          <Stat
            value={summary.totalElevationGain}
            description=" Elevation Gain"
          />
        )}
        <Stat value={summary.totalTimeFormatted} description=" Total Time" />
        <Stat value={summary.maxDistance} description={` Max ${DIST_UNIT}`} />
        <Stat value={summary.avgDistance} description={` Avg ${DIST_UNIT}/Ride`} />
        <Stat value={summary.averagePace} description=" Avg Speed" />
        <Stat value={`${summary.streak} day`} description=" Streak" />
        {summary.hasHeartRate && (
          <Stat
            value={summary.averageHeartRate}
            description=" Avg Heart Rate"
          />
        )}
      </section>
      {year !== 'Total' && YearSVG && (
        <Suspense fallback="loading...">
          <YearSVG className="year-svg my-2 h-1/4 w-1/4 border-0 p-0" />
        </Suspense>
      )}
      {year !== 'Total' && hovered && GithubYearSVG && (
        <Suspense fallback="loading...">
          <GithubYearSVG className="github-year-svg my-4 h-auto w-full border-0 p-0" />
        </Suspense>
      )}
      <hr />
    </div>
  );
};

export default YearStat;
