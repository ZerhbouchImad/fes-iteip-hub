import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardCheck,
  CalendarCheck, LogOut, Loader2, UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const navByRole = {
  admin: [
    { to: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/etudiants", label: "Étudiants", icon: GraduationCap },
    { to: "/dashboard/modules", label: "Modules", icon: BookOpen },
    { to: "/dashboard/notes", label: "Notes", icon: ClipboardCheck },
    { to: "/dashboard/presences", label: "Présences", icon: CalendarCheck },
    { to: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
  ],
  enseignant: [
    { to: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/modules", label: "Mes modules", icon: BookOpen },
    { to: "/dashboard/notes", label: "Saisie notes", icon: ClipboardCheck },
    { to: "/dashboard/presences", label: "Présences", icon: CalendarCheck },
  ],
  etudiant: [
    { to: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/notes", label: "Mes notes", icon: ClipboardCheck },
    { to: "/dashboard/presences", label: "Mes présences", icon: CalendarCheck },
    { to: "/dashboard/profil", label: "Mon profil", icon: UserCircle },
  ],
};

function DashboardLayout() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading || !user || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const items = navByRole[role];
  const initials = (user.email ?? "??").slice(0, 2).toUpperCase();
  const roleLabel = { admin: "Administrateur", enseignant: "Enseignant", etudiant: "Étudiant" }[role];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          {items.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== "/dashboard";
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user.email}</div>
              <div className="text-xs text-muted-foreground">{roleLabel}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Logo />
          <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card lg:hidden">
          {items.slice(0, 5).map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== "/dashboard";
            return (
              <Link key={item.to} to={item.to} className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
