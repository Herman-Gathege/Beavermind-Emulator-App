import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  title: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8"
          />
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
