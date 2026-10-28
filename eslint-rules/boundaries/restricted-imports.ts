export const deepCoreImportBan = {
  group: ["@core/*/*/**"],
  message:
    "Import core packages through fixed entry points only: @core/<feature>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

export const deepInfraImportBan = {
  group: ["@infrastructure/*/*/**"],
  message:
    "Import infrastructure through fixed entry points only: @infrastructure/<vendor>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

export const deepAdapterImportBan = {
  group: ["@adapter/*/*/**"],
  message:
    "Import adapter packages through fixed entry points only: @adapter/<stack>/{models,intents,providers,errors}. Deep imports are forbidden.",
};

/**
 * Specifier-only rules — things `boundaries/dependencies` cannot express.
 * Package-kind matrix and `/providers` (via `*-providers` elements) live in
 * `dependencies.ts`.
 */
export const sourceRestrictedImportPatterns = [
  deepCoreImportBan,
  deepInfraImportBan,
  deepAdapterImportBan,
];

/**
 * Core-only: npm framework/SDK ban (not a Forma element).
 * Re-lists deep bans because this block replaces source NRI.
 */
export const coreRestrictedImportPatterns = [
  {
    group: ["{next,react}{,/**}"],
    message:
      "Framework and SDK imports are forbidden in core packages. Depend on intents / domain kits instead.",
  },
];
