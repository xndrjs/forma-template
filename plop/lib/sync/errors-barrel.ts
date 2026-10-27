import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { barrelFromRules } from "./helpers";

export function registerErrorsBarrel(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plopOs.syncGenerator("errors-barrel", (ctx) =>
    barrelFromRules(ctx, [rules.errorFiles.name]),
  );
}
