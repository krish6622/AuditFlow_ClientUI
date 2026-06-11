import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Props {
  /** Series of values to plot. */
  data: number[];
  /** Stroke / fill colour (hex). */
  color: string;
  /** Unique id for the gradient def. */
  id: string;
  height?: number;
}

/** A minimal, self-drawing area sparkline for KPI cards. */
export function Sparkline({ data, color, id, height = 44 }: Props) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={false}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
