import type { NodePlopAPI } from "plop";

import { defaultFlags, T } from "../helpers";
import { kebabValidate } from "../names";

export function registerCoreBoundary(plop: NodePlopAPI): void {
  plop.setGenerator("core-boundary", {
    description: "Scaffold packages/core-<feature> Forma boundary",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "feature name (kebab-case)",
        validate: kebabValidate,
      },
    ],
    actions(answers) {
      const base = `packages/core-${answers.name}`;
      answers.boundary = answers.name;
      const f = defaultFlags();
      return [
        {
          type: "add",
          path: `${base}/package.json`,
          templateFile: T("boundary/core-package.json.hbs"),
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
          templateFile: T("boundary/core-readme.md.hbs"),
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
          path: `${base}/models/index.ts`,
          templateFile: T("boundary/models-index.ts.hbs"),
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
          path: `${base}/operations/index.ts`,
          templateFile: T("boundary/operations-index.ts.hbs"),
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
