/** Entrypoint layers under `packages/core-*`. */
export type CoreLayer =
  | "models"
  | "operations"
  | "intents"
  | "errors"
  | "providers";

/** Entrypoint layers under `packages/infrastructure-*` (no `operations/`). */
export type InfraLayer = "schemas" | "intents" | "errors" | "providers";

/** Entrypoint layers under `packages/adapter-*` (no `operations/`). */
export type AdapterLayer = "mappers" | "intents" | "errors" | "providers";

export type CoreElementType = `core-${CoreLayer}`;
export type InfraElementType = `infrastructure-${InfraLayer}`;
export type AdapterElementType = `adapter-${AdapterLayer}`;

/** Layers importable from apps / adapters (not operations, not providers). */
export const publicCoreLayers = [
  "models",
  "intents",
  "errors",
] as const satisfies readonly CoreLayer[];

/**
 * Adapter layers importable from non-composition apps
 * (not mappers, not providers).
 */
export const publicAdapterLayers = [
  "intents",
  "errors",
] as const satisfies readonly AdapterLayer[];

/** Infra layers excluding providers (providers = composition-only). */
export const nonProviderInfraLayers = [
  "schemas",
  "intents",
  "errors",
] as const satisfies readonly InfraLayer[];

/** Adapter layers excluding providers (providers = composition-only). */
export const nonProviderAdapterLayers = [
  "mappers",
  "intents",
  "errors",
] as const satisfies readonly AdapterLayer[];

const ALL_CORE_LAYERS = [
  "models",
  "operations",
  "intents",
  "errors",
  "providers",
] as const satisfies readonly CoreLayer[];

const ALL_INFRA_LAYERS = [
  "schemas",
  "intents",
  "errors",
  "providers",
] as const satisfies readonly InfraLayer[];

const ALL_ADAPTER_LAYERS = [
  "mappers",
  "intents",
  "errors",
  "providers",
] as const satisfies readonly AdapterLayer[];

/** Boundary element types for core layers (default: all). */
export function core(layers?: readonly CoreLayer[]): CoreElementType[] {
  return [...(layers ?? ALL_CORE_LAYERS)].map(
    (layer) => `core-${layer}` as const,
  );
}

/** Boundary element types for infrastructure layers (default: all). */
export function infra(layers?: readonly InfraLayer[]): InfraElementType[] {
  return [...(layers ?? ALL_INFRA_LAYERS)].map(
    (layer) => `infrastructure-${layer}` as const,
  );
}

/** Boundary element types for adapter layers (default: all). */
export function adapter(
  layers?: readonly AdapterLayer[],
): AdapterElementType[] {
  return [...(layers ?? ALL_ADAPTER_LAYERS)].map(
    (layer) => `adapter-${layer}` as const,
  );
}
