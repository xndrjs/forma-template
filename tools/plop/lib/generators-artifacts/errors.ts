import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { boundaryPackagePrompt } from "./prompts";

export function registerErrors(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("errors", {
    description:
      "Scaffold *.error.ts under errors/ (core, adapter, or infrastructure)",
    prompts: [
      boundaryPackagePrompt(plopOs, rules, "boundary"),
      nestedDestPrompt(plopOs, rules.errorsDirs, { layer: "errors" }),
      newSubdirPrompt(),
      kebabNamePrompt("error name (kebab-case, without -error suffix)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      answers.constantName = String(answers.name)
        .split("-")
        .map((s: string) => s.toUpperCase())
        .join("_");
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.error.ts`,
          templateFile: T("kit/error.ts.hbs"),
          ...defaultFlags(),
        },
      ];
    },
  });
}
