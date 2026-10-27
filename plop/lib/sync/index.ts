import type { PlopOs } from "@xndrjs/plop-os";

import type { FormaDiscoveryRules } from "../discovery";
import { registerErrorsBarrel } from "./errors-barrel";
import { registerIntentsBarrel } from "./intents-barrel";
import { registerModelsBarrel } from "./models-barrel";
import { registerOperationsBarrel } from "./operations-barrel";
import { registerProvidersBarrel } from "./providers-barrel";
import { registerRootTsconfigRefs } from "./root-tsconfig-refs";

export { ensureSyncMarkers, wrapSyncRegion } from "./helpers";

export function registerSync(
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  repoRoot: string,
): void {
  registerModelsBarrel(plopOs, rules);
  registerErrorsBarrel(plopOs, rules);
  registerOperationsBarrel(plopOs, rules);
  registerIntentsBarrel(plopOs, rules);
  registerProvidersBarrel(plopOs, rules);
  registerRootTsconfigRefs(plopOs, rules, repoRoot);
}
