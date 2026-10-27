import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";

export function registerRootTsconfigRefs(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  repoRoot: string,
): void {
  plopOs.syncGenerator("root-tsconfig-refs", (ctx) => {
    const hits = [
      ...ctx.discovery.listCandidates(rules.tsconfigPackages),
      ...ctx.discovery.listCandidates(rules.eslintRulesTsconfig),
    ];
    const refs = hits
      .map((h) => {
        const dir = path.dirname(h.path);
        const rel = path.relative(repoRoot, dir).split(path.sep).join("/");
        return rel;
      })
      .filter((r) => r && r !== ".")
      .sort();
    const unique = [...new Set(refs)];
    const lines = unique.map((r) => `    { "path": "./${r}" }`);
    return lines.length ? `${lines.join(",\n")}\n` : "";
  });
}
