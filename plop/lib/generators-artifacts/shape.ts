import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";

export function registerShape(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("shape", {
    description:
      "Scaffold domain-zod *.shape.ts (core) or plain Zod shape (adapter/infra)",
    prompts: [
      {
        type: "list",
        name: "kind",
        message: "package kind",
        choices: [
          { name: "core (@xndrjs/domain-zod shape)", value: "core" },
          { name: "adapter (plain Zod)", value: "adapter" },
          { name: "infrastructure (plain Zod)", value: "infra" },
        ],
      },
      {
        type: "list",
        name: "layerPath",
        message: "package models/",
        choices(answers) {
          const hits =
            answers.kind === "core"
              ? plopOs.candidates(rules.coreModels)
              : answers.kind === "adapter"
                ? plopOs.candidates(rules.adapterModels)
                : plopOs.candidates(rules.infraModels);
          if (hits.length === 0)
            throw new Error("no models dirs for that kind");
          return hits.map((c) => ({ name: c.label, value: c.path }));
        },
        validate(v: unknown, answers) {
          try {
            if (answers.kind === "core") {
              plopOs.resolveCandidate(rules.coreModels, String(v));
            } else if (answers.kind === "adapter") {
              plopOs.resolveCandidate(rules.adapterModels, String(v));
            } else {
              plopOs.resolveCandidate(rules.infraModels, String(v));
            }
            return true;
          } catch (e) {
            return e instanceof Error ? e.message : "invalid";
          }
        },
      },
      nestedDestPrompt(plopOs, rules.modelsDirs, { layerPathKey: "layerPath" }),
      newSubdirPrompt(),
      kebabNamePrompt("shape name (kebab-case)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      const tpl =
        answers.kind === "core"
          ? T("kit/shape.domain.ts.hbs")
          : T("kit/shape.zod.ts.hbs");
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.shape.ts`,
          templateFile: tpl,
          ...defaultFlags(),
        },
      ];
    },
  });
}
