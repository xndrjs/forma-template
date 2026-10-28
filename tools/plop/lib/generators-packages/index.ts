import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { registerAdapterBoundary } from "./adapter-boundary";
import { registerApp } from "./app";
import { registerCompositionRoot } from "./composition-root";
import { registerCoreBoundary } from "./core-boundary";
import { registerFeatureSpec } from "./feature-spec";
import { registerInfrastructureBoundary } from "./infrastructure-boundary";
import { registerUiPackage } from "./ui-package";

export function registerPackageGenerators(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  registerCoreBoundary(plop);
  registerInfrastructureBoundary(plop);
  registerAdapterBoundary(plop, plopOs, rules);
  registerUiPackage(plop);
  registerApp(plop);
  registerCompositionRoot(plop, plopOs, rules, root);
  registerFeatureSpec(plop);
}
