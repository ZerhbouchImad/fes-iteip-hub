import { createFileRoute } from "@tanstack/react-router";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ITEIP Fès" },
      { name: "description", content: "Contactez l'Institut ITEIP de Fès pour toute information." },
      { property: "og:title", content: "Contact — ITEIP Fès" },
      { property: "og:description", content: "Adresse, téléphone, email de l'ITEIP Fès." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  nom: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(1000),
});

function ContactPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ nom, email, message });
    if (!parsed.success) {
      toast.error("Veuillez vérifier les informations saisies.");
      return;
    }
    toast.success("Message envoyé ! Nous vous répondrons rapidement.");
    setNom(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Contactez-nous</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Une question ? Notre équipe est à votre écoute.</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-5 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:col-span-2">
            {[
              { icon: MapPin, title: "Adresse", val: "Avenue Hassan II, Fès, Maroc" },
              { icon: Mail, title: "Email", val: "contact@iteip.ma" },
              { icon: Phone, title: "Téléphone", val: "+212 5 35 00 00 00" },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.val}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft lg:col-span-3">
            <div>
              <Label htmlFor="cn">Nom complet</Label>
              <Input id="cn" value={nom} onChange={(e) => setNom(e.target.value)} required maxLength={100} />
            </div>
            <div>
              <Label htmlFor="ce">Email</Label>
              <Input id="ce" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="cm">Message</Label>
              <Textarea id="cm" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required maxLength={1000} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">Envoyer</Button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
