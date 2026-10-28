import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";
import { createJiti } from "jiti";
import tseslint from "typescript-eslint";
import plugin from "./eslint-rules/index.mjs";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(import.meta.url);
const { createFormaBoundariesConfig } = jiti(
  "./eslint-rules/boundaries/index.ts",
);

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
  ...createFormaBoundariesConfig({ repoRoot }),
  {
    files: scaffoldPackageSources,
    plugins: {
      "forma-template": plugin,
    },
    rules: {
      "forma-template/no-todo-doc-marker": "warn",
    },
  },
  {
    files: scaffoldPackageMarkdown,
    plugins: {
      markdown,
      "forma-template": plugin,
    },
    language: "markdown/gfm",
    rules: {
      "forma-template/no-todo-doc-marker": "warn",
    },
  },
);
