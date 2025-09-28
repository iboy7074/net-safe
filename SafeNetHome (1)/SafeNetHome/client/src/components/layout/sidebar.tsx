import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Wifi, BarChart3, Laptop, Shield, Users, Settings } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Device Management",
    href: "/devices",
    icon: Laptop,
  },
  {
    name: "Security & Alerts",
    href: "/security",
    icon: Shield,
  },
  {
    name: "Parental Controls",
    href: "/parental",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-sidebar border-r border-sidebar-border w-64 flex-shrink-0 hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Wifi className="text-sidebar-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">RouterControl</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
