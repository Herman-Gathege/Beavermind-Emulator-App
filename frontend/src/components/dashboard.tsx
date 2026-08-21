import {
  BarChart3,
  Users,
  Phone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    { name: "4.5 - 5.0", range: "excellent", min: 4.5, max: 5.0 },
    { name: "4.0 - 4.4", range: "good", min: 4.0, max: 4.4 },
    { name: "3.0 - 3.9", range: "average", min: 3.0, max: 3.9 },
    { name: "< 3.0", range: "low", min: 0, max: 3.0 },
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Call Distribution by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {callTypeChartData.length === 0 ? (
              <div className="h-[250px] md:h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
                <BarChart3 className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No call data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={callTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <div className="h-[250px] md:h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
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
                        Score: {eval_.overall_score?.toFixed(1)}
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
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Evaluation Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvaluations.length === 0 ? (
            <div className="h-[250px] md:h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
              <TrendingUp className="h-8 w-8 text-primary/60" />
              <p className="text-sm">No evaluations to display.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
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
