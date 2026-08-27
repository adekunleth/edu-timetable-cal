import { ReactNode, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  BookOpen,
  Users,
  ClipboardList,
  Settings,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

type Role = "admin" | "teacher" | "student";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

// Each role only sees the sections it can act on.
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
  { name: "Calendar", href: "/calendar", icon: Calendar, roles: ["admin", "teacher", "student"] },
  { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
  { name: "Attendance", href: "/attendance", icon: ClipboardList, roles: ["admin", "teacher", "student"] },
  { name: "Cohorts", href: "/cohorts", icon: Users, roles: ["admin", "teacher"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
] as const;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [role, setRole] = useState<Role>("admin");

  const visibleNav = navigation.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  // Switching to a narrower role while on a restricted page sends you home.
  const currentAllowed =
    location.pathname.startsWith("/calendar") ||
    visibleNav.some((item) => item.href === location.pathname);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Calendar className="h-6 w-6 text-sidebar-primary" />
          <span className="ml-2 text-lg font-semibold text-sidebar-foreground">
            EduSchedule
          </span>
        </div>
        <nav className="space-y-1 p-4">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card">
          <div className="flex h-full items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-card-foreground">
              Timetable Management System
            </h1>
            <div className="flex items-center gap-4">
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {currentAllowed ? children : <Navigate to="/" replace />}
        </main>
      </div>
    </div>
  );
}
