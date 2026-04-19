import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, BookOpen, ClipboardCheck, CalendarCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ etudiants: 0, modules: 0, notes: 0, presences: 0, moyenne: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role || !user) return;
    const load = async () => {
      if (role === "admin") {
        const [e, m, n, p] = await Promise.all([
          supabase.from("etudiants").select("id", { count: "exact", head: true }),
          supabase.from("modules").select("id", { count: "exact", head: true }),
          supabase.from("notes").select("id", { count: "exact", head: true }),
          supabase.from("presences").select("id", { count: "exact", head: true }),
        ]);
        setStats({ etudiants: e.count ?? 0, modules: m.count ?? 0, notes: n.count ?? 0, presences: p.count ?? 0, moyenne: 0 });
      } else if (role === "enseignant") {
        const [m, n] = await Promise.all([
          supabase.from("modules").select("id", { count: "exact", head: true }).eq("enseignant_id", user.id),
          supabase.from("notes").select("id", { count: "exact", head: true }).eq("saisie_par", user.id),
        ]);
        setStats({ etudiants: 0, modules: m.count ?? 0, notes: n.count ?? 0, presences: 0, moyenne: 0 });
      } else {
        const { data: et } = await supabase.from("etudiants").select("id").eq("user_id", user.id).maybeSingle();
        if (et) {
          const [n, p] = await Promise.all([
            supabase.from("notes").select("note").eq("etudiant_id", et.id),
            supabase.from("presences").select("statut").eq("etudiant_id", et.id),
          ]);
          const notes = n.data ?? [];
          const moy = notes.length ? notes.reduce((s, x) => s + Number(x.note), 0) / notes.length : 0;
          setStats({ etudiants: 0, modules: 0, notes: notes.length, presences: p.data?.length ?? 0, moyenne: Math.round(moy * 100) / 100 });
        }
      }
      setLoading(false);
    };
    load();
  }, [role, user]);

  const cards = role === "admin" ? [
    { label: "Étudiants inscrits", value: stats.etudiants, icon: GraduationCap, color: "from-violet-500 to-fuchsia-500" },
    { label: "Modules", value: stats.modules, icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { label: "Notes saisies", value: stats.notes, icon: ClipboardCheck, color: "from-emerald-500 to-teal-500" },
    { label: "Présences enregistrées", value: stats.presences, icon: CalendarCheck, color: "from-amber-500 to-orange-500" },
  ] : role === "enseignant" ? [
    { label: "Mes modules", value: stats.modules, icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { label: "Notes saisies", value: stats.notes, icon: ClipboardCheck, color: "from-emerald-500 to-teal-500" },
  ] : [
    { label: "Notes reçues", value: stats.notes, icon: ClipboardCheck, color: "from-emerald-500 to-teal-500" },
    { label: "Séances suivies", value: stats.presences, icon: CalendarCheck, color: "from-amber-500 to-orange-500" },
    { label: "Moyenne générale", value: stats.moyenne || "—", icon: TrendingUp, color: "from-violet-500 to-fuchsia-500" },
  ];

  const greeting = { admin: "Tableau de bord administrateur", enseignant: "Espace enseignant", etudiant: "Mon espace étudiant" }[role!];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="mt-1 text-muted-foreground">Bienvenue {user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-md">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl transition-smooth group-hover:opacity-40`} />
            <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} shadow-soft`}>
              <c.icon className="h-5 w-5 text-white" />
            </div>
            <div className="mt-4 text-3xl font-bold">{loading ? "…" : c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <h2 className="text-xl font-semibold">Démarrage rapide</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {role === "admin" && "Commencez par créer des modules et inscrire des étudiants depuis la barre latérale."}
          {role === "enseignant" && "Accédez à vos modules pour saisir notes et présences."}
          {role === "etudiant" && "Consultez vos notes et votre assiduité depuis le menu."}
        </p>
      </div>
    </div>
  );
}
