import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { barrelFromRules } from "./helpers";

export function registerSchemasBarrel(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plopOs.syncGenerator("schemas-barrel", (ctx) =>
    barrelFromRules(ctx, [rules.schemaFiles.name]),
  );
}
