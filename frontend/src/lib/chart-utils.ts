export const CHART_COLORS = {
  primary: "#7c3aed",
  primaryLight: "#a78bfa",
  secondary: "#10b981",
  secondaryLight: "#34d399",
  tertiary: "#6366f1",
  quaternary: "#f59e0b",
  destructive: "#ef4444",
} as const;

export const CHART_DEFAULT_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  padding: "8px 12px",
  fontSize: "13px",
  lineHeight: "1.5",
} as const;

export const CHART_AXIS_STYLE = {
  fontSize: 12,
  fill: "var(--color-muted-foreground, #737373)",
} as const;

export const CHART_GRID_STYLE = {
  strokeDasharray: "3 3",
  stroke: "var(--color-muted, #f5f5f5)",
  strokeWidth: 1,
} as const;

export const SCORE_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Strong",
  average: "Meets Expectations",
  low: "Needs Improvement",
} as const;

export const SCORE_RANGES = [
  { name: "Excellent", min: 4.5, max: 5.0, key: "excellent" },
  { name: "Strong", min: 4.0, max: 4.5, key: "good" },
  { name: "Meets Expectations", min: 3.0, max: 4.0, key: "average" },
  { name: "Needs Improvement", min: 0, max: 3.0, key: "low" },
] as const;

export const CALL_TYPE_COLORS: Record<string, string> = {
  sales: "#6366f1",
  kickoff: "#10b981",
  coaching: "#a855f7",
  strategic_review: "#f97316",
} as const;

export const CHART_HEIGHTS = {
  sm: 220,
  md: 280,
  lg: 340,
  xl: 400,
} as const;

export type ChartTooltipPayloadEntry = {
  name: string;
  value: number | string;
  color?: string;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string;
};
