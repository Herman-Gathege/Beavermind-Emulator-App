import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/components/dashboard";
import { CallList } from "@/pages/calls";
import { CallDetail } from "@/pages/call-detail";
import { AnalyticsPage } from "@/pages/analytics";
import { SettingsPage } from "@/pages/settings";
import { CoachesPage } from "@/pages/coaches";
import { ClientsPage } from "@/pages/clients";
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6 lg:px-8 md:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Beavermind</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/coaches" element={<CoachesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/calls" element={<CallList />} />
          <Route path="/calls/:id" element={<CallDetail />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </BrowserRouter>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<{
    total_calls: number;
    evaluated: number;
    pending: number;
    avg_score: number | null;
    total_coaches: number;
  }>({
    total_calls: 0,
    evaluated: 0,
    pending: 0,
    avg_score: null,
    total_coaches: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/dashboard/stats").then((r) => {
        if (!r.ok) throw new Error(`Stats failed: ${r.status}`);
        return r.json();
      }),
      apiFetch("/evaluations").then((r) => {
        if (!r.ok) throw new Error(`Evaluations failed: ${r.status}`);
        return r.json();
      }),
      apiFetch("/calls").then((r) => {
        if (!r.ok) throw new Error(`Calls failed: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([statsData, evalsData, callsData]) => {
        setStats(statsData);
        setRecent(evalsData.slice(0, 5));
        setCalls(callsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-1 md:col-span-4 h-80 bg-muted rounded animate-pulse" />
          <div className="col-span-1 md:col-span-3 h-80 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">Unable to load dashboard</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return <Dashboard stats={stats} recentEvaluations={recent} calls={calls} />;
}
