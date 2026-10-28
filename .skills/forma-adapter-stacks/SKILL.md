---
name: forma-adapter-stacks
description: Designs or reviews adapter packages that join one @core feature to an explicit vendor stack—naming adapter-<feature>-<vendors…>, fetch-raw vs materialize, infrastructure packaging. Use when adding AdapterBoundary, choosing mono- vs multi-vendor stacks, or placing raw fetch vs materialization—not for core kits alone or composition wiring.
---

# Adapter stacks

## Role

An **adapter** is the only package kind that joins a feature (`@core/<feature>`) to a vendor stack (`@infrastructure/<vendor>`…).

| Kind           | Specificity                       |
| -------------- | --------------------------------- |
| Core           | Feature-specific, vendor-agnostic |
| Infrastructure | Feature-agnostic, vendor-specific |
| Adapter        | Feature + explicit vendor stack   |

Architecture: [forma-oriented-monorepo.md](../../standards/forma-oriented-monorepo.md) — _Adapter naming_, _Infrastructure packaging_, _Fetch raw vs materialize_.

## Naming

- Name = **feature + vendor stack** (concatenated).
- Mono-vendor: `adapter-pagebuilder-contentful` → `@adapter/pagebuilder-contentful`.
- Multi-vendor materializer (no IR): `adapter-pagebuilder-contentful-mulesoft`.
- Parallel stacks = separate packages (e.g. `…-datocms-workato`), never one god-package importing all vendors.
- No intermediate representation layer: the adapter may know vendor raw shapes; the unit of substitution is the whole adapter stack package.

Scaffold with `pnpm plop` → `adapter-boundary` (pick core + infra Candidates). `package.json` must list workspace deps on that core and those infrastructure packages. Public entrypoints: `mappers`, `intents`, `providers`, `errors` (no `models/`).

## Fetch raw vs materialize

| Role            | Typical home                                        | Responsibility                                             |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| **Fetch raw**   | `@infrastructure/<vendor>` intents / providers      | Vendor-native shapes (`/schemas`); batching/caching; **no** `@core/*` |
| **Materialize** | `@adapter/<feature>-<vendors…>` intents / providers | Map raw → core models via `/mappers`; realize unrealized **core** intents |

The same raw fetch can feed multiple adapters projecting into different `@core/*` read models.

```txt
infra /schemas  →  adapter /mappers  →  adapter providers  →  app-composition
core /models    ↗
```

## Infrastructure packaging

- Keep clients, SDK bootstrap, raw helpers, caching in `@infrastructure/<vendor>`.
- Vendor/raw Zod lives under `schemas/` (`*.schema.ts`), exported as `./schemas`.
- Shared vendor packages hold **reusable low-level building blocks only**—not feature orchestration.
- Feature-specific mapping and core-intent realization live in the adapter (`mappers/` + intents/providers).
- Extract shared primitives only when reuse appears across **at least two** adapter stacks; split large vendor packages by stable sub-capabilities, not domain workflows.

## Adapter may

- Import `@core/<feature>/{models,intents,errors}` for its feature.
- Import `@infrastructure/*/{schemas,intents,errors}` packages of its declared stack.
- Hold `mappers/*.mapper.ts` that project into **core** domain kits (no `@xndrjs/domain` / `domain-zod` in adapter).
- Scaffold mappers with `pnpm plop` → `mapper`.

## Adapter must not

- Own a `models/` folder or plain Zod DTO entrypoint (mapping lives in `mappers/`; raw Zod in infra `schemas/`).
- Import `/providers` except via app composition.
- Import unrelated vendor packages “just in case.”
- Own app composition or domain rules that belong in core `operations/`.
- Be imported from infrastructure or core.
- Expose `/mappers` to non-composition app code (same-adapter + composition only).

## Checklist before scaffolding

- [ ] Core boundary exists (or is populated in the same change).
- [ ] Each vendor infrastructure boundary exists / is populated.
- [ ] Stack name lists **every** vendor the adapter will import.
- [ ] DESIGN.md names unrealized core intents this stack will satisfy.
- [ ] No second parallel stack stuffed into the same package.

## Related

- Intents: `forma-intents`
- Kits / schemas / mappers: `forma-boundary-models`
- Composition bind: `forma-composition`
- Package naming: `forma-boundary-design`
- Boundaries: `forma-boundaries`
