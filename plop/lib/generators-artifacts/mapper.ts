import fs from "node:fs";
import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { relPosix, toPosix } from "../paths";
import { packageListPrompt } from "../prompts";

type PkgJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

function absUnderRoot(root: string, p: string): string {
  return path.isAbsolute(p) ? p : path.join(root, p);
}

/** Ensure `@core/<feature>` is listed in the adapter package.json; returns whether it was added. */
function ensureCoreDependency(
  adapterPkgJsonAbs: string,
  feature: string,
): boolean {
  const depName = `@core/${feature}`;
  const pkg = JSON.parse(fs.readFileSync(adapterPkgJsonAbs, "utf8")) as PkgJson;
  const deps = pkg.dependencies ?? {};
  if (deps[depName] || pkg.devDependencies?.[depName]) return false;
  // Keep @core first (matches adapter-package.json.hbs convention).
  pkg.dependencies = { [depName]: "workspace:*", ...deps };
  fs.writeFileSync(adapterPkgJsonAbs, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

export function registerMapper(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("mapper", {
    description:
      "Scaffold *.mapper.ts stub (mapRawTo from core shape) under adapter mappers/",
    prompts: [
      packageListPrompt(plopOs, rules.adapterPackages, {
        name: "packagePath",
        message: "adapter package",
        emptyError: "no adapters — run adapter-boundary first",
      }),
      packageListPrompt(plopOs, rules.corePackages, {
        name: "corePath",
        message: "core package",
        emptyError: "no cores — run core-boundary first",
      }),
      {
        type: "list",
        name: "shapePath",
        message: "core domain model (shape)",
        choices(answers) {
          const core = plopOs.resolveCandidate(
            rules.corePackages,
            String(answers.corePath),
          );
          answers.feature = core.data.feature;
          const modelsDir = path.join(core.path, "models");
          const hits = plopOs.candidates(rules.shapeFiles, modelsDir);
          if (hits.length === 0) {
            throw new Error(
              `no *.shape.ts under @core/${core.data.feature}/models — run shape first`,
            );
          }
          return hits.map((c) => ({ name: c.label, value: c.path }));
        },
      },
    ],
    actions(answers) {
      const core = plopOs.resolveCandidate(
        rules.corePackages,
        String(answers.corePath),
      );
      const feature = core.data.feature as string;
      answers.feature = feature;

      const modelsDir = path.join(core.path, "models");
      const shapeAbs = absUnderRoot(root, String(answers.shapePath));
      const shapeRel = toPosix(
        path.relative(absUnderRoot(root, modelsDir), shapeAbs).replace(
          /\.shape\.ts$/,
          "",
        ),
      );
      // Core kit type uses the file stem (nested dirs don't change the export name).
      answers.name = path.basename(shapeRel);

      const adapterAbs = absUnderRoot(root, String(answers.packagePath));
      const mappersDir = path.join(adapterAbs, "mappers");
      const relDir = relPosix(
        root,
        path.join(mappersDir, path.dirname(shapeRel)),
      );
      const fileName = path.basename(shapeRel);
      const adapterPkgJson = path.join(adapterAbs, "package.json");

      return [
        {
          type: "add",
          path: `${relDir}/${fileName}.mapper.ts`,
          templateFile: T("mapper/mapper.ts.hbs"),
          ...defaultFlags(),
        },
        () => {
          if (!fs.existsSync(adapterPkgJson)) {
            throw new Error(`missing package.json at ${adapterPkgJson}`);
          }
          const added = ensureCoreDependency(adapterPkgJson, feature);
          return added
            ? `added @core/${feature} dependency to ${relPosix(root, adapterPkgJson)}`
            : `skipped — @core/${feature} already in ${relPosix(root, adapterPkgJson)}`;
        },
      ];
    },
  });
}
