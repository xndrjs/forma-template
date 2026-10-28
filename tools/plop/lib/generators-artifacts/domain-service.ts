import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { boundaryPackagePrompt } from "./prompts";

export function registerDomainService(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("domain-service", {
    description: "Scaffold *.service.ts under operations/",
    prompts: [
      boundaryPackagePrompt(plopOs, rules, "core"),
      nestedDestPrompt(plopOs, rules.operationsDirs, { layer: "operations" }),
      newSubdirPrompt(),
      kebabNamePrompt("service name (kebab-case)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.service.ts`,
          templateFile: T("kit/service.ts.hbs"),
          ...defaultFlags(),
        },
      ];
    },
  });
}
