---
name: forma-boundary-models
description: Implements or reviews boundary kits and internal operations—*.shape.ts, *.primitive.ts, *.proof.ts, *.capabilities.ts, *.service.ts in @core (domain-zod); infra *.schema.ts under schemas/; adapter *.mapper.ts under mappers/; errors/*.error.ts on any boundary. Use when adding kits, schemas, mappers, capabilities, domain services, or errors.
---

# Boundary models & operations

## Architecture context

Entrypoints, kit rules by package kind, core-only `operations/`:

[architecture/forma-oriented-monorepo.md](../../architecture/forma-oriented-monorepo.md) — _Models / schemas / mappers by package kind_, _Capabilities / services_.

Author **core** kits in order **primitive → shape → proof**, then operations / errors. Prefer `pnpm plop` (`shape`, `primitive`, `proof`, `errors`, `mapper`, …) then `pnpm plop:sync`.

## What lives where

| Artifact                  | Path                                | Responsibility                                                                        |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Primitive / Shape / Proof | core `models/`                      | domain-zod kits; proofs = extra guarantees on already-valid data                      |
| Capabilities              | core `operations/*.capabilities.ts` | Custom methods on **one** kit beyond create/validation                                |
| Domain service            | core `operations/*.service.ts`      | Pure cross-model domain logic (same feature)                                          |
| Error                     | `errors/*.error.ts`                 | Typed errors on any boundary (core / adapter / infra); not under `models/`            |
| Infra schema              | infra `schemas/*.schema.ts`         | **Plain Zod** vendor/raw structural validation — no `@xndrjs/domain` / `domain-zod`   |
| Adapter mapper            | adapter `mappers/*.mapper.ts`       | Project infra raw → **core** kits; **no** adapter `models/`; no domain-zod            |

Core `operations/` has **no** public export. Callers are **same-package only**: same-feature `intents/` / `operations/` (and their providers). **Never** import `operations/` from apps, composition, adapter, or infra — cross-boundary behavior → wrap in an intent (+ provider).

## Order

**primitive → shape → proof**, then capabilities / services, then intents (± provide).

## Shape / Primitive / Proof (core)

```ts
import { domain } from "@xndrjs/domain-zod";
import { z } from "zod";

export const PageShape = domain.shape(
  "Page",
  z.object({
    /* fields; nest kits via zodFromKit when needed */
  }),
);

export type Page = ReturnType<(typeof PageShape)["create"]>;
```

Primitives use `domain.primitive`; proofs use `domain.proof(…).refineType(…)`.

Shape generator choices: **core** (domain-zod `*.shape.ts` under `models/`) or **infra** (plain Zod `*.schema.ts` under `schemas/`). Adapters are **not** on the shape generator — use the **mapper** artifact instead.

### When to use a proof

Additional domain guarantee on data that is **already** structurally valid (session state, authorization, semantic invariant). Not a substitute for input construction on shapes/primitives.

### Proofs in `DESIGN.md`

When a proof gates a flow: `Note over core: XxxProof.test(…)` then short `alt` / `else` labels (Mermaid wraps long `alt` text poorly).

## Capabilities

Preferred custom behavior on one kit. Prefer `forShapeKit` / `forPrimitiveKit`.

```ts
import { domain } from "@xndrjs/domain-zod";
import { PageShape } from "../models/page.shape.js";

export const PageCapabilities = domain.capabilities
  .forShapeKit(PageShape)
  .methods(({ patch }) => ({
    rename: (page, title: string) => patch(page, { title }),
  }));
```

**Forbidden method names:** `validate`, `create`, or other kit-lifecycle aliases — use `XxxShape.create` / `XxxPrimitive.create`.

Do **not** wire capability attach in composition or apps. Callers import from the same package’s `operations/` (intents/providers), or call operations only from an intent provide in that package.

## Domain services

Cross-model pure functions in `*.service.ts`—no I/O, no DI by default.

| Use                               | File                                       |
| --------------------------------- | ------------------------------------------ |
| Behavior on **one** kit           | `*.capabilities.ts`                        |
| Logic across **two or more** kits | `*.service.ts`                             |
| External / cross-boundary I/O     | intent (± provide) + adapter / composition |

## Errors

`errors/<kebab>.error.ts` on **any** boundary package (core / adapter / infra) — e.g. `errorCode` SCREAMING_SNAKE, message sentence case. Re-export via `errors/index.ts`. Scaffold with `pnpm plop` → `errors`.

## Infrastructure schemas

Plain Zod `*.schema.ts` under `schemas/` (vendor/raw structural validation). Scaffold via `pnpm plop` → `shape` and choose **infra**. No domain kits, invariants, or `@xndrjs/domain` / `domain-zod` in `@infrastructure/*`.

## Adapter mappers

`mappers/*.mapper.ts` project infra raw into **core** kits. Scaffold with `pnpm plop` → `mapper` (picks adapter + core shape). Stub imports `import type { Xxx } from "@core/<feature>/models"` and exports `mapRawToXxx()`. **No** adapter `models/` folder; no domain-zod in adapters.

## Rules

- Export kits as `XxxShape` / `XxxPrimitive` / `XxxProof`; capabilities as `XxxCapabilities`.
- Same-feature composition via `models/` barrel or relative imports—no deep imports from outside the package.
- No framework, SDK, or `@infrastructure/*` in core models/operations.
- Colocate `*.test.ts` when validation, `refineType`, or rules are non-trivial (`pnpm test:node`).

## Anti-patterns

- Using `*.model.ts` / ports / use-cases as kit homes.
- Putting DTOs under adapter `models/` (use `mappers/` + infra `schemas/`).
- Business rules only in adapters or React.
- Capabilities that orchestrate I/O (belongs in intent provide / adapter).
- Exporting `operations/` as a package entrypoint, importing it from apps/composition, or adding `operations/` on adapter/infra.

## Related

- Intents: `forma-intents`
- Adapter stacks: `forma-adapter-stacks`
- Multi-boundary order: `forma-feature-workflow`
