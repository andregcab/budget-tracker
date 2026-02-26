import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Account = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  isDefault: boolean;
  createdAt: string;
};

async function getAccounts(): Promise<Account[]> {
  return api("/accounts");
}

async function createAccount(body: {
  name: string;
  type: string;
  institution?: string;
  isDefault?: boolean;
}) {
  return api("/accounts", { method: "POST", body: JSON.stringify(body) });
}

async function updateAccount(
  id: string,
  body: { name?: string; type?: string; institution?: string; isDefault?: boolean }
) {
  return api(`/accounts/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

async function deleteAccount(id: string) {
  return api(`/accounts/${id}`, { method: "DELETE" });
}

export function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [institution, setInstitution] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateAccount>[1] }) =>
      updateAccount(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setEditing(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });

  function resetForm() {
    setName("");
    setType("checking");
    setInstitution("");
    setIsDefault(false);
  }

  function openEdit(acc: Account) {
    setEditing(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitution(acc.institution ?? "");
    setIsDefault(acc.isDefault);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        body: { name, type, institution: institution || undefined, isDefault },
      });
    } else {
      createMutation.mutate({
        name,
        type,
        institution: institution || undefined,
        isDefault,
      });
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading accounts...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Add account</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit account" : "New account"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. checking, savings"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Chase"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <Label htmlFor="default">Default for imports</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editing ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Your accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No accounts yet. Add one to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>{acc.type}</TableCell>
                    <TableCell>{acc.institution ?? "—"}</TableCell>
                    <TableCell>{acc.isDefault ? "Yes" : "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { openEdit(acc); setOpen(true); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this account?")) deleteMutation.mutate(acc.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
