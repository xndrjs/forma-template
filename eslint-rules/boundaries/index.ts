import path from "node:path";
import type { Linter } from "eslint";
import boundaries from "eslint-plugin-boundaries";
import checkFile from "eslint-plugin-check-file";

import { formaDependenciesOptions } from "./dependencies";
import { formaElements } from "./elements";
import { formaFilenameBlocklist } from "./filename-blocklist";
import {
  coreRestrictedImportPatterns,
  sourceRestrictedImportPatterns,
} from "./restricted-imports";

export {
  adapter,
  core,
  infra,
  nonProviderAdapterLayers,
  nonProviderInfraLayers,
  publicAdapterLayers,
  publicCoreLayers,
  type AdapterElementType,
  type AdapterLayer,
  type CoreElementType,
  type CoreLayer,
  type InfraElementType,
  type InfraLayer,
} from "./layers";
export { sameAdapter, sameFeature, sameInfra } from "./captures";
export { formaElements } from "./elements";
export { formaDependenciesOptions, formaDependencyRules } from "./dependencies";
export { formaFilenameBlocklist } from "./filename-blocklist";
export {
  coreRestrictedImportPatterns,
  deepAdapterImportBan,
  deepCoreImportBan,
  deepInfraImportBan,
  sourceRestrictedImportPatterns,
} from "./restricted-imports";

export const sourceFiles = [
  "apps/**/*.{js,mjs,cjs,ts,tsx}",
  "packages/**/*.{js,mjs,cjs,ts,tsx}",
];

export const coreFiles = ["packages/core-*/**/*.{js,mjs,cjs,ts,tsx}"];

export type FormaBoundariesConfigOptions = {
  repoRoot: string;
};

/**
 * Flat-config blocks for the Forma import matrix (`boundaries` + specifier
 * NRI + `check-file`). Load from root `eslint.config.js` via jiti.
 */
export function createFormaBoundariesConfig({
  repoRoot,
}: FormaBoundariesConfigOptions): Linter.Config[] {
  return [
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
        "boundaries/elements": [...formaElements],
      },
      rules: {
        "boundaries/no-unknown": "warn",
        "boundaries/no-unknown-files": "warn",
        "boundaries/dependencies": ["error", formaDependenciesOptions],
        "no-restricted-imports": [
          "error",
          { patterns: sourceRestrictedImportPatterns },
        ],
        "check-file/filename-blocklist": ["error", formaFilenameBlocklist],
      },
    },
    {
      files: coreFiles,
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: coreRestrictedImportPatterns.concat(
              sourceRestrictedImportPatterns,
            ),
          },
        ],
      },
    },
  ];
}
