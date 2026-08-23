import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Loader2, CheckCircle2, User, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

interface Coach {
  id: string;
  name: string;
  specialty: string;
}

interface Client {
  id: string;
  name: string;
  organization: string;
}

interface Program {
  id: string;
  name: string;
  coach: Coach;
  client: Client;
}

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
  coach?: Coach;
  client?: Client;
  program?: Program;
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
  strengths: string[];
  improvement_areas: string[];
  recommendations: string[];
  dimension_scores: DimensionScore[];
}

export function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  useEffect(() => {
    fetchCall();
  }, [id]);

  const fetchCall = async () => {
    try {
      const res = await apiFetch(`/calls/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Call not found");
        } else {
          setError(`Failed to load call (${res.status})`);
        }
        return;
      }
      const data = await res.json();
      setCall(data);
    } catch (err) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await apiFetch(`/evaluations?call_id=${id}`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Evaluation failed: ${res.status}`);
      }
      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      console.error("Failed to run evaluation:", err);
      setEvalError(err.message || "We couldn't evaluate this call right now. Please try again.");
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

  if (error || !call) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">{error || "Call not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/calls">Back to Calls</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/calls">
            <Button variant="ghost" size="icon" aria-label="Back to calls">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold truncate">{call.title}</h1>
              <Badge variant="secondary">{call.type.replace("_", " ")}</Badge>
              <Badge variant={call.status === "evaluated" ? "default" : "secondary"}>
                {call.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(call.scheduled_at).toLocaleString()}
            </p>
          </div>
        </div>
        {!evaluation && (
          <Button onClick={runEvaluation} disabled={evaluating} className="w-full md:w-auto">
            {evaluating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {evaluating ? "Evaluating..." : "Run Evaluation"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-sm">{call.coach?.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{call.coach?.specialty || ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-sm">{call.client?.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{call.client?.organization || ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-sm">{call.program?.name || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={call.transcript || "No transcript available."}
              className="min-h-[300px] md:min-h-[400px] font-mono text-sm"
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
                  <h4 className="mb-2 font-semibold text-sm">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.summary}
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold text-sm text-green-600">Strengths</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {(evaluation.strengths || []).map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold text-sm text-amber-600">Improvement Areas</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {(evaluation.improvement_areas || []).map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="mb-2 font-semibold text-sm text-blue-600">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {(evaluation.recommendations || []).map((item, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-sm">Dimension Scores</h4>
                  <div className="space-y-3">
                    {evaluation.dimension_scores.map((dim, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{dim.dimension}</span>
                          <span className="text-sm font-bold">
                            {dim.score.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dim.feedback}
                        </p>
                        {dim.evidence && (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            &ldquo;{dim.evidence}&rdquo;
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
              <CardContent className="space-y-4">
                {evalError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{evalError}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Click &ldquo;Run Evaluation&rdquo; to analyze this call against the 12-dimension rubric.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
