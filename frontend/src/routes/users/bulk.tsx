import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { PageHeader } from "../../components/PageHeader";
import {
  ArrowLeft,
  Download,
  Upload,
  Users,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Shield,
  Ban,
} from "lucide-react";

type BulkAction = "activate" | "suspend" | "delete" | "change-role";

export function BulkPage() {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text.trim()) {
        setCsvError("File is empty");
        return;
      }
      setCsvData(text);
      setCsvError(null);
    };
    reader.onerror = () => setCsvError("Failed to read file");
    reader.readAsText(file);
  }

  async function handleAction(action: BulkAction) {
    setProcessing(true);
    setResult(null);

    try {
      // Simulate processing for now
      await new Promise((r) => setTimeout(r, 1500));

      const actionLabels: Record<BulkAction, string> = {
        activate: "activated",
        suspend: "suspended",
        delete: "deleted",
        "change-role": "updated",
      };

      setResult({
        success: true,
        message: `Users have been ${actionLabels[action]} successfully.`,
      });
    } catch {
      setResult({ success: false, message: "Operation failed. Please try again." });
    } finally {
      setProcessing(false);
    }
  }

  function handleExport() {
    // Simulate CSV export
    const headers = ["id", "email", "first_name", "last_name", "role", "status", "created_at"];
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Operations"
        description="Import, export, and manage users in bulk."
        actions={
          <Link to="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Users
            </Button>
          </Link>
        }
      />

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Import Users</CardTitle>
                <CardDescription>Upload a CSV file with user data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Drop a CSV file or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span>Select file</span>
                </Button>
              </label>
            </div>

            {csvError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            {csvData && (
              <div>
                <p className="text-sm font-medium mb-2">File loaded</p>
                <div className="rounded-md bg-muted p-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-muted-foreground">
                    {csvData.split("\n").slice(0, 5).join("\n")}
                    {csvData.split("\n").length > 5 && "\n..."}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {csvData.split("\n").length - 1} rows detected
                </p>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!csvData || processing}
              onClick={() => handleAction("activate")}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import and Activate
            </Button>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Export Users</CardTitle>
                <CardDescription>Download user data as CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export all users with their roles, status, and metadata.
            </p>
            <Button className="w-full" variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>Apply actions to all selected users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleAction("activate")}
                disabled={processing}
              >
                <Shield className="mr-2 h-4 w-4 text-emerald-500" /> Activate All
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleAction("suspend")}
                disabled={processing}
              >
                <Ban className="mr-2 h-4 w-4 text-amber-500" /> Suspend All
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleAction("change-role")}
                disabled={processing}
              >
                <Shield className="mr-2 h-4 w-4 text-blue-500" /> Change Role
              </Button>
              <Button
                variant="outline"
                className="justify-start text-destructive"
                onClick={() => handleAction("delete")}
                disabled={processing}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete All
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Warning: Bulk actions affect all users in the system and cannot be undone.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
