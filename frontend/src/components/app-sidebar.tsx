import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Phone,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calls", href: "/calls", icon: Phone },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`flex flex-col border-r bg-card transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-lg">Beavermind</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}
