import type { CapturedValuesSelector } from "eslint-plugin-boundaries";

/**
 * Same-package capture templates (boundaries Handlebars selectors).
 * v6 paths: `from` / `to` are the element descriptors (not `from.element`).
 */
export const sameFeature = {
  feature: "{{ from.captured.feature }}",
} as const satisfies CapturedValuesSelector;

export const sameInfra = {
  infrastructure: "{{ from.captured.infrastructure }}",
} as const satisfies CapturedValuesSelector;

export const sameAdapter = {
  adapter: "{{ from.captured.adapter }}",
} as const satisfies CapturedValuesSelector;
