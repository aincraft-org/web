import { Box, Text, VisuallyHidden } from '@chakra-ui/react';

const WIDTH = 720;
const HEIGHT = 220;
const PAD_X = 10;
const PAD_Y = 14;

export function formatEmeralds(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export interface TrendPoint {
  timestamp: string;
  price: number;
}

interface TrendChartProps {
  name: string;
  points: TrendPoint[];
}

export function TrendChart({ name, points }: TrendChartProps) {
  const prices = points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const latest = prices[prices.length - 1];
  const spread = max - min || 1;
  const coords = points.map((point, index) => {
    const x = points.length > 1 ? PAD_X + (index * (WIDTH - PAD_X * 2)) / (points.length - 1) : WIDTH / 2;
    const y = HEIGHT - PAD_Y - ((point.price - min) / spread) * (HEIGHT - PAD_Y * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const polyline = coords.join(' ');

  const labelForPoint = (point: TrendPoint): string => {
    const date = new Date(point.timestamp);
    const stamp = Number.isNaN(date.getTime())
      ? point.timestamp
      : new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
    return `${stamp} — ${formatEmeralds(point.price)} emeralds`;
  };

  return (
    <Box data-testid="market-trend" role="group" aria-label={`Trend chart for ${name}`} w="100%">
      <VisuallyHidden>
        <ul>
          {points.map((point, index) => (
            <li key={index}>{labelForPoint(point)}</li>
          ))}
        </ul>
      </VisuallyHidden>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="presentation"
        aria-hidden="true"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="#d8f26b"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point, index) => {
          const [cx, cy] = coords[index].split(',');
          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r="3"
              fill={index === points.length - 1 ? '#83d4c0' : 'transparent'}
              stroke="#d8f26b"
              strokeWidth="1"
            >
              <title>{labelForPoint(point)}</title>
            </circle>
          );
        })}
        <circle
          cx={coords[coords.length - 1].split(',')[0]}
          cy={coords[coords.length - 1].split(',')[1]}
          r="4"
          fill="#83d4c0"
        />
      </svg>
      <Text as="p" color="muted" fontSize="sm" mt={3}>
        <Text as="span" fontWeight="medium" color="paper.deep">
          {name}
        </Text>{' '}
        — 24h: low {formatEmeralds(min)}, high {formatEmeralds(max)},
        latest {formatEmeralds(latest)}{' '}
        {points[0]
          ? (() => {
              const date = new Date(points[0].timestamp);
              const label = Number.isNaN(date.getTime()) ? points[0].timestamp : date.toISOString().slice(0, 10);
              return `(from ${label})`;
            })()
          : ''}
      </Text>
    </Box>
  );
}
