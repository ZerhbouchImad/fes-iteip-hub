import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  const { user } = useAuth();
  const [prenom, setPrenom] = useState(""); const [nom, setNom] = useState("");
  const [cin, setCin] = useState(""); const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setPrenom(data.prenom ?? ""); setNom(data.nom ?? "");
        setCin(data.cin ?? ""); setTel(data.telephone ?? "");
      }
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      prenom, nom, cin: cin || null, telephone: tel || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil mis à jour");
  };

  const initials = (prenom[0] ?? "") + (nom[0] ?? "");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-primary text-lg text-primary-foreground">
              {initials.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.email}</div>
            <div className="text-sm text-muted-foreground">Compte ITEIP</div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div><Label>Prénom</Label><Input value={prenom} onChange={(e) => setPrenom(e.target.value)} disabled={loading} /></div>
          <div><Label>Nom</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} disabled={loading} /></div>
          <div><Label>CIN</Label><Input value={cin} onChange={(e) => setCin(e.target.value)} disabled={loading} /></div>
          <div><Label>Téléphone</Label><Input value={tel} onChange={(e) => setTel(e.target.value)} disabled={loading} /></div>
        </div>

        <Button variant="hero" className="mt-6 w-full sm:w-auto" onClick={save} disabled={saving || loading}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
