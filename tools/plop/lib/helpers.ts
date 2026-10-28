import { plopAddFlags } from "@xndrjs/plop-os";

export const defaultFlags = () => plopAddFlags("throw");

/** Paths relative to root `plopfile.mjs` (plop resolves templates from there). */
export const T = (name: string) => `tools/plop/templates/${name}`;
