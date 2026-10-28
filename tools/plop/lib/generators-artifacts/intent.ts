import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { boundaryNameFromPackageDir } from "../names";
import { packageRootImport, relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { boundaryPackagePrompt } from "./prompts";

export function registerIntent(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("intent", {
    description:
      "Scaffold *.intent.ts under intents/ (optional sibling *.provider.ts)",
    prompts: [
      boundaryPackagePrompt(plopOs, rules, "boundary"),
      nestedDestPrompt(plopOs, rules.intentsDirs, { layer: "intents" }),
      newSubdirPrompt(),
      kebabNamePrompt("intent name (kebab-case)"),
      {
        type: "confirm",
        name: "withProvider",
        message: "also create sibling *.provider.ts?",
        default: false,
      },
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      answers.boundary = boundaryNameFromPackageDir(
        path.basename(answers.packagePath),
      );
      answers.boundaryImport = packageRootImport(
        answers.packagePath,
        dest,
        "boundary",
      );
      const f = defaultFlags();
      const actions = [
        {
          type: "add" as const,
          path: `${rel}/{{name}}.intent.ts`,
          templateFile: T("intent/intent.ts.hbs"),
          ...f,
        },
      ];
      if (answers.withProvider) {
        answers.intent = answers.name;
        answers.intentFile = answers.name;
        actions.push({
          type: "add",
          path: `${rel}/{{name}}.provider.ts`,
          templateFile: T("intent/provider.ts.hbs"),
          ...f,
        });
      }
      return actions;
    },
  });
}
