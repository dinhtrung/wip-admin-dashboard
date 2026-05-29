import { Link, useParams } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageHeader } from "../../components/PageHeader";
import { useUserDetail } from "../../hooks/use-user-management";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Monitor,
  MapPin,
  Clock,
  AlertTriangle,
  User,
  Activity,
  Save,
} from "lucide-react";
import { useState } from "react";

export function UserDetailPage() {
  const { userId } = useParams({ from: "/users/$userId" });
  const { user, sessions, activity, isLoading, isUpdating, updateUser } = useUserDetail(userId);

  const [editingRole, setEditingRole] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="mt-2 text-muted-foreground">The user with ID {userId} does not exist.</p>
        <Link to="/users" className="mt-4 inline-block text-primary hover:underline">
          &larr; Back to users
        </Link>
      </div>
    );
  }

  const initials = ((user.first_name?.[0] || "") + (user.last_name?.[0] || user.email?.[0]?.toUpperCase() || "?")).substring(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name || `${user.first_name} ${user.last_name}`.trim() || user.email}
        description={`User ID: ${user.id}`}
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-2">{user.name || `${user.first_name} ${user.last_name}`.trim()}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              {editingRole ? (
                <div className="flex items-center gap-1">
                  <Select value={editRole} onValueChange={setEditRole}>
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={async () => {
                      await updateUser({ role: editRole as AdminUser["role"] });
                      setEditingRole(false);
                    }}
                    disabled={isUpdating}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditRole(user.role);
                    setEditingRole(true);
                  }}
                >
                  <Badge variant={user.role === "admin" ? "default" : user.role === "editor" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </button>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {editingStatus ? (
                <div className="flex items-center gap-1">
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={async () => {
                      await updateUser({ status: editStatus as AdminUser["status"] });
                      setEditingStatus(false);
                    }}
                    disabled={isUpdating}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditStatus(user.status);
                    setEditingStatus(true);
                  }}
                >
                  <Badge
                    variant={
                      user.status === "active" ? "default" : user.status === "inactive" ? "secondary" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </button>
              )}
            </div>

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.joined).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {new Date(user.updated_at).toLocaleDateString()}</span>
            </div>
            {user.metadata && Object.keys(user.metadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Metadata</span>
                  {Object.entries(user.metadata).map(([key, val]) => (
                    <p key={key} className="text-xs text-muted-foreground">
                      {key}: {String(val)}
                    </p>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Recent login sessions and devices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.filter((s) => s.active).map((session) => (
                    <div key={session.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <Monitor className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.user_agent}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {session.location || "Unknown"}
                          </span>
                          <span>{session.ip_address}</span>
                          <span>Expires {new Date(session.expires_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="default" className="shrink-0 text-xs">Active</Badge>
                    </div>
                  ))}
                  {sessions.filter((s) => !s.active).slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-start gap-3 rounded-lg border border-muted p-3 opacity-60">
                      <Clock className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{session.user_agent}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {session.location || "Unknown"}
                          </span>
                          <span>{session.ip_address}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">Expired</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No session data available</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions for this user</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activity && activity.length > 0 ? (
                <div className="space-y-2">
                  {activity.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
                      {entry.suspicious ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                      ) : (
                        <Activity className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{entry.action}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5">{entry.category}</Badge>
                          {entry.suspicious && (
                            <Badge variant="destructive" className="text-[10px] px-1.5">Suspicious</Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span>{new Date(entry.created_at).toLocaleString()}</span>
                          <span>{entry.ip_address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Needed for the role/status editing types
import type { AdminUser } from "../../api/users";
