import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { barrelFromRules } from "./helpers";

export function registerModelsBarrel(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
): void {
  plopOs.syncGenerator("models-barrel", (ctx) =>
    barrelFromRules(ctx, [
      rules.shapeFiles.name,
      rules.primitiveFiles.name,
      rules.proofFiles.name,
    ]),
  );
}
