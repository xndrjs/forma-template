---
name: forma-boundary-design
description: Guides naming and scope of Forma boundary packages—@core/*, @infrastructure/*, @adapter/*, @ui/*—and when to split an oversized package. Use when adding a new feature or vendor, choosing packages/* names, or deciding how many kits belong in one boundary—not when implementing kits, intents, or composition bodies.
---

# Boundary package design

## Package kinds

| Kind           | Folder                                   | npm name                        | Scope                                          |
| -------------- | ---------------------------------------- | ------------------------------- | ---------------------------------------------- |
| Core           | `packages/core-<feature>/`               | `@core/<feature>`               | Business capability; vendor-agnostic           |
| Infrastructure | `packages/infrastructure-<vendor>/`      | `@infrastructure/<vendor>`      | Vendor/tech building blocks; feature-agnostic  |
| Adapter        | `packages/adapter-<feature>-<vendors…>/` | `@adapter/<feature>-<vendors…>` | One core + explicit stack                      |
| UI             | `packages/ui-<name>/`                    | `@ui/<name>`                    | Shared UI; **not** a Forma boundary; apps only |
| App            | `apps/<app>/`                            | app package                     | Deployable; hosts composition                  |

**1 Forma boundary = 1 package** (core / infra / adapter).

Full rules: [forma-oriented-monorepo.md](../../standards/forma-oriented-monorepo.md).

## Core: new package vs extend

### Stay in the current `@core/<feature>`

- Concepts share vocabulary, invariants, and lifecycle.
- Capabilities/services compose on the same kits.
- One coherent story in DESIGN.md.

### Create a new `core-<feature>`

- Distinct ubiquitous language or release cadence.
- Independent subdomains (`billing` vs `catalog`).
- Models cluster into **unrelated** groups with few cross-references.

Avoid names like `common`, `shared`, `misc`, `helpers`, `utils`.

## Cross-core imports

Forbidden by default (ESLint). Prefer unrealized intents + adapter/composition for integration. Do not grow a passive “shared core.”

## Infrastructure

- Name after the **vendor or technology**, not a feature (`contentful`, not `pagebuilder-cms`).
- Keep feature mapping out—adapters own that.
- Split by stable sub-capability when the vendor package grows, not by domain workflow.

## Adapter

See skill `forma-adapter-stacks` for stack naming and mono- vs multi-vendor rules.

## UI

- `@ui/<name>` for shared presentational packages.
- Only `apps/*` may import `@ui/*`.

## Checklist before populating a new boundary

- [ ] `specs/<feature>/SPEC.md` + `DESIGN.md` agreed when this is a product slice (`forma-feature-workflow` Phase 1).
- [ ] Name reflects business (core) or vendor (infra) language—kebab-case.
- [ ] DESIGN lists candidate kits / intents / stack vendors.
- [ ] Not “half the application” in one core package.
- [ ] Scaffold via `pnpm plop` (`core-boundary` / `infrastructure-boundary` / `adapter-boundary` / `ui-package`); then `pnpm plop:sync`.

## When to split an existing package

- Unrelated intent groups (CMS vs payments) with no overlap.
- Models hard to navigate; kits share no composition.
- Constant barrel conflicts across contributors.
- Bounded-context docs need more than one paragraph of unrelated stories.

**Process:** name the new boundary → create package from conventions → move artifacts → update composition imports → `pnpm lint`.

## Related

- Adapter stacks: `forma-adapter-stacks`
- Router: `forma-monorepo`
