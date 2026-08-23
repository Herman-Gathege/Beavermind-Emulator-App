import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CHART_COLORS,
  CHART_DEFAULT_TOOLTIP_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  SCORE_RANGES,
  CALL_TYPE_COLORS,
  CHART_HEIGHTS,
} from "@/lib/chart-utils";

interface Call {
  id: string;
  type: string;
  title: string;
  scheduled_at: string;
  status: string;
  coach?: { name: string };
  client?: { name: string };
}

interface Evaluation {
  id: string;
  call_id: string;
  overall_score: number;
  created_at: string;
}

const CALL_TYPE_LABELS: Record<string, string> = {
  sales: "Sales Call",
  kickoff: "Kick-off Call",
  coaching: "Coaching Call",
  strategic_review: "Strategic Review",
};

export function AnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/calls").then((r) => {
        if (!r.ok) throw new Error(`Calls failed: ${r.status}`);
        return r.json();
      }),
      apiFetch("/evaluations").then((r) => {
        if (!r.ok) throw new Error(`Evaluations failed: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([callsData, evalsData]) => {
        setCalls(callsData);
        setEvaluations(evalsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const callTypeData = calls.reduce<Record<string, number>>((acc, call) => {
    acc[call.type] = (acc[call.type] || 0) + 1;
    return acc;
  }, {});

  const callTypeChartData = Object.entries(callTypeData).map(([type, count]) => ({
    name: CALL_TYPE_LABELS[type] || type.replace("_", " "),
    value: count,
    type,
  }));

  const scoreChartData = SCORE_RANGES.map((range) => {
    const count = evaluations.filter((e) => {
      const score = e.overall_score;
      return score >= range.min && score < range.max;
    }).length;
    return { name: range.name, count };
  });

  const coachPerformance = calls.reduce<Record<string, { calls: number; evaluated: number; avgScore: number[] }>>((acc, call) => {
    const name = call.coach?.name || "Unknown";
    if (!acc[name]) acc[name] = { calls: 0, evaluated: 0, avgScore: [] };
    acc[name].calls += 1;
    if (call.status === "evaluated") {
      acc[name].evaluated += 1;
      const ev = evaluations.find((e) => e.call_id === call.id);
      if (ev) acc[name].avgScore.push(ev.overall_score);
    }
    return acc;
  }, {});

  const coachChartData = Object.entries(coachPerformance).map(([name, data]) => ({
    name,
    calls: data.calls,
    evaluated: data.evaluated,
    avgScore: data.avgScore.length > 0 ? data.avgScore.reduce((a, b) => a + b, 0) / data.avgScore.length : 0,
  }));

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <div className="h-80 bg-muted rounded animate-pulse" />
          <div className="h-80 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">Unable to load analytics</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  const renderPieTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const item = props.payload[0];
    const percent = item.payload.percent ?? 0;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-sm"
        style={{
          backgroundColor: "hsl(var(--background))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <p className="font-medium">{item.name}</p>
        <p className="text-muted-foreground">
          {item.value} call{item.value === 1 ? "" : "s"} &middot; {(percent * 100).toFixed(0)}%
        </p>
      </div>
    );
  };

  const renderCoachTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const coach = coachChartData.find((c) => c.name === props.label);
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-sm"
        style={{
          backgroundColor: "hsl(var(--background))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <p className="font-medium mb-1">{props.label}</p>
        {props.payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
        {coach && coach.avgScore > 0 && (
          <div className="mt-1 pt-1 border-t border-muted text-xs text-muted-foreground">
            Avg score: {coach.avgScore.toFixed(1)} / 5
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Coaching performance insights
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Calls by Type
            </CardTitle>
            <CardDescription>Distribution across call categories</CardDescription>
          </CardHeader>
          <CardContent>
            {callTypeChartData.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed"
                style={{ height: CHART_HEIGHTS.md }}
              >
                <BarChart3 className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No call data available.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={CHART_HEIGHTS.sm}>
                  <PieChart>
                    <Pie
                      data={callTypeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {callTypeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CALL_TYPE_COLORS[entry.type] || CHART_COLORS.tertiary}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip as any} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                  {callTypeChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: CALL_TYPE_COLORS[entry.type] || CHART_COLORS.tertiary }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evaluation Score Distribution
            </CardTitle>
            <CardDescription>Scores grouped by performance level</CardDescription>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed"
                style={{ height: CHART_HEIGHTS.md }}
              >
                <TrendingUp className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No evaluations to display.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHTS.md}>
                <BarChart data={scoreChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_STYLE} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted, #f5f5f5)", radius: 4 }}
                    contentStyle={CHART_DEFAULT_TOOLTIP_STYLE}
                    formatter={(value: number) => [`${value} evaluation${value === 1 ? "" : "s"}`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.secondary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Coach Performance
            </CardTitle>
            <CardDescription>Call volume and evaluation coverage per coach</CardDescription>
          </CardHeader>
          <CardContent>
            {coachChartData.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed"
                style={{ height: CHART_HEIGHTS.md }}
              >
                <TrendingUp className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No evaluation data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHTS.md}>
                <BarChart data={coachChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_STYLE} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={renderCoachTooltip as any} />
                  <Bar
                    dataKey="calls"
                    fill={CHART_COLORS.tertiary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="evaluated"
                    fill={CHART_COLORS.secondary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
