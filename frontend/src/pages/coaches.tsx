import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Coach {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  created_at: string;
}

interface CoachFormData {
  name: string;
  specialty: string;
  bio: string;
}

const emptyForm: CoachFormData = { name: "", specialty: "", bio: "" };

export function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Coach | null>(null);
  const [form, setForm] = useState<CoachFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/coaches?${params}`);
      if (!res.ok) throw new Error(`Failed to load coaches (${res.status})`);
      const data = await res.json();
      setCoaches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coaches");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setCreateOpen(true);
  };

  const openEdit = (coach: Coach) => {
    setSelected(coach);
    setForm({ name: coach.name, specialty: coach.specialty, bio: coach.bio || "" });
    setFormError(null);
    setEditOpen(true);
  };

  const openDelete = (coach: Coach) => {
    setSelected(coach);
    setDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.specialty.trim()) {
      setFormError("Name and specialty are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to create coach (${res.status})`);
      }
      setCreateOpen(false);
      setForm(emptyForm);
      fetchCoaches();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create coach");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected || !form.name.trim() || !form.specialty.trim()) {
      setFormError("Name and specialty are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/coaches/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to update coach (${res.status})`);
      }
      setEditOpen(false);
      setSelected(null);
      fetchCoaches();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update coach");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/coaches/${selected.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to delete coach (${res.status})`);
      }
      setDeleteOpen(false);
      setSelected(null);
      fetchCoaches();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete coach");
      setDeleteOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Coaches</h2>
          <p className="text-muted-foreground mt-1">
            Manage coaching staff
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coach
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Coaches</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coaches..."
                className="pl-8 w-full sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchCoaches}>Retry</Button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : coaches.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No coaches found. Try adjusting your search or add a new coach.
            </p>
          ) : (
            <div className="space-y-2">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{coach.name}</span>
                      <Badge variant="secondary">{coach.specialty}</Badge>
                    </div>
                    {coach.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{coach.bio}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(coach)} aria-label={`Edit ${coach.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(coach)} aria-label={`Delete ${coach.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Add Coach</DialogTitle>
          <DialogDescription>Enter the coach details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Name</Label>
            <Input id="create-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-specialty">Specialty</Label>
            <Input id="create-specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-bio">Bio</Label>
            <Input id="create-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving..." : "Create Coach"}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle>Edit Coach</DialogTitle>
          <DialogDescription>Update the coach details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-specialty">Specialty</Label>
            <Input id="edit-specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Input id="edit-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogHeader>
          <DialogTitle>Delete Coach</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? "Deleting..." : "Delete"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
