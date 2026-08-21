import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export function AnalyticsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Coaching performance insights
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-lg border border-dashed">
            <TrendingUp className="h-8 w-8 text-primary/60" />
            <p className="text-sm">Analytics charts will be implemented in the next milestone.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
