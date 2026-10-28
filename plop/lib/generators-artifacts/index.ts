import type { PlopOs } from "@xndrjs/plop-os";
import type { NodePlopAPI } from "plop";

import type { FormaDiscoveryRules } from "../discovery";
import { registerCapabilities } from "./capabilities";
import { registerDomainService } from "./domain-service";
import { registerErrors } from "./errors";
import { registerIntent } from "./intent";
import { registerMapper } from "./mapper";
import { registerPrimitive } from "./primitive";
import { registerProof } from "./proof";
import { registerProvider } from "./provider";
import { registerShape } from "./shape";

export function registerArtifactGenerators(
  plop: NodePlopAPI,
  plopOs: PlopOs,
  rules: FormaDiscoveryRules,
  root: string,
): void {
  registerShape(plop, plopOs, rules, root);
  registerPrimitive(plop, plopOs, rules, root);
  registerProof(plop, plopOs, rules, root);
  registerErrors(plop, plopOs, rules, root);
  registerCapabilities(plop, plopOs, rules, root);
  registerDomainService(plop, plopOs, rules, root);
  registerIntent(plop, plopOs, rules, root);
  registerProvider(plop, plopOs, rules, root);
  registerMapper(plop, plopOs, rules, root);
}
