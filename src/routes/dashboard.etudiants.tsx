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
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/dashboard/etudiants")({
  component: EtudiantsPage,
});

interface Etudiant {
  id: string; matricule: string; niveau: number; date_inscription: string;
  filiere_id: string | null; user_id: string | null;
  filieres?: { nom: string; code: string } | null;
  profiles?: { prenom: string; nom: string; email: string | null } | null;
}
interface Filiere { id: string; nom: string; code: string; }

const schema = z.object({
  matricule: z.string().trim().min(1).max(20),
  filiere_id: z.string().uuid(),
  niveau: z.number().min(1).max(5),
});

function EtudiantsPage() {
  const { role } = useAuth();
  const [list, setList] = useState<Etudiant[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [niveau, setNiveau] = useState("1");

  const isAdmin = role === "admin";

  const load = async () => {
    setLoading(true);
    const [{ data: e }, { data: f }] = await Promise.all([
      supabase.from("etudiants").select("*, filieres(nom, code), profiles!etudiants_user_id_fkey(prenom, nom, email)").order("created_at", { ascending: false }),
      supabase.from("filieres").select("id, nom, code").order("nom"),
    ]);
    setList((e as unknown as Etudiant[]) ?? []);
    setFilieres((f as Filiere[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const parsed = schema.safeParse({ matricule, filiere_id: filiereId, niveau: Number(niveau) });
    if (!parsed.success) { toast.error("Champs invalides"); return; }
    const { error } = await supabase.from("etudiants").insert(parsed.data);
    if (error) { toast.error(error.message); return; }
    toast.success("Étudiant ajouté");
    setOpen(false); setMatricule(""); setFiliereId(""); setNiveau("1");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet étudiant ?")) return;
    const { error } = await supabase.from("etudiants").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Étudiant supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground">Liste des étudiants inscrits</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus /> Nouvel étudiant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ajouter un étudiant</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Matricule</Label>
                  <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="ETU-2025-001" />
                </div>
                <div>
                  <Label>Filière</Label>
                  <Select value={filiereId} onValueChange={setFiliereId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {filieres.map((f) => <SelectItem key={f.id} value={f.id}>{f.nom} ({f.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Niveau</Label>
                  <Select value={niveau} onValueChange={setNiveau}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>Niveau {n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button variant="hero" onClick={handleCreate}>Ajouter</Button>
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
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">Aucun étudiant pour le moment</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Filière</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Inscription</TableHead>
                {isAdmin && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.matricule}</TableCell>
                  <TableCell>{e.profiles ? `${e.profiles.prenom} ${e.profiles.nom}`.trim() || "—" : "—"}</TableCell>
                  <TableCell>{e.filieres ? `${e.filieres.code}` : "—"}</TableCell>
                  <TableCell>Niv. {e.niveau}</TableCell>
                  <TableCell>{new Date(e.date_inscription).toLocaleDateString("fr-FR")}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
