import path from "node:path";
import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { defaultFlags, T } from "../helpers";
import { pascalName } from "../names";
import { relPosix } from "../paths";
import { packageListPrompt } from "../prompts";

export function registerCompositionRoot(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  plop.setGenerator("composition-root", {
    description: "Scaffold server or client composition root for an app",
    prompts: [
      packageListPrompt(plopOs, rules.apps, {
        name: "appPath",
        message: "app",
        emptyError: "no apps — run app first",
      }),
      {
        type: "list",
        name: "runtime",
        message: "runtime",
        choices: [
          { name: "server", value: "server" },
          { name: "client", value: "client" },
        ],
      },
    ],
    actions(answers) {
      const app = plopOs.resolveCandidate(rules.apps, answers.appPath);
      const appName = app.data.appName;
      const runtime = answers.runtime as string;
      answers.runtimeMarker =
        runtime === "server" ? "server-only" : "client-only";
      answers.exportName = `get${pascalName(appName)}${pascalName(runtime)}Root`;
      const rel = relPosix(root, path.join(app.path, "composition"));
      const f = defaultFlags();
      return [
        {
          type: "add",
          path: `${rel}/${appName}.${runtime}.composition.ts`,
          templateFile: T("app/composition-root.ts.hbs"),
          ...f,
        },
      ];
    },
  });
}
