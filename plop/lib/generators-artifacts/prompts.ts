import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { packageListPrompt } from "../prompts";

type BoundaryScope = "core" | "boundary";

export function coreModelsPrompt(plopOs: PlopOs, rules: FormaDiscoveryRules) {
  return packageListPrompt(plopOs, rules.coreModels, {
    name: "layerPath",
    message: "core (models)",
    emptyError: "no core models dirs — run core-boundary first",
  });
}

export function boundaryPackagePrompt(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  scope: BoundaryScope,
) {
  return {
    type: "list" as const,
    name: "packagePath",
    message: "package",
    choices() {
      const hits =
        scope === "core"
          ? plopOs.candidates(rules.corePackages)
          : [
              ...plopOs.candidates(rules.corePackages),
              ...plopOs.candidates(rules.adapterPackages),
              ...plopOs.candidates(rules.infraPackages),
            ];
      if (hits.length === 0) throw new Error("no packages found");
      return hits.map((c) => {
        const kind = c.path.includes("/core-")
          ? "core"
          : c.path.includes("/adapter-")
            ? "adapter"
            : "infra";
        return { name: `${kind}/${c.label}`, value: c.path };
      });
    },
  };
}
