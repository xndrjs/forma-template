import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { packageListPrompt } from "../prompts";

export function registerAdapterBoundary(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plop.setGenerator("adapter-boundary", {
    description:
      "Scaffold adapter-<feature>-<vendors…> joining core + infra stack",
    prompts: [
      packageListPrompt(plopOs, rules.corePackages, {
        name: "corePath",
        message: "core package",
        emptyError: "no cores — run core-boundary first",
      }),
      {
        type: "checkbox",
        name: "infraPaths",
        message: "infrastructure packages in the stack",
        choices() {
          const hits = plopOs.candidates(rules.infraPackages);
          if (hits.length === 0) {
            throw new Error(
              "no infrastructure packages — run infrastructure-boundary first",
            );
          }
          return hits.map((c) => ({ name: c.label, value: c.path }));
        },
        validate(v: unknown) {
          return Array.isArray(v) && v.length > 0
            ? true
            : "select at least one infrastructure package";
        },
      },
    ],
    actions(answers) {
      const core = plopOs.resolveCandidate(
        rules.corePackages,
        answers?.corePath,
      );
      const vendors = (answers.infraPaths as string[]).map((p) => {
        const c = plopOs.resolveCandidate(rules.infraPackages, p);
        return c.data.vendor;
      });
      const feature = core.data.feature;
      const stack = `${feature}-${vendors.join("-")}`;
      const base = `packages/adapter-${stack}`;
      const f = defaultFlags();
      answers.feature = feature;
      answers.vendors = vendors;
      answers.stack = stack;
      answers.boundary = stack;
      return [
        {
          type: "add",
          path: `${base}/package.json`,
          templateFile: T("boundary/adapter-package.json.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/tsconfig.json`,
          templateFile: T("boundary/package-tsconfig.json.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/README.md`,
          templateFile: T("boundary/adapter-readme.md.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/boundary.ts`,
          templateFile: T("boundary/boundary.ts.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/mappers/index.ts`,
          templateFile: T("boundary/mappers-index.ts.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/errors/index.ts`,
          templateFile: T("boundary/errors-index.ts.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/intents/index.intents.ts`,
          templateFile: T("boundary/intents-barrel.ts.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/intents/index.providers.ts`,
          templateFile: T("boundary/providers-barrel.ts.hbs"),
          ...f,
        },
      ];
    },
  });
}
