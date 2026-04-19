import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/notes")({
  component: NotesPage,
});

interface Note {
  id: string; note: number; type: string; date_evaluation: string;
  etudiant_id: string; module_id: string;
  etudiants?: { matricule: string; profiles?: { prenom: string; nom: string } | null } | null;
  modules?: { nom: string; code: string } | null;
}

function NotesPage() {
  const { role, user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [etudiants, setEtudiants] = useState<{ id: string; matricule: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; nom: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [etId, setEtId] = useState(""); const [modId, setModId] = useState("");
  const [type, setType] = useState("controle_continu"); const [val, setVal] = useState("");

  const canSaisir = role === "admin" || role === "enseignant";

  const load = async () => {
    setLoading(true);
    let q = supabase.from("notes").select("*, etudiants(matricule, profiles!etudiants_user_id_fkey(prenom, nom)), modules(nom, code)").order("date_evaluation", { ascending: false });
    if (role === "etudiant" && user) {
      const { data: et } = await supabase.from("etudiants").select("id").eq("user_id", user.id).maybeSingle();
      if (et) q = q.eq("etudiant_id", et.id);
      else { setNotes([]); setLoading(false); return; }
    }
    const { data } = await q;
    setNotes((data as unknown as Note[]) ?? []);

    if (canSaisir) {
      let mq = supabase.from("modules").select("id, nom, code");
      if (role === "enseignant" && user) mq = mq.eq("enseignant_id", user.id);
      const [{ data: ets }, { data: mods }] = await Promise.all([
        supabase.from("etudiants").select("id, matricule").order("matricule"),
        mq,
      ]);
      setEtudiants(ets ?? []); setModules(mods ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [role, user]);

  const handleCreate = async () => {
    if (!etId || !modId || !val) { toast.error("Champs requis"); return; }
    const n = Number(val);
    if (isNaN(n) || n < 0 || n > 20) { toast.error("Note entre 0 et 20"); return; }
    const { error } = await supabase.from("notes").insert({
      etudiant_id: etId, module_id: modId, type: type as never, note: n, saisie_par: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Note enregistrée");
    setOpen(false); setEtId(""); setModId(""); setVal("");
    load();
  };

  const moy = notes.length ? notes.reduce((s, n) => s + Number(n.note), 0) / notes.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">{role === "etudiant" ? "Mes notes et évaluations" : "Saisie et consultation des notes"}</p>
        </div>
        {canSaisir && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="hero"><Plus /> Saisir une note</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle note</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Étudiant</Label>
                  <Select value={etId} onValueChange={setEtId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>{etudiants.map((e) => <SelectItem key={e.id} value={e.id}>{e.matricule}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Module</Label>
                  <Select value={modId} onValueChange={setModId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>{modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code} — {m.nom}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="controle_continu">Contrôle continu</SelectItem>
                        <SelectItem value="examen">Examen</SelectItem>
                        <SelectItem value="tp">TP</SelectItem>
                        <SelectItem value="projet">Projet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Note /20</Label>
                    <Input type="number" step="0.25" min="0" max="20" value={val} onChange={(e) => setVal(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button variant="hero" onClick={handleCreate}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {role === "etudiant" && notes.length > 0 && (
        <div className="rounded-2xl border border-border bg-gradient-primary p-6 shadow-soft">
          <div className="text-sm text-primary-foreground/80">Moyenne générale</div>
          <div className="mt-1 text-4xl font-bold text-primary-foreground">{moy.toFixed(2)} / 20</div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Chargement…</div>
        ) : notes.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">Aucune note pour l'instant</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {role !== "etudiant" && <TableHead>Étudiant</TableHead>}
                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{new Date(n.date_evaluation).toLocaleDateString("fr-FR")}</TableCell>
                  {role !== "etudiant" && <TableCell>{n.etudiants?.matricule}</TableCell>}
                  <TableCell>{n.modules?.code}</TableCell>
                  <TableCell><span className="rounded bg-muted px-2 py-0.5 text-xs">{n.type.replace("_", " ")}</span></TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={Number(n.note) >= 10 ? "text-success" : "text-destructive"}>
                      {Number(n.note).toFixed(2)} / 20
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
