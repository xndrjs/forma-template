import type { ElementDescriptor } from "eslint-plugin-boundaries";

/**
 * Provider files live under `intents/` (export map `/providers`).
 * Full-path descriptors must appear before the `*-intents` folder elements.
 */
const providerElements = [
  {
    type: "core-providers",
    mode: "full",
    pattern: "packages/core-*/intents/index.providers.ts",
    capture: ["feature"],
  },
  {
    type: "core-providers",
    mode: "full",
    pattern: "packages/core-*/intents/*.provider.ts",
    capture: ["feature", "name"],
  },
  {
    type: "core-providers",
    mode: "full",
    pattern: "packages/core-*/intents/*.provider.test.ts",
    capture: ["feature", "name"],
  },
  {
    type: "infrastructure-providers",
    mode: "full",
    pattern: "packages/infrastructure-*/intents/index.providers.ts",
    capture: ["infrastructure"],
  },
  {
    type: "infrastructure-providers",
    mode: "full",
    pattern: "packages/infrastructure-*/intents/*.provider.ts",
    capture: ["infrastructure", "name"],
  },
  {
    type: "infrastructure-providers",
    mode: "full",
    pattern: "packages/infrastructure-*/intents/*.provider.test.ts",
    capture: ["infrastructure", "name"],
  },
  {
    type: "adapter-providers",
    mode: "full",
    pattern: "packages/adapter-*/intents/index.providers.ts",
    capture: ["adapter"],
  },
  {
    type: "adapter-providers",
    mode: "full",
    pattern: "packages/adapter-*/intents/*.provider.ts",
    capture: ["adapter", "name"],
  },
  {
    type: "adapter-providers",
    mode: "full",
    pattern: "packages/adapter-*/intents/*.provider.test.ts",
    capture: ["adapter", "name"],
  },
] as const satisfies readonly ElementDescriptor[];

/**
 * Package-root Forma handle (`boundary.ts`) — same-package import only,
 * not a public entrypoint. Full-path descriptors before folder elements.
 */
const boundaryElements = [
  {
    type: "core-boundary",
    mode: "full",
    pattern: "packages/core-*/boundary.ts",
    capture: ["feature"],
  },
  {
    type: "infrastructure-boundary",
    mode: "full",
    pattern: "packages/infrastructure-*/boundary.ts",
    capture: ["infrastructure"],
  },
  {
    type: "adapter-boundary",
    mode: "full",
    pattern: "packages/adapter-*/boundary.ts",
    capture: ["adapter"],
  },
] as const satisfies readonly ElementDescriptor[];

/** Forma `boundaries/elements` — more specific types before broader folders. */
export const formaElements = [
  {
    type: "app-composition",
    mode: "folder",
    pattern: "apps/*/composition",
    capture: ["app"],
  },
  {
    type: "app",
    mode: "folder",
    pattern: "apps/*",
    capture: ["app"],
  },
  ...boundaryElements,
  ...providerElements,
  {
    type: "core-errors",
    mode: "folder",
    pattern: "packages/core-*/errors",
    capture: ["feature"],
  },
  {
    type: "core-models",
    mode: "folder",
    pattern: "packages/core-*/models",
    capture: ["feature"],
  },
  {
    type: "core-operations",
    mode: "folder",
    pattern: "packages/core-*/operations",
    capture: ["feature"],
  },
  {
    type: "core-intents",
    mode: "folder",
    pattern: "packages/core-*/intents",
    capture: ["feature"],
  },
  {
    type: "infrastructure-errors",
    mode: "folder",
    pattern: "packages/infrastructure-*/errors",
    capture: ["infrastructure"],
  },
  {
    type: "infrastructure-schemas",
    mode: "folder",
    pattern: "packages/infrastructure-*/schemas",
    capture: ["infrastructure"],
  },
  {
    type: "infrastructure-intents",
    mode: "folder",
    pattern: "packages/infrastructure-*/intents",
    capture: ["infrastructure"],
  },
  {
    type: "adapter-errors",
    mode: "folder",
    pattern: "packages/adapter-*/errors",
    capture: ["adapter"],
  },
  {
    type: "adapter-mappers",
    mode: "folder",
    pattern: "packages/adapter-*/mappers",
    capture: ["adapter"],
  },
  {
    type: "adapter-intents",
    mode: "folder",
    pattern: "packages/adapter-*/intents",
    capture: ["adapter"],
  },
  {
    type: "ui",
    mode: "folder",
    pattern: "packages/ui-*",
    capture: ["ui"],
  },
] as const satisfies readonly ElementDescriptor[];
