import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api, apiUpload } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

type Account = { id: string; name: string; isDefault?: boolean };

async function getAccounts(): Promise<Account[]> {
  return api("/accounts");
}

type ImportResult = { jobId: string; imported: number; skipped: number; errors: number };

export function Import() {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const defaultAccount = accounts.find((a) => a.isDefault);
  const effectiveAccountId = accountId || defaultAccount?.id || "";

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !effectiveAccountId) throw new Error("Select an account and a file.");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accountId", effectiveAccountId);
      return apiUpload<ImportResult>("/imports", formData);
    },
    onSuccess: (data) => {
      setResult(data);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      toast.success(
        `Imported ${data.imported} transaction(s)${data.skipped > 0 ? `, ${data.skipped} skipped (duplicates)` : ""}`,
      );
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Import failed");
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.name.toLowerCase().endsWith(".csv")) setFile(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear when actually leaving the drop zone (not when moving between div/label)
    const target = e.currentTarget as HTMLElement;
    const related = e.relatedTarget as Node | null;
    if (!related || !target.contains(related)) {
      setDragOver(false);
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Import CSV</h1>
      <p className="text-muted-foreground mt-1">
        Upload a bank CSV with Date, Description, and Amount columns. Duplicates are skipped.
      </p>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Account</Label>
            <Combobox
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              value={effectiveAccountId || null}
              onValueChange={(v) => setAccountId(v ?? "")}
              placeholder="Select account"
              searchPlaceholder="Type to search..."
              triggerClassName="w-full sm:w-[280px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>CSV file</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                file ? "bg-muted/50" : ""
              )}
            >
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csv-file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="csv-file"
                className="cursor-pointer block"
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop(e);
                }}
                onDragOver={handleDragOver}
              >
                {file ? (
                  <p className="font-medium">{file.name}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Drag and drop a CSV here, or click to choose.
                  </p>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              disabled={!effectiveAccountId || !file || uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
            >
              {uploadMutation.isPending ? "Importing..." : "Import"}
            </Button>
            {!uploadMutation.isPending && (!effectiveAccountId || !file) && (
              <p className="text-sm text-muted-foreground">
                {!effectiveAccountId && !file
                  ? "Select an account and choose a CSV file to import."
                  : !effectiveAccountId
                    ? "Select an account to import into."
                    : "Choose a CSV file to import."}
              </p>
            )}
          </div>
          {uploadMutation.error && (
            <p className="text-destructive text-sm">
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : "Import failed"}
            </p>
          )}
          {result && (
            <div className="rounded-md border bg-muted/30 p-4 text-sm">
              <p className="font-medium">Import complete</p>
              <p>Imported: {result.imported}</p>
              <p>Skipped (duplicates): {result.skipped}</p>
              {result.errors > 0 && <p>Errors: {result.errors}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
