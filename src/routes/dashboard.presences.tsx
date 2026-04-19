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
import { Plus, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/presences")({
  component: PresencesPage,
});

interface Presence {
  id: string; date_seance: string; statut: string;
  etudiant_id: string; module_id: string;
  etudiants?: { matricule: string } | null;
  modules?: { code: string; nom: string } | null;
}

const statutLabel: Record<string, string> = { present: "Présent", absent: "Absent", retard: "Retard", justifie: "Justifié" };
const statutColor: Record<string, string> = {
  present: "bg-success/15 text-success", absent: "bg-destructive/15 text-destructive",
  retard: "bg-warning/15 text-warning-foreground", justifie: "bg-muted text-muted-foreground",
};

function PresencesPage() {
  const { role, user } = useAuth();
  const [list, setList] = useState<Presence[]>([]);
  const [etudiants, setEtudiants] = useState<{ id: string; matricule: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; code: string; nom: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [etId, setEtId] = useState(""); const [modId, setModId] = useState("");
  const [statut, setStatut] = useState("present");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const canSaisir = role === "admin" || role === "enseignant";

  const load = async () => {
    setLoading(true);
    let q = supabase.from("presences").select("*, etudiants(matricule), modules(code, nom)").order("date_seance", { ascending: false });
    if (role === "etudiant" && user) {
      const { data: et } = await supabase.from("etudiants").select("id").eq("user_id", user.id).maybeSingle();
      if (et) q = q.eq("etudiant_id", et.id);
      else { setList([]); setLoading(false); return; }
    }
    const { data } = await q;
    setList((data as unknown as Presence[]) ?? []);

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
    if (!etId || !modId) { toast.error("Champs requis"); return; }
    const { error } = await supabase.from("presences").insert({
      etudiant_id: etId, module_id: modId, statut: statut as never, date_seance: date, saisie_par: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Présence enregistrée");
    setOpen(false); setEtId(""); setModId(""); setStatut("present");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Présences</h1>
          <p className="text-muted-foreground">{role === "etudiant" ? "Mon assiduité" : "Suivi des présences par séance"}</p>
        </div>
        {canSaisir && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="hero"><Plus /> Pointer</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle présence</DialogTitle></DialogHeader>
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
                    <Label>Statut</Label>
                    <Select value={statut} onValueChange={setStatut}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Présent</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="retard">Retard</SelectItem>
                        <SelectItem value="justifie">Justifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">Aucune présence enregistrée</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {role !== "etudiant" && <TableHead>Étudiant</TableHead>}
                <TableHead>Module</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.date_seance).toLocaleDateString("fr-FR")}</TableCell>
                  {role !== "etudiant" && <TableCell>{p.etudiants?.matricule}</TableCell>}
                  <TableCell>{p.modules?.code}</TableCell>
                  <TableCell>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statutColor[p.statut]}`}>
                      {statutLabel[p.statut]}
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
