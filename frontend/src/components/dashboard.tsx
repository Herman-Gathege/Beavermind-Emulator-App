import {
  BarChart3,
  Users,
  Phone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  total_calls: number;
  evaluated: number;
  pending: number;
  avg_score: number | null;
}

interface DashboardProps {
  stats: DashboardStats;
  recentEvaluations: any[];
}

export function Dashboard({ stats, recentEvaluations }: DashboardProps) {
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
              Evaluation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
              <BarChart3 className="h-8 w-8 text-primary/60" />
              <p className="text-sm">Chart placeholder — connect to analytics endpoint</p>
            </div>
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
              <p className="text-sm text-muted-foreground py-4 text-center">
                No evaluations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentEvaluations.map((eval_) => (
                  <div
                    key={eval_.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        Call {eval_.call_id}
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
    </div>
  );
}

function SectionCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Calls",
      value: stats.total_calls.toString(),
      change: "+12%",
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
      value: "—",
      change: "View all coaches",
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
