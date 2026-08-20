import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

interface Call {
  id: string;
  coach_id: string;
  client_id: string;
  program_id: string;
  type: string;
  title: string;
  scheduled_at: string;
  transcript: string;
  status: string;
}

interface DimensionScore {
  dimension: string;
  score: number;
  feedback: string;
  evidence: string;
}

interface Evaluation {
  id: string;
  overall_score: number;
  summary: string;
  dimension_scores: DimensionScore[];
}

export function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    fetchCall();
  }, [id]);

  const fetchCall = async () => {
    try {
      const res = await fetch(`/api/calls/${id}`);
      const data = await res.json();
      setCall(data);
    } catch (error) {
      console.error("Failed to fetch call:", error);
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/evaluations?call_id=${id}`, {
        method: "POST",
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (error) {
      console.error("Failed to run evaluation:", error);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!call) {
    return <div>Call not found</div>;
  }

  return (
    <div className="space-y-6">
      <SiteHeader title={call.title} />
      <div className="flex items-center gap-4">
        <Link to="/calls">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{call.title}</h1>
            <Badge>{call.type.replace("_", " ")}</Badge>
            <Badge variant={call.status === "evaluated" ? "default" : "secondary"}>
              {call.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {new Date(call.scheduled_at).toLocaleString()}
          </p>
        </div>
        {!evaluation && (
          <Button onClick={runEvaluation} disabled={evaluating}>
            {evaluating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {evaluating ? "Evaluating..." : "Run Evaluation"}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={call.transcript || "No transcript available."}
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {evaluation ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Evaluation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold">
                      {evaluation.overall_score.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <Progress
                    value={(evaluation.overall_score / 5) * 100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.summary}
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold">Dimension Scores</h4>
                  <div className="space-y-3">
                    {evaluation.dimension_scores.map((dim, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dim.dimension}</span>
                          <span className="text-sm font-bold">
                            {dim.score.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dim.feedback}
                        </p>
                        {dim.evidence && (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            "{dim.evidence}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click "Run Evaluation" to analyze this call against the 12-dimension rubric.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
