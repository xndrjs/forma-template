import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import checkFile from "eslint-plugin-check-file";
import tseslint from "typescript-eslint";
import plugin from "./eslint-rules/index.mjs";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const scaffoldPackageSources = [
  "packages/core-*/**/*.{ts,tsx}",
  "packages/infrastructure-*/**/*.{ts,tsx}",
  "packages/adapter-*/**/*.{ts,tsx}",
  "packages/ui-*/**/*.{ts,tsx}",
];
const scaffoldPackageMarkdown = [
  "packages/core-*/**/*.md",
  "packages/infrastructure-*/**/*.md",
  "packages/adapter-*/**/*.md",
  "packages/ui-*/**/*.md",
];

const jsTsFiles = [
  "apps/**/*.{js,cjs,mjs,ts,tsx}",
  "packages/**/*.{js,cjs,mjs,ts,tsx}",
  "plop/**/*.{js,cjs,mjs,ts}",
  "plopfile.mjs",
  "eslint.config.js",
  "lint-staged.config.js",
  "vitest.config.ts",
];

const sourceFiles = [
  "apps/**/*.{js,mjs,cjs,ts,tsx}",
  "packages/**/*.{js,mjs,cjs,ts,tsx}",
];
const compositionFiles = ["apps/*/composition/**/*.{js,mjs,cjs,ts,tsx}"];
const coreFiles = ["packages/core-*/**/*.{js,mjs,cjs,ts,tsx}"];
const infrastructureFiles = [
  "packages/infrastructure-*/**/*.{js,mjs,cjs,ts,tsx}",
];
const adapterFiles = ["packages/adapter-*/**/*.{js,mjs,cjs,ts,tsx}"];

/** Entrypoint `/providers` — composition-only (overridden below for composition). */
const providersImportBan = {
  group: [
    "@core/*/providers",
    "@core/*/providers/**",
    "@infrastructure/*/providers",
    "@infrastructure/*/providers/**",
    "@adapter/*/providers",
    "@adapter/*/providers/**",
  ],
  message:
    "Import /providers only from apps/*/composition/**. Elsewhere use intents, models, or composition roots.",
};

