import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { coreModelsPrompt } from "./prompts";

export function registerPrimitive(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("primitive", {
    description: "Scaffold domain-zod *.primitive.ts under core models/",
    prompts: [
      coreModelsPrompt(plopOs, rules),
      nestedDestPrompt(plopOs, rules.modelsDirs, { layerPathKey: "layerPath" }),
      newSubdirPrompt(),
      kebabNamePrompt("primitive name (kebab-case)"),
      {
        type: "list",
        name: "scalar",
        message: "primitive base scalar",
        choices: [
          { name: "string", value: "string" },
          { name: "number", value: "number" },
          { name: "boolean", value: "boolean" },
        ],
        default: "string",
      },
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      const scalar =
        answers.scalar === "number" || answers.scalar === "boolean"
          ? answers.scalar
          : "string";
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.primitive.ts`,
          templateFile: T(`kit/primitive.${scalar}.ts.hbs`),
          ...defaultFlags(),
        },
      ];
    },
  });
}
