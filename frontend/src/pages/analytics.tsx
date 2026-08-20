import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Coaching performance insights
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics charts will be implemented in the next milestone.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
