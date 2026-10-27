import { plopAddFlags } from "@xndrjs/plop-os";

export const defaultFlags = () => plopAddFlags("throw");

export const T = (name: string) => `plop/templates/${name}`;
