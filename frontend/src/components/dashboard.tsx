import {
  BarChart3,
  Users,
  Phone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CHART_COLORS,
  CHART_DEFAULT_TOOLTIP_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  SCORE_LABELS,
  CHART_HEIGHTS,
} from "@/lib/chart-utils";

interface DashboardStats {
  total_calls: number;
  evaluated: number;
  pending: number;
  avg_score: number | null;
  total_coaches: number;
}

interface Call {
  id: string;
  type: string;
  title: string;
  scheduled_at: string;
  status: string;
}

interface Evaluation {
  id: string;
  call_id: string;
  overall_score: number;
  summary: string;
  created_at: string;
}

interface DashboardProps {
  stats: DashboardStats;
  recentEvaluations: Evaluation[];
  calls: Call[];
}

export function Dashboard({ stats, recentEvaluations, calls }: DashboardProps) {
  const callTypeData = calls.reduce<Record<string, number>>((acc, call) => {
    acc[call.type] = (acc[call.type] || 0) + 1;
    return acc;
  }, {});

  const callTypeChartData = Object.entries(callTypeData).map(([type, count]) => ({
    name: type.replace("_", " "),
    value: count,
  }));

  const scoreRanges = [
    { name: SCORE_LABELS.excellent, key: "excellent", min: 4.5, max: 5.0 },
    { name: SCORE_LABELS.good, key: "good", min: 4.0, max: 4.5 },
    { name: SCORE_LABELS.average, key: "average", min: 3.0, max: 4.0 },
    { name: SCORE_LABELS.low, key: "low", min: 0, max: 3.0 },
  ];

  const scoreChartData = scoreRanges.map((range) => {
    const count = recentEvaluations.filter((e) => {
      const score = e.overall_score;
      return score >= range.min && (range.max === 5.0 ? score <= range.max : score < range.max);
    }).length;
    return { name: range.name, count };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Overview of coaching call evaluations
        </p>
      </div>

      <SectionCards stats={stats} />

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Call Distribution by Type
            </CardTitle>
            <CardDescription>Breakdown of calls by category</CardDescription>
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
              <ResponsiveContainer width="100%" height={CHART_HEIGHTS.md}>
                <BarChart data={callTypeChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
                    formatter={(value: number) => [`${value} call${value === 1 ? "" : "s"}`, "Count"]}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.tertiary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Recent Evaluations
            </CardTitle>
            <CardDescription>Latest coaching assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed"
                style={{ height: CHART_HEIGHTS.md }}
              >
                <CheckCircle2 className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No evaluations yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvaluations.map((eval_) => (
                  <div
                    key={eval_.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        Call {eval_.call_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {eval_.overall_score?.toFixed(1)} / 5
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Evaluation Score Distribution
          </CardTitle>
          <CardDescription>Scores grouped by performance level</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations.length === 0 ? (
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
    </div>
  );
}

function SectionCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Calls",
      value: stats.total_calls.toString(),
      change: `${stats.pending} pending`,
      icon: Phone,
    },
    {
      title: "Evaluated",
      value: stats.evaluated.toString(),
      change: `${stats.pending} pending`,
      icon: CheckCircle2,
    },
    {
      title: "Avg Score",
      value: stats.avg_score?.toFixed(1) ?? "—",
      change: "Across all evaluations",
      icon: TrendingUp,
    },
    {
      title: "Coaches",
      value: stats.total_coaches.toString(),
      change: "Active coaches",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
