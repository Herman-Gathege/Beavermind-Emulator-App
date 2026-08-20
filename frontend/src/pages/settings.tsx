import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage application settings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page will be implemented in the next milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