const deepCoreImportBan = {
  group: ["@core/*/*/**"],
  message:
    "Import core packages through fixed entry points only: @core/<feature>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

const deepInfraImportBan = {
  group: ["@infrastructure/*/*/**"],
  message:
    "Import infrastructure through fixed entry points only: @infrastructure/<vendor>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

const deepAdapterImportBan = {
  group: ["@adapter/*/*/**"],
  message:
    "Import adapter packages through fixed entry points only: @adapter/<stack>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

/** Same-package capture templates (boundaries Handlebars selectors). */
/** v6 Handlebars paths: `from` / `to` are the element descriptors (not `from.element`). */
const sameFeature = { feature: "{{ from.captured.feature }}" };
const sameInfra = {
  infrastructure: "{{ from.captured.infrastructure }}",
};
const sameAdapter = { adapter: "{{ from.captured.adapter }}" };

export default defineConfig(
  {
    ignores: [
      "node_modules/**",
      "**/dist/**",
      "**/.tsbuild/**",
      "build/**",
      "coverage/**",
      ".next/**",
      ".turbo/**",
      ".nx/**",
      "eslint-rules/**",
    ],
  },
  {
    files: jsTsFiles,
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? jsTsFiles,
  })),
  {
    files: jsTsFiles,
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: sourceFiles,
    plugins: {
      boundaries,
      "check-file": checkFile,
    },
    settings: {
      "boundaries/include": ["apps/**/*", "packages/**/*"],
      "import/resolver": {
        typescript: {
          project: [path.join(repoRoot, "tsconfig.eslint.json")],
        },
      },
      "boundaries/elements": [
        {
          type: "app-composition",
          mode: "folder",
          pattern: "apps/*/composition",
          capture: ["app"],
        },
        {
          type: "app",
          mode: "folder",
          pattern: "apps/*",
          capture: ["app"],
        },
        {
          type: "core-errors",
          mode: "folder",
          pattern: "packages/core-*/errors",
          capture: ["feature"],
        },
        {
          type: "core-models",
          mode: "folder",
          pattern: "packages/core-*/models",
          capture: ["feature"],
        },
        {
          type: "core-operations",
          mode: "folder",
          pattern: "packages/core-*/operations",
          capture: ["feature"],
        },
        {
          type: "core-intents",
          mode: "folder",
          pattern: "packages/core-*/intents",
          capture: ["feature"],
        },
        {
          type: "infrastructure",
          mode: "folder",
          pattern: "packages/infrastructure-*",
          capture: ["infrastructure"],
        },
        {
          type: "adapter",
          mode: "folder",
          pattern: "packages/adapter-*",
          capture: ["adapter"],
        },
        {
          type: "ui",
          mode: "folder",
          pattern: "packages/ui-*",
          capture: ["ui"],
        },
      ],
    },
    rules: {
      "boundaries/no-unknown": "warn",
      "boundaries/no-unknown-files": "warn",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "app-composition" },
              allow: {
                to: {
                  type: [
                    "app",
                    "app-composition",
                    "core-models",
                    "core-operations",
                    "core-intents",
                    "core-errors",
                    "infrastructure",
                    "adapter",
                    "ui",
                  ],
                },
              },
            },
            {
              from: { type: "app" },
              allow: {
                to: {
                  type: [
                    "app",
                    "app-composition",
                    "core-models",
                    "core-intents",
                    "core-errors",
                    "adapter",
                    "ui",
                  ],
                },
              },
            },
            {
              from: { type: "core-errors" },
              allow: {
                to: {
                  type: "core-errors",
                  captured: sameFeature,
                },
              },
            },
            {
              from: { type: "core-models" },
              allow: {
                to: {
                  type: ["core-models", "core-errors"],
                  captured: sameFeature,
                },
              },
            },
            {
              from: { type: "core-operations" },
              allow: {
                to: {
                  type: ["core-models", "core-operations", "core-errors"],
                  captured: sameFeature,
                },
              },
            },
            {
              from: { type: "core-intents" },
              allow: {
                to: {
                  type: [
                    "core-models",
                    "core-operations",
                    "core-intents",
                    "core-errors",
                  ],
                  captured: sameFeature,
                },
              },
            },
            {
              // Feature-agnostic: no @core/* (also enforced via no-restricted-imports).
              from: { type: "infrastructure" },
              allow: {
                to: {
                  type: "infrastructure",
                  captured: sameInfra,
                },
              },
            },
            {
              from: { type: "adapter" },
              allow: {
                to: {
                  type: ["core-models", "core-intents", "core-errors"],
                },
              },
            },
            {
              from: { type: "adapter" },
              allow: { to: { type: "infrastructure" } },
            },
            {
              from: { type: "adapter" },
              allow: {
                to: {
                  type: "adapter",
                  captured: sameAdapter,
                },
              },
            },
            {
              from: { type: "ui" },
              allow: { to: { type: "ui" } },
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            providersImportBan,
            deepCoreImportBan,
            deepInfraImportBan,
            deepAdapterImportBan,
          ],
        },
      ],
      "check-file/filename-blocklist": [
        "error",
        {
          "packages/core-*/models/!(*.shape(.test)?|*.test|*.primitive(.test)?|*.proof(.test)?|index).ts":
            "*.shape.ts, *.primitive.ts, *.proof.ts, colocated *.test.ts, or index.ts",
          "packages/{core,adapter,infrastructure}-*/errors/!(*.error|index).ts":
            "*.error.ts or index.ts",
          "packages/core-*/operations/!(*.capabilities(.test)?|*.service(.test)?|index).ts":
            "*.capabilities.ts, *.service.ts, colocated *.test.ts, or index.ts",
          "packages/core-*/intents/!(*.intent(.test)?|*.provider(.test)?|index.intents|index.providers).ts":
            "*.intent.ts, *.provider.ts, index.intents.ts, or index.providers.ts",
        },
      ],
    },
  },
  {
    // Composition may import /providers; keep deep-import bans.
    files: compositionFiles,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepCoreImportBan,
            deepInfraImportBan,
            deepAdapterImportBan,
          ],
        },
      ],
    },
  },
  {
    files: scaffoldPackageSources,
    plugins: {
      "clean-template": plugin,
    },
    rules: {
      "clean-template/no-todo-doc-marker": "warn",
    },
  },
  {
    files: scaffoldPackageMarkdown,
    plugins: {
      markdown,
      "clean-template": plugin,
    },
    language: "markdown/gfm",
    rules: {
      "clean-template/no-todo-doc-marker": "warn",
    },
  },
  {
    files: coreFiles,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["{next,react}{,/**}"],
              message:
                "Framework and SDK imports are forbidden in core packages. Depend on intents / domain kits instead.",
            },
            {
              group: ["@infrastructure/*", "@infrastructure/*/**"],
              message: "Core packages must not import infrastructure packages.",
            },
            {
              group: ["@adapter/*", "@adapter/*/**"],
              message: "Core packages must not import adapter packages.",
            },
            {
              group: ["@ui/*", "@ui/*/**"],
              message: "Core packages must not import UI packages.",
            },
            providersImportBan,
            deepCoreImportBan,
          ],
        },
      ],
    },
  },
  {
    files: infrastructureFiles,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@core/*", "@core/*/**"],
              message:
                "Infrastructure must not import @core/*. Join core via adapter packages.",
            },
            {
              group: ["@adapter/*", "@adapter/*/**"],
              message:
                "Infrastructure packages must not import adapter packages.",
            },
            {
              group: ["@ui/*", "@ui/*/**"],
              message: "Infrastructure packages must not import UI packages.",
            },
            providersImportBan,
            deepInfraImportBan,
          ],
        },
      ],
    },
  },
  {
    files: adapterFiles,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@ui/*", "@ui/*/**"],
              message: "Adapter packages must not import UI packages.",
            },
            providersImportBan,
            deepCoreImportBan,
            deepInfraImportBan,
            deepAdapterImportBan,
          ],
        },
      ],
    },
  },
);
