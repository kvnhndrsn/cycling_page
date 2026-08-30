import { pathForRun } from '../../utils/geoUtils';
import type { Activity } from '../../utils/utils';
import styles from './style.module.css';

interface IRunRouteIconProperties {
  run: Activity;
}

const SIZE = 48;
const PAD = 6;

const RunRouteIcon = ({ run }: IRunRouteIconProperties) => {
  const path = pathForRun(run);

  if (path.length < 2) {
    return (
      <span className={styles.routeIconEmpty} title="No route data">
        —
      </span>
    );
  }

  const minLng = Math.min(...path.map((p) => p[0]));
  const maxLng = Math.max(...path.map((p) => p[0]));
  const minLat = Math.min(...path.map((p) => p[1]));
  const maxLat = Math.max(...path.map((p) => p[1]));
  const spanLng = maxLng - minLng || 1e-9;
  const spanLat = maxLat - minLat || 1e-9;
  const draw = SIZE - 2 * PAD;

  const toX = (lng: number) => PAD + ((lng - minLng) / spanLng) * draw;
  const toY = (lat: number) => PAD + ((maxLat - lat) / spanLat) * draw;

  const d = path
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${toX(p[0]).toFixed(2)} ${toY(p[1]).toFixed(2)}`
    )
    .join(' ');

  const start = path[0];
  const end = path[path.length - 1];

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={styles.routeIcon}
      width={SIZE}
      height={SIZE}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle
        cx={toX(start[0])}
        cy={toY(start[1])}
        r="2"
        fill="#2ecc71"
        stroke="var(--color-background)"
        strokeWidth="0.8"
      />
      <circle
        cx={toX(end[0])}
        cy={toY(end[1])}
        r="2"
        fill="#e74c3c"
        stroke="var(--color-background)"
        strokeWidth="0.8"
      />
    </svg>
  );
};

export default RunRouteIcon;
