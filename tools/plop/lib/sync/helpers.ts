import fs from "node:fs";
import path from "node:path";
import type { SyncContext } from "@xndrjs/plop-os";

/**
 * Relpath export line from a layer barrel.
 * Extensionless specifier only — never append `.js` / `.ts`.
 */
export function exportLine(layerDir: string, fileAbs: string): string {
  const rel = path
    .relative(layerDir, fileAbs)
    .split(path.sep)
    .join("/")
    .replace(/\.ts$/, "");
  return `export * from "./${rel}";`;
}

export function barrelFromRules(ctx: SyncContext, ruleNames: string[]): string {
  const layerDir = path.dirname(ctx.filePath);
  const lines: string[] = [];
  for (const name of ruleNames) {
    for (const hit of ctx.discovery.listCandidates(name, layerDir)) {
      lines.push(exportLine(layerDir, hit.path));
    }
  }
  lines.sort();
  return lines.length ? `${lines.join("\n")}\n` : "";
}

/** Ensure a file contains a sync region (used when retrofitting). */
export function wrapSyncRegion(syncId: string, body: string): string {
  const trimmed = body.replace(/\s+$/, "");
  return `// plop-os-sync start ${syncId}\n${trimmed ? `${trimmed}\n` : ""}// plop-os-sync end ${syncId}\n`;
}

/** Read existing barrel and wrap exports in markers if missing. */
export function ensureSyncMarkers(absPath: string, syncId: string): void {
  if (!fs.existsSync(absPath)) return;
  const text = fs.readFileSync(absPath, "utf8");
  if (text.includes(`plop-os-sync start ${syncId}`)) return;
  const exportsOnly = text
    .split("\n")
    .filter((l) => l.trim().startsWith("export "))
    .join("\n");
  const preface = text
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("export "))
    .join("\n");
  const next =
    (preface ? `${preface}\n` : "") + wrapSyncRegion(syncId, exportsOnly);
  fs.writeFileSync(absPath, next);
}
