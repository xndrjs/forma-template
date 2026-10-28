import type { NodePlopAPI } from "plop";

import { defaultFlags, T } from "../helpers";
import { kebabValidate } from "../names";

export function registerUiPackage(plop: NodePlopAPI): void {
  plop.setGenerator("ui-package", {
    description: "Scaffold packages/ui-<name>",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "ui package name (kebab-case)",
        validate: kebabValidate,
      },
    ],
    actions(answers) {
      const base = `packages/ui-${answers.name}`;
      const f = defaultFlags();
      return [
        {
          type: "add",
          path: `${base}/package.json`,
          templateFile: T("boundary/ui-package.json.hbs"),
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
          templateFile: T("boundary/ui-readme.md.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/index.ts`,
          templateFile: T("boundary/ui-index.ts.hbs"),
          ...f,
        },
      ];
    },
  });
}
