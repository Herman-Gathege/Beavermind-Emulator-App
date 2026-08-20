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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of coaching call evaluations
        </p>
      </div>

      <SectionCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evaluation Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="mr-2 h-4 w-4" />
              Chart placeholder — connect to analytics endpoint
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvaluations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No evaluations yet.</p>
              ) : (
                recentEvaluations.map((eval_) => (
                  <div
                    key={eval_.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Call {eval_.call_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {eval_.overall_score?.toFixed(1)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                ))
              )}
            </div>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-xs text-muted-foreground">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
