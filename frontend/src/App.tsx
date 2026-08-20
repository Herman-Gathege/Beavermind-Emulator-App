import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/components/dashboard";
import { CallList } from "@/pages/calls";
import { CallDetail } from "@/pages/call-detail";
import { AnalyticsPage } from "@/pages/analytics";
import { SettingsPage } from "@/pages/settings";
import { Toaster } from "@/components/ui/toaster";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        {children}
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
  const [stats, setStats] = useState({
    total_calls: 0,
    evaluated: 0,
    pending: 0,
    avg_score: null,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((r) => r.json()),
      fetch("/api/evaluations").then((r) => r.json()),
    ])
      .then(([statsData, evalsData]) => {
        setStats(statsData);
        setRecent(evalsData.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return <Dashboard stats={stats} recentEvaluations={recent} />;
}
