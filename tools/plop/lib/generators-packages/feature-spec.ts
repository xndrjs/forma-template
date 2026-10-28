import type { NodePlopAPI } from "plop";

import { defaultFlags, T } from "../helpers";
import { kebabValidate } from "../names";

export function registerFeatureSpec(plop: NodePlopAPI): void {
  plop.setGenerator("feature-spec", {
    description: "Scaffold specs/<feature>/SPEC.md + DESIGN.md",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "feature name (kebab-case)",
        validate: kebabValidate,
      },
    ],
    actions(answers) {
      const base = `specs/${answers.name}`;
      const f = defaultFlags();
      return [
        {
          type: "add",
          path: `${base}/SPEC.md`,
          templateFile: T("spec/SPEC.md.hbs"),
          ...f,
        },
        {
          type: "add",
          path: `${base}/DESIGN.md`,
          templateFile: T("spec/DESIGN.md.hbs"),
          ...f,
        },
      ];
    },
  });
}
