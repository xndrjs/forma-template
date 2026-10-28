import path from "node:path";

export function toPosix(abs: string): string {
  return abs.split(path.sep).join("/");
}

/** Relpath from repo root, posix. */
export function relPosix(root: string, abs: string): string {
  return toPosix(path.relative(root, abs));
}

/** Label nested dest under a layer root. */
export function destLabel(layerRootAbs: string, destAbs: string): string {
  const rel = toPosix(path.relative(layerRootAbs, destAbs));
  return rel === "" || rel === "." ? "(layer root)" : rel;
}

/** Effective destination: selected dest + optional newSubdir. */
export function resolveDest(destPath: string, newSubdir?: string): string {
  const sub = (newSubdir ?? "").trim();
  if (!sub) return destPath;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(sub)) {
    throw new Error("newSubdir must be kebab path segments (e.g. strips/hero)");
  }
  return path.join(destPath, ...sub.split("/"));
}

/** Relative import from `destAbs` to `packagePath/<moduleName>` (no extension). */
export function packageRootImport(
  packagePath: string,
  destAbs: string,
  moduleName: string,
): string {
  const rel = toPosix(path.relative(destAbs, path.join(packagePath, moduleName)));
  return rel.startsWith(".") ? rel : `./${rel}`;
}
