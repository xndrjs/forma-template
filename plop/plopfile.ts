import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import { registerDiscovery } from "./lib/discovery";
import { registerArtifactGenerators } from "./lib/generators-artifacts";
import { registerPackageGenerators } from "./lib/generators-packages";
import { camelName, pascalName } from "./lib/names";
import { registerSync } from "./lib/sync";

/** Repo root (parent of `plop/`). */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const plopOs = createPlopOs({
  roots: [root],
  ignore: [
    "node_modules",
    "dist",
    ".git",
    "coverage",
    ".tsbuild",
    "plop/templates",
  ],
});

export const rules = registerDiscovery(plopOs);
registerSync(plopOs, rules, root);

export default function (plop: NodePlopAPI): void {
  plop.setHelper("pascalName", pascalName);
  plop.setHelper("camelName", camelName);

  registerPackageGenerators(plop, plopOs, rules, root);
  registerArtifactGenerators(plop, plopOs, rules, root);
}
