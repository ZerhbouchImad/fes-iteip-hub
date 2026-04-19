import { createFileRoute } from "@tanstack/react-router";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — ITEIP Fès" },
      { name: "description", content: "Mission, vision et valeurs de l'Institut ITEIP de Fès." },
      { property: "og:title", content: "À propos — ITEIP Fès" },
      { property: "og:description", content: "Découvrez l'histoire et la mission de l'ITEIP Fès." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            À propos de <span className="text-gradient">l'ITEIP</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            L'Institut ITEIP de Fès forme depuis plusieurs années des professionnels qualifiés dans les domaines du numérique, de la gestion et du marketing.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Target, title: "Notre mission", desc: "Former la prochaine génération de talents marocains avec excellence et bienveillance." },
            { icon: Eye, title: "Notre vision", desc: "Devenir l'institut de référence à Fès en alliant pédagogie moderne et accompagnement humain." },
            { icon: Heart, title: "Nos valeurs", desc: "Excellence, intégrité, innovation, respect et engagement envers nos étudiants." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
