import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, resolveDest, toPosix } from "../paths";
import { kebabNamePrompt, nestedDestPrompt, newSubdirPrompt } from "../prompts";
import { boundaryPackagePrompt } from "./prompts";

/** Import path from operations dest → models/<kitRel> (extensionless; never `.js`). */
function kitImportFromOpsDest(
  packagePath: string,
  destAbs: string,
  kitRel: string,
): string {
  const opsRoot = path.join(packagePath, "operations");
  const depth = toPosix(path.relative(opsRoot, destAbs))
    .split("/")
    .filter((p) => p && p !== ".").length;
  const up = "../".repeat(depth + 1);
  return `${up}models/${kitRel}`;
}

export function registerCapabilities(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("capabilities", {
    description:
      "Scaffold domain-zod *.capabilities.ts under operations/ (forShapeKit / forPrimitiveKit)",
    prompts: [
      boundaryPackagePrompt(plopOs, rules, "core"),
      nestedDestPrompt(plopOs, rules.operationsDirs, { layer: "operations" }),
      newSubdirPrompt(),
      {
        type: "list",
        name: "kitBase",
        message: "attach to kit kind",
        choices: [
          { name: "shape (forShapeKit)", value: "shape" },
          { name: "primitive (forPrimitiveKit)", value: "primitive" },
        ],
        default: "shape",
      },
      {
        type: "list",
        name: "kitPath",
        message: "kit under models/",
        choices(answers) {
          const modelsDir = path.join(answers.packagePath, "models");
          const rule =
            answers.kitBase === "primitive"
              ? rules.primitiveFiles
              : rules.shapeFiles;
          const hits = plopOs.candidates(rule, modelsDir);
          if (hits.length === 0) {
            throw new Error(
              answers.kitBase === "primitive"
                ? "no *.primitive.ts under that package models/"
                : "no *.shape.ts under that package models/",
            );
          }
          return hits.map((c) => ({ name: c.label, value: c.path }));
        },
      },
      kebabNamePrompt("capabilities name (kebab-case)"),
    ],
    actions(answers) {
      const dest = resolveDest(answers.destPath, answers.newSubdir);
      const rel = relPosix(root, dest);
      const modelsDir = path.join(answers.packagePath, "models");
      const kitRel = toPosix(
        path
          .relative(modelsDir, answers.kitPath)
          .replace(/\.shape\.ts$/, "")
          .replace(/\.primitive\.ts$/, ""),
      );
      answers.kitRel = kitRel;
      answers.kitStem = path.basename(kitRel);
      answers.kitImport = kitImportFromOpsDest(
        answers.packagePath,
        dest,
        kitRel,
      );
      const tpl =
        answers.kitBase === "primitive"
          ? T("kit/capabilities.primitive.ts.hbs")
          : T("kit/capabilities.ts.hbs");
      return [
        {
          type: "add",
          path: `${rel}/{{name}}.capabilities.ts`,
          templateFile: tpl,
          ...defaultFlags(),
        },
      ];
    },
  });
}
