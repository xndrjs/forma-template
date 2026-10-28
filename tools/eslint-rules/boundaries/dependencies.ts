import type { DependenciesRule } from "eslint-plugin-boundaries";

import { sameAdapter, sameFeature, sameInfra } from "./captures";
import {
  adapter,
  core,
  infra,
  nonProviderAdapterLayers,
  nonProviderInfraLayers,
  publicAdapterLayers,
  publicCoreLayers,
} from "./layers";

/**
 * Forma `boundaries/dependencies` allow rules (`default: disallow`).
 *
 * - `*-providers`: importable only from `app-composition`
 * - `adapter-mappers`: same-adapter + `app-composition` (not non-composition apps)
 * - `infrastructure-schemas`: same-vendor infra + adapters + composition
 * - `core-operations`: only same-feature `core-intents` / `core-operations`
 */
export const formaDependencyRules = [
  {
    from: { type: "app-composition" },
    allow: {
      to: {
        type: [
          "app",
          "app-composition",
          ...core([...publicCoreLayers, "providers"]),
          ...infra(),
          ...adapter(),
          "ui",
        ],
      },
    },
  },
  {
    from: { type: "app" },
    allow: {
      to: {
        type: [
          "app",
          "app-composition",
          ...core(publicCoreLayers),
          ...adapter(publicAdapterLayers),
          "ui",
        ],
      },
    },
  },

  // Core internal layering (same feature) — intents/ops do not import providers
  {
    from: { type: "core-errors" },
    allow: {
      to: {
        type: "core-errors",
        captured: sameFeature,
      },
    },
  },
  {
    from: { type: "core-models" },
    allow: {
      to: {
        type: core(["models", "errors"]),
        captured: sameFeature,
      },
    },
  },
  {
    from: { type: "core-operations" },
    allow: {
      to: {
        type: core(["models", "operations", "errors"]),
        captured: sameFeature,
      },
    },
  },
  {
    from: { type: "core-intents" },
    allow: {
      to: {
        type: core(["models", "operations", "intents", "errors"]),
        captured: sameFeature,
      },
    },
  },
  {
    from: { type: "core-providers" },
    allow: {
      to: {
        type: core(),
        captured: sameFeature,
      },
    },
  },

  // Infrastructure internal layering (same vendor); no @core/*
  {
    from: { type: "infrastructure-errors" },
    allow: {
      to: {
        type: "infrastructure-errors",
        captured: sameInfra,
      },
    },
  },
  {
    from: { type: "infrastructure-schemas" },
    allow: {
      to: {
        type: infra(["schemas", "errors"]),
        captured: sameInfra,
      },
    },
  },
  {
    from: { type: "infrastructure-intents" },
    allow: {
      to: {
        type: infra(nonProviderInfraLayers),
        captured: sameInfra,
      },
    },
  },
  {
    from: { type: "infrastructure-providers" },
    allow: {
      to: {
        type: infra(),
        captured: sameInfra,
      },
    },
  },

  // Adapter: public core + non-provider infra + same-stack adapter layering
  {
    from: { type: adapter() },
    allow: {
      to: {
        type: core(publicCoreLayers),
      },
    },
  },
  {
    from: { type: adapter() },
    allow: {
      to: {
        type: infra(nonProviderInfraLayers),
      },
    },
  },
  {
    from: { type: "adapter-errors" },
    allow: {
      to: {
        type: "adapter-errors",
        captured: sameAdapter,
      },
    },
  },
  {
    from: { type: "adapter-mappers" },
    allow: {
      to: {
        type: adapter(["mappers", "errors"]),
        captured: sameAdapter,
      },
    },
  },
  {
    from: { type: "adapter-intents" },
    allow: {
      to: {
        type: adapter(nonProviderAdapterLayers),
        captured: sameAdapter,
      },
    },
  },
  {
    from: { type: "adapter-providers" },
    allow: {
      to: {
        type: adapter(),
        captured: sameAdapter,
      },
    },
  },

  {
    from: { type: "ui" },
    allow: { to: { type: "ui" } },
  },
] as const satisfies readonly DependenciesRule[];

export const formaDependenciesOptions = {
  default: "disallow" as const,
  rules: [...formaDependencyRules],
};
