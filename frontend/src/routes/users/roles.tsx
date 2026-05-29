import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { PageHeader } from "../../components/PageHeader";
import { useRoles } from "../../hooks/use-user-management";
import { Checkbox } from "@radix-ui/react-checkbox";
import {
  Loader2,
  Shield,
  Plus,
  Trash2,
  Users,
  ArrowLeft,
  Check,
  Key,
} from "lucide-react";

const ALL_PERMISSIONS = [
  "users.read",
  "users.write",
  "users.delete",
  "roles.read",
  "roles.write",
  "roles.delete",
  "audit.read",
  "settings.read",
  "settings.write",
  "api.read",
  "api.write",
  "admin.full",
] as const;

export function RolesPage() {
  const { roles, isLoading, upsertRole, deleteRole, isMutating } = useRoles();
  const [showCreate, setShowCreate] = useState(false);
  const [editRole, setEditRole] = useState<{
    id: string;
    name: string;
    description: string;
    permissions: Set<string>;
  } | null>(null);

  function openCreate() {
    setEditRole({ id: "", name: "", description: "", permissions: new Set() });
    setShowCreate(true);
  }

  function openEdit(role: { id: string; name: string; description: string; permissions: string[] }) {
    setEditRole({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: new Set(role.permissions),
    });
    setShowCreate(true);
  }

  function togglePermission(perm: string) {
    if (!editRole) return;
    const newPerms = new Set(editRole.permissions);
    if (newPerms.has(perm)) newPerms.delete(perm);
    else newPerms.add(perm);
    setEditRole({ ...editRole, permissions: newPerms });
  }

  async function handleSave() {
    if (!editRole) return;
    await upsertRole({
      id: editRole.id || undefined,
      name: editRole.name,
      description: editRole.description,
      permissions: Array.from(editRole.permissions),
    } as any);
    setShowCreate(false);
    setEditRole(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles and their access permissions."
        actions={
          <div className="flex gap-2">
            <Link to="/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Users
              </Button>
            </Link>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Role
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="mt-1">{role.description}</CardDescription>
                  </div>
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{role.user_count ?? 0} users</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 5).map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                  {role.permissions?.length > 5 && (
                    <Badge variant="outline" className="text-xs">+{role.permissions.length - 5}</Badge>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(role)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => deleteRole(role.id)}
                    disabled={isMutating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {roles.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No roles defined yet. Create one to get started.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRole?.id ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              Define the role name, description, and associated permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                placeholder="e.g., content-editor"
                value={editRole?.name || ""}
                onChange={(e) => editRole && setEditRole({ ...editRole, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                placeholder="What this role can do"
                value={editRole?.description || ""}
                onChange={(e) => editRole && setEditRole({ ...editRole, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3 max-h-48 overflow-y-auto">
                {ALL_PERMISSIONS.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={editRole?.permissions.has(perm) ?? false}
                      onChange={() => togglePermission(perm)}
                    />
                    <Key className="h-3 w-3 text-muted-foreground" />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isMutating}>
              {editRole?.id ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
