import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { PageHeader } from "../../components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useActivityLog } from "../../hooks/use-user-management";
import type { ActivityCategory } from "../../api/users";
import {
  Loader2,
  ArrowLeft,
  Activity,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  UserCheck,
  Key,
  Shield,
  Settings,
  Wrench,
  HelpCircle,
  Filter,
} from "lucide-react";

const CATEGORY_ICONS: Record<ActivityCategory, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  profile_update: UserCheck,
  password_change: Key,
  role_change: Shield,
  admin_action: Wrench,
  api_access: Settings,
  verification: UserCheck,
  recovery: Key,
  other: HelpCircle,
};

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  login: "Login",
  logout: "Logout",
  profile_update: "Profile Update",
  password_change: "Password Change",
  role_change: "Role Change",
  admin_action: "Admin Action",
  api_access: "API Access",
  verification: "Verification",
  recovery: "Recovery",
  other: "Other",
};

export function ActivityPage() {
  const {
    entries,
    isLoading,
    page,
    pageSize,
    total,
    setCategory,
    setDateRange,
    setPage,
    setSuspicious,
    params,
  } = useActivityLog();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Monitor user actions and security events across the system."
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Users
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-36"
            onChange={(e) => setDateRange(e.target.value || undefined, params.to_date)}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            className="w-36"
            onChange={(e) => setDateRange(params.from_date, e.target.value || undefined)}
          />
        </div>

        <Button
          variant={params.suspicious ? "destructive" : "outline"}
          size="sm"
          onClick={() => setSuspicious(params.suspicious ? undefined : true)}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          Suspicious only
        </Button>
      </div>

      {/* Activity feed */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-1">
              {entries.map((entry) => {
                const Icon = CATEGORY_ICONS[entry.category] || HelpCircle;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors ${
                      entry.suspicious ? "bg-destructive/5" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1.5 ${
                        entry.suspicious ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry.suspicious ? <AlertTriangle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to="/users/$userId"
                          params={{ userId: entry.user_id }}
                          className="text-sm font-medium hover:text-primary hover:underline"
                        >
                          {entry.user_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{entry.action}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {CATEGORY_LABELS[entry.category] || entry.category}
                        </Badge>
                        {entry.suspicious && (
                          <Badge variant="destructive" className="text-[10px] px-1.5">Suspicious</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span>{new Date(entry.created_at).toLocaleString()}</span>
                        <span>IP: {entry.ip_address}</span>
                        <span className="truncate max-w-xs">{entry.user_agent}</span>
                      </div>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground truncate max-w-lg">
                          {JSON.stringify(entry.details)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No activity records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / pageSize)} ({total} entries)
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
