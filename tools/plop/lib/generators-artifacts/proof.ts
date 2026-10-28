import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { coreModelsPrompt } from "./prompts";

export function registerProof(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("proof", {
    description: "Scaffold domain-zod *.proof.ts under core models/",
    prompts: [
      coreModelsPrompt(plopOs, rules),
      nestedDestPrompt(plopOs, rules.modelsDirs, { layerPathKey: "layerPath" }),
      newSubdirPrompt(),
      kebabNamePrompt("proof name (kebab-case)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.proof.ts`,
          templateFile: T("kit/proof.ts.hbs"),
          ...defaultFlags(),
        },
      ];
    },
  });
}
