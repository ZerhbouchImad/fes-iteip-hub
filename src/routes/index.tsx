import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, BookOpen, ClipboardCheck, BarChart3, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero-iteip.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const features = [
  { icon: Users, title: "Gestion des étudiants", desc: "Inscriptions, dossiers, filières et niveaux centralisés." },
  { icon: BookOpen, title: "Modules & cours", desc: "Organisation par semestre, coefficients et enseignants." },
  { icon: ClipboardCheck, title: "Notes & évaluations", desc: "Saisie rapide, calcul automatique des moyennes." },
  { icon: BarChart3, title: "Suivi de présence", desc: "Pointage par séance, statistiques d'assiduité." },
  { icon: ShieldCheck, title: "Rôles sécurisés", desc: "Admin, enseignant, étudiant — accès cloisonnés." },
  { icon: Sparkles, title: "Interface moderne", desc: "Expérience fluide sur ordinateur, tablette et mobile." },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-glow" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-coral/20 blur-3xl animate-glow" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Plateforme officielle ITEIP Fès
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Pilotez votre <span className="text-gradient">école</span><br />
                en toute simplicité.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Gérez étudiants, modules, notes et présences depuis une interface unique, moderne et sécurisée. Pensée pour l'Institut ITEIP de Fès.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth">
                    Accéder à mon espace <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/filieres">Découvrir les filières</Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-8 text-sm">
                <div>
                  <div className="font-display text-2xl font-bold text-gradient">4</div>
                  <div className="text-muted-foreground">Filières</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="font-display text-2xl font-bold text-gradient">3</div>
                  <div className="text-muted-foreground">Rôles utilisateurs</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="font-display text-2xl font-bold text-gradient">100%</div>
                  <div className="text-muted-foreground">Sécurisé</div>
                </div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-primary opacity-30 blur-2xl" />
              <img
                src={heroImg}
                alt="Plateforme de gestion ITEIP"
                width={1536}
                height={1024}
                className="relative rounded-3xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Tout ce dont l'institut a besoin,<br />
              <span className="text-gradient">au même endroit.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Une plateforme complète pensée pour les administrateurs, enseignants et étudiants.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-smooth group-hover:opacity-30" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant lg:p-20">
          <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Prêt à transformer la gestion de l'école ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Connectez-vous à votre espace personnel ou créez un compte étudiant pour commencer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/auth">Se connecter</Link>
            </Button>
            <Button asChild variant="coral" size="lg">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
