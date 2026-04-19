import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/modules")({
  component: ModulesPage,
});

interface Module {
  id: string; nom: string; code: string; coefficient: number; semestre: number;
  filiere_id: string | null; enseignant_id: string | null;
  filieres?: { nom: string; code: string } | null;
}
interface Filiere { id: string; nom: string; code: string; }

function ModulesPage() {
  const { role, user } = useAuth();
  const [list, setList] = useState<Module[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState(""); const [code, setCode] = useState("");
  const [coef, setCoef] = useState("1"); const [sem, setSem] = useState("1");
  const [filId, setFilId] = useState("");

  const isAdmin = role === "admin";

  const load = async () => {
    setLoading(true);
    let q = supabase.from("modules").select("*, filieres(nom, code)").order("semestre");
    if (role === "enseignant" && user) q = q.eq("enseignant_id", user.id);
    const [{ data }, { data: f }] = await Promise.all([
      q,
      supabase.from("filieres").select("id, nom, code"),
    ]);
    setList((data as unknown as Module[]) ?? []);
    setFilieres((f as Filiere[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [role, user]);

  const handleCreate = async () => {
    if (!nom || !code || !filId) { toast.error("Champs requis"); return; }
    const { error } = await supabase.from("modules").insert({
      nom, code, coefficient: Number(coef), semestre: Number(sem), filiere_id: filId,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Module créé");
    setOpen(false); setNom(""); setCode(""); setCoef("1"); setSem("1"); setFilId("");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">{role === "enseignant" ? "Mes modules d'enseignement" : "Catalogue des modules"}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="hero"><Plus /> Nouveau module</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ajouter un module</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nom</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} /></div>
                <div><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MOD-101" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Coefficient</Label><Input type="number" step="0.5" value={coef} onChange={(e) => setCoef(e.target.value)} /></div>
                  <div><Label>Semestre</Label><Input type="number" value={sem} onChange={(e) => setSem(e.target.value)} /></div>
                </div>
                <div>
                  <Label>Filière</Label>
                  <Select value={filId} onValueChange={setFilId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>{filieres.map((f) => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button variant="hero" onClick={handleCreate}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Chargement…</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">Aucun module</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <div key={m.id} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold">{m.code}</span>
              </div>
              <h3 className="mt-4 font-semibold">{m.nom}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5">Sem. {m.semestre}</span>
                <span className="rounded bg-muted px-2 py-0.5">Coef. {m.coefficient}</span>
                {m.filieres && <span className="rounded bg-muted px-2 py-0.5">{m.filieres.code}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
