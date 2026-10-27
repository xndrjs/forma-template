import fs from "node:fs";
import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix } from "../paths";
import { boundaryPackagePrompt } from "./prompts";

export function registerProvider(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("provider", {
    description:
      "Scaffold *.provider.ts for an unrealized intent (no sibling provider yet)",
    prompts: [
      boundaryPackagePrompt(plopOs, rules, "boundary"),
      {
        type: "list",
        name: "intentPath",
        message: "intent without provider",
        choices(answers) {
          const intentsDir = path.join(answers.packagePath, "intents");
          const intents = plopOs.candidates(rules.intentFiles, intentsDir);
          const open = intents.filter((c) => {
            const providerPath = c.path.replace(
              /\.intent\.ts$/,
              ".provider.ts",
            );
            return !fs.existsSync(providerPath);
          });
          if (open.length === 0) {
            throw new Error("no unrealized intents (all have providers)");
          }
          return open.map((c) => ({
            name: c.label,
            value: c.path,
          }));
        },
      },
    ],
    actions(answers) {
      const intentPath = answers.intentPath as string;
      const base = intentPath.replace(/\.intent\.ts$/, "");
      const intentFile = path.basename(base);
      answers.intent = intentFile;
      answers.intentFile = intentFile;
      const relDir = relPosix(root, path.dirname(intentPath));
      return [
        {
          type: "add",
          path: `${relDir}/${intentFile}.provider.ts`,
          templateFile: T("intent/provider.ts.hbs"),
          ...defaultFlags(),
        },
      ];
    },
  });
}
