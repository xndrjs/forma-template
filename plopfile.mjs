/**
 * Thin loader: plop-os / plop only discover plopfile.{js,mjs,cjs}.
 * Real config lives in TypeScript under tools/plop/plopfile.ts.
 */
import { tsImport } from "tsx/esm/api";

const mod = await tsImport("./tools/plop/plopfile.ts", import.meta.url);

export const plopOs = mod.plopOs;
export const rules = mod.rules;
export default mod.default;
