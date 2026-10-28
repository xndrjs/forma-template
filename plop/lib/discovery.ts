import type { DiscoveryHit, PlopOs } from "@xndrjs/plop-os";

/** Register Forma Discovery rules on a plopOs instance. */
export function registerDiscovery(plopOs: PlopOs) {
  const dirOnly = <T extends Record<string, string>>(hit: DiscoveryHit<T>) =>
    hit.kind === "directory";
  const fileOnly = <T extends Record<string, string>>(hit: DiscoveryHit<T>) =>
    hit.kind === "file";

  const corePackages = plopOs.addDiscoveryRule({
    name: "core-packages",
    pattern: "packages/core-:feature",
    label: ({ data }) => data.feature,
    filter: dirOnly,
  });

  const infraPackages = plopOs.addDiscoveryRule({
    name: "infra-packages",
    pattern: "packages/infrastructure-:vendor",
    label: ({ data }) => data.vendor,
    filter: dirOnly,
  });

  const adapterPackages = plopOs.addDiscoveryRule({
    name: "adapter-packages",
    pattern: "packages/adapter-:stack",
    label: ({ data }) => data.stack,
    filter: dirOnly,
  });

  const uiPackages = plopOs.addDiscoveryRule({
    name: "ui-packages",
    pattern: "packages/ui-:name",
    label: ({ data }) => data.name,
    filter: dirOnly,
  });

  const apps = plopOs.addDiscoveryRule({
    name: "apps",
    pattern: "apps/:appName",
    label: ({ data }) => data.appName,
    filter: dirOnly,
  });

  const compositionRoots = plopOs.addDiscoveryRule({
    name: "composition-roots",
    pattern: "apps/:appName/composition",
    label: ({ data }) => data.appName,
    filter: dirOnly,
  });

  const coreModels = plopOs.addDiscoveryRule({
    name: "core-models",
    pattern: "packages/core-:feature/models",
    label: ({ data }) => data.feature,
    filter: dirOnly,
  });

  const adapterMappers = plopOs.addDiscoveryRule({
    name: "adapter-mappers",
    pattern: "packages/adapter-:stack/mappers",
    label: ({ data }) => data.stack,
    filter: dirOnly,
  });

  const infraSchemas = plopOs.addDiscoveryRule({
    name: "infra-schemas",
    pattern: "packages/infrastructure-:vendor/schemas",
    label: ({ data }) => data.vendor,
    filter: dirOnly,
  });

  const modelsDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "models-dirs",
    pattern: /^packages\/core-[^/]+\/models(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const schemasDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "schemas-dirs",
    pattern: /^packages\/infrastructure-[^/]+\/schemas(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const mappersDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "mappers-dirs",
    pattern: /^packages\/adapter-[^/]+\/mappers(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const errorsDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "errors-dirs",
    pattern:
      /^packages\/(?:core|adapter|infrastructure)-[^/]+\/errors(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const operationsDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "operations-dirs",
    pattern: /^packages\/core-[^/]+\/operations(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const intentsDirs = plopOs.addDiscoveryRule<{ dirPath: string }>({
    name: "intents-dirs",
    pattern:
      /^packages\/(?:core|adapter|infrastructure)-[^/]+\/intents(?:\/(?<dirPath>.+))?$/,
    label: ({ data }) => data.dirPath || ".",
    filter: dirOnly,
  });

  const shapeFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "shape-files",
    pattern: /^packages\/core-[^/]+\/models\/(?<rel>.+)\.shape\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const schemaFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "schema-files",
    pattern:
      /^packages\/infrastructure-[^/]+\/schemas\/(?<rel>.+)\.schema\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const mapperFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "mapper-files",
    pattern: /^packages\/adapter-[^/]+\/mappers\/(?<rel>.+)\.mapper\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const primitiveFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "primitive-files",
    pattern: /^packages\/core-[^/]+\/models\/(?<rel>.+)\.primitive\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const proofFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "proof-files",
    pattern: /^packages\/core-[^/]+\/models\/(?<rel>.+)\.proof\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const errorFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "error-files",
    pattern:
      /^packages\/(?:core|adapter|infrastructure)-[^/]+\/errors\/(?<rel>.+)\.error\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const capabilitiesFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "capabilities-files",
    pattern: /^packages\/core-[^/]+\/operations\/(?<rel>.+)\.capabilities\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const serviceFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "service-files",
    pattern: /^packages\/core-[^/]+\/operations\/(?<rel>.+)\.service\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const intentFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "intent-files",
    pattern:
      /^packages\/(?:core|adapter|infrastructure)-[^/]+\/intents\/(?<rel>.+)\.intent\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const providerFiles = plopOs.addDiscoveryRule<{ rel: string }>({
    name: "provider-files",
    pattern:
      /^packages\/(?:core|adapter|infrastructure)-[^/]+\/intents\/(?<rel>.+)\.provider\.ts$/,
    label: ({ data }) => data.rel,
    filter: fileOnly,
  });

  const tsconfigPackages = plopOs.addDiscoveryRule<{ id: string }>({
    name: "tsconfig-packages",
    pattern: /^(?:packages|apps)\/(?<id>[^/]+)\/tsconfig\.json$/,
    label: ({ data }) => data.id,
    filter: fileOnly,
  });

  const eslintRulesTsconfig = plopOs.addDiscoveryRule({
    name: "eslint-rules-tsconfig",
    pattern: /^eslint-rules\/tsconfig\.json$/,
    label: () => "eslint-rules",
    filter: fileOnly,
  });

  return {
    corePackages,
    infraPackages,
    adapterPackages,
    uiPackages,
    apps,
    compositionRoots,
    coreModels,
    adapterMappers,
    infraSchemas,
    modelsDirs,
    schemasDirs,
    mappersDirs,
    errorsDirs,
    operationsDirs,
    intentsDirs,
    shapeFiles,
    schemaFiles,
    mapperFiles,
    primitiveFiles,
    proofFiles,
    errorFiles,
    capabilitiesFiles,
    serviceFiles,
    intentFiles,
    providerFiles,
    tsconfigPackages,
    eslintRulesTsconfig,
  };
}

export type FormaDiscoveryRules = ReturnType<typeof registerDiscovery>;
