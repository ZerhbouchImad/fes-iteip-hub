import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/utilisateurs")({
  component: UsersPage,
});

interface ProfileRow {
  user_id: string; prenom: string; nom: string; email: string | null;
  user_roles?: { role: string }[];
}

function UsersPage() {
  const { role: myRole } = useAuth();
  const [list, setList] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, prenom, nom, email, user_roles(role)")
      .order("created_at", { ascending: false });
    setList((data as unknown as ProfileRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId: string, newRole: string) => {
    // remove all roles then add the new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as never });
    if (error) { toast.error(error.message); return; }
    toast.success("Rôle mis à jour");
    load();
  };

  if (myRole !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">Accès réservé aux administrateurs.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les rôles des comptes inscrits</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">Aucun utilisateur</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => {
                const currentRole = p.user_roles?.[0]?.role ?? "etudiant";
                return (
                  <TableRow key={p.user_id}>
                    <TableCell className="font-medium">{`${p.prenom} ${p.nom}`.trim() || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>
                      <Select value={currentRole} onValueChange={(v) => updateRole(p.user_id, v)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="enseignant">Enseignant</SelectItem>
                          <SelectItem value="etudiant">Étudiant</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
