import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Code2, Network, Briefcase, Megaphone } from "lucide-react";

export const Route = createFileRoute("/filieres")({
  head: () => ({
    meta: [
      { title: "Filières — ITEIP Fès" },
      { name: "description", content: "Découvrez les filières proposées par l'Institut ITEIP de Fès : développement, infrastructure, gestion, marketing." },
      { property: "og:title", content: "Filières — ITEIP Fès" },
      { property: "og:description", content: "Toutes les filières de l'Institut ITEIP Fès." },
    ],
  }),
  component: FilieresPage,
});

const iconByCode: Record<string, typeof Code2> = {
  DD: Code2, ID: Network, GE: Briefcase, MD: Megaphone,
};

interface Filiere {
  id: string; nom: string; code: string; description: string | null; duree_annees: number;
}

function FilieresPage() {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("filieres").select("*").order("nom").then(({ data }) => {
      setFilieres((data as Filiere[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Nos <span className="text-gradient">filières</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Des formations professionnalisantes alignées avec les besoins du marché marocain.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filieres.map((f) => {
                const Icon = iconByCode[f.code] ?? Code2;
                return (
                  <div key={f.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-10 blur-2xl transition-smooth group-hover:opacity-30" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{f.code}</span>
                      <span className="text-xs text-muted-foreground">{f.duree_annees} ans</span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold">{f.nom}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center text-sm text-muted-foreground">
            Pour postuler, <Link to="/auth" className="font-medium text-primary hover:underline">créez votre compte</Link> ou <Link to="/contact" className="font-medium text-primary hover:underline">contactez-nous</Link>.
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
