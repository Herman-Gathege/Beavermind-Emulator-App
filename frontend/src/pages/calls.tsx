import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Call {
  id: string;
  coach_id: string;
  client_id: string;
  program_id: string;
  type: string;
  title: string;
  scheduled_at: string;
  status: string;
}

export function CallList() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchCalls();
  }, [search, typeFilter]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const res = await fetch(`/api/calls?${params}`);
      const data = await res.json();
      setCalls(data);
    } catch (error) {
      console.error("Failed to fetch calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sales: "bg-blue-100 text-blue-800",
      kickoff: "bg-green-100 text-green-800",
      coaching: "bg-purple-100 text-purple-800",
      strategic_review: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return status === "evaluated"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calls</h2>
          <p className="text-muted-foreground">
            Find and review coaching calls
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Call
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Calls</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  className="pl-8 md:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="kickoff">Kick-off</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                  <SelectItem value="strategic_review">Strategic Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : calls.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No calls found. Try adjusting your search.
            </p>
          ) : (
            <div className="space-y-2">
              {calls.map((call) => (
                <Link
                  key={call.id}
                  to={`/calls/${call.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{call.title}</span>
                      <Badge className={getTypeColor(call.type)}>
                        {call.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(call.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge className={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
