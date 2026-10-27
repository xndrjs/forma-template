import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { barrelFromRules } from "./helpers";

export function registerIntentsBarrel(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plopOs.syncGenerator("intents-barrel", (ctx) =>
    barrelFromRules(ctx, [rules.intentFiles.name]),
  );
}
