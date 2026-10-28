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
      "Scaffold domain-zod *.shape.ts (core) or plain Zod *.schema.ts (infra)",
    prompts: [
      {
        type: "list",
        name: "kind",
        message: "package kind",
        choices: [
          { name: "core (@xndrjs/domain-zod shape)", value: "core" },
          { name: "infrastructure (plain Zod schema)", value: "infra" },
        ],
      },
      {
        type: "list",
        name: "layerPath",
        message(answers) {
          return answers.kind === "core"
            ? "package models/"
            : "package schemas/";
        },
        choices(answers) {
          const hits =
            answers.kind === "core"
              ? plopOs.candidates(rules.coreModels)
              : plopOs.candidates(rules.infraSchemas);
          if (hits.length === 0)
            throw new Error(
              answers.kind === "core"
                ? "no models dirs for that kind"
                : "no schemas dirs for that kind",
            );
          return hits.map((c) => ({ name: c.label, value: c.path }));
        },
        validate(v: unknown, answers) {
          try {
            if (answers.kind === "core") {
              plopOs.resolveCandidate(rules.coreModels, String(v));
            } else {
              plopOs.resolveCandidate(rules.infraSchemas, String(v));
            }
            return true;
          } catch (e) {
            return e instanceof Error ? e.message : "invalid";
          }
        },
      },
      {
        ...nestedDestPrompt(plopOs, rules.modelsDirs, {
          layerPathKey: "layerPath",
        }),
        when(answers: { kind?: string }) {
          return answers.kind === "core";
        },
      },
      {
        ...nestedDestPrompt(plopOs, rules.schemasDirs, {
          layerPathKey: "layerPath",
        }),
        when(answers: { kind?: string }) {
          return answers.kind === "infra";
        },
      },
      newSubdirPrompt(),
      kebabNamePrompt("name (kebab-case)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      if (answers.kind === "infra") {
        return [
          {
            type: "add",
            path: `${rel}/{{name}}.schema.ts`,
            templateFile: T("kit/schema.zod.ts.hbs"),
            ...defaultFlags(),
          },
        ];
      }
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.shape.ts`,
          templateFile: T("kit/shape.domain.ts.hbs"),
          ...defaultFlags(),
        },
      ];
    },
  });
}
