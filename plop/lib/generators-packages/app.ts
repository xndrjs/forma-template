import type { NodePlopAPI } from "plop";

import { defaultFlags, T } from "../helpers";
import { kebabValidate } from "../names";

export function registerApp(plop: NodePlopAPI): void {
  plop.setGenerator("app", {
    description: "Scaffold apps/<name> with composition/",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "app name (kebab-case)",
        validate: kebabValidate,
      },
    ],
    actions(answers) {
      const base = `apps/${answers.name}`;
      const f = defaultFlags();
      return [
        {
          type: "add",
          path: `${base}/package.json`,
          templateFile: T("boundary/app-package.json.hbs"),
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
          path: `${base}/composition/.gitkeep`,
          template: "",
          ...f,
        },
      ];
    },
  });
}
