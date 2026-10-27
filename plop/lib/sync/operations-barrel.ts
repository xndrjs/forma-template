import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { barrelFromRules } from "./helpers";

export function registerOperationsBarrel(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plopOs.syncGenerator("operations-barrel", (ctx) =>
    barrelFromRules(ctx, [
      rules.capabilitiesFiles.name,
      rules.serviceFiles.name,
    ]),
  );
}
