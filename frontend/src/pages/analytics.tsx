import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
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

const CALL_TYPE_COLORS: Record<string, string> = {
  sales: "#6366f1",
  kickoff: "#10b981",
  coaching: "#a855f7",
  strategic_review: "#f97316",
};

const SCORE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export function AnalyticsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/calls").then((r) => {
        if (!r.ok) throw new Error(`Calls failed: ${r.status}`);
        return r.json();
      }),
      fetch("/api/evaluations").then((r) => {
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
    name: type.replace("_", " "),
    value: count,
  }));

  const scoreRanges = [
    { name: "4.5 - 5.0", min: 4.5, max: 5.0 },
    { name: "4.0 - 4.4", min: 4.0, max: 4.4 },
    { name: "3.0 - 3.9", min: 3.0, max: 3.9 },
    { name: "< 3.0", min: 0, max: 3.0 },
  ];

  const scoreChartData = scoreRanges.map((range) => {
    const count = evaluations.filter((e) => {
      const score = e.overall_score;
      return score >= range.min && (range.max === 5.0 ? score <= range.max : score < range.max);
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Calls by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {callTypeChartData.length === 0 ? (
              <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
                <BarChart3 className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No call data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={callTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {callTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CALL_TYPE_COLORS[entry.name.toLowerCase().replace(" ", "_")] || SCORE_COLORS[index % SCORE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evaluation Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
                <TrendingUp className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No evaluations to display.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Coach Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coachChartData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
                <TrendingUp className="h-8 w-8 text-primary/60" />
                <p className="text-sm">No evaluation data available.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coachChartData}>
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
                  <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evaluated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}