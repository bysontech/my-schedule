import { exportAll, validateBackup, importAll, type BackupJson } from "../db/backupRepo";

export type ImportErrorCode = "json_parse_error" | "backup_format_error";

export class ImportError extends Error {
  code: ImportErrorCode;
  constructor(code: ImportErrorCode) {
    super(code);
    this.code = code;
  }
}

export async function downloadExport(): Promise<void> {
  const backup = await exportAll();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `my-schedule-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError("json_parse_error");
  }

  if (!validateBackup(parsed)) {
    throw new ImportError("backup_format_error");
  }

  await importAll(parsed as BackupJson);
}
