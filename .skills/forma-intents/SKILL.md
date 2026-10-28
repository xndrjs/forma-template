---
name: forma-intents
description: Implements or reviews Forma *.intent.ts contracts and optional *.provider.ts realizations on core, infrastructure, or adapter boundaries—unrealized vs realized, using/bind, index.intents.ts and index.providers.ts barrels. Use when adding intents/providers, fixing vendor leakage into contracts, or wiring provide.using—not for composition compose roots (use forma-composition).
---

# Intents & providers

## What an intent is here

`intents/<kebab>.intent.ts` declares a **Forma intent** on the package’s shared boundary (`import { … } from "../boundary"` → `.intent("…").contract<In, Out, Err>()`).

| Kind           | Files                                   | Meaning                                                                 |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **Unrealized** | `*.intent.ts` only                      | Contract — typical cross-boundary need; composition `bind`s a satisfier |
| **Realized**   | `*.intent.ts` + sibling `*.provider.ts` | Contract + `Intent.provide…` in the owning boundary                     |

Role-oriented names (domain verbs), not vendor product names on **core** intents. Adapter intents may name the stack when they are the satisfier (`LoadPageFromContentful`).

Architecture: [forma-oriented-monorepo.md](../../standards/forma-oriented-monorepo.md) — _Intent files_, _Entrypoints_.

## Files & barrels

Each core / infra / adapter package has a root `boundary.ts` (scaffold via `*-boundary` generators) that exports the single Forma `boundary("…")` for that package. Intents import it — they do **not** redefine `boundary("…")`.

Add via `pnpm plop` generators `intent` / `provider`, or by hand under the owning boundary’s `intents/`:

- `*.intent.ts` — contract
- sibling `*.provider.ts` — optional realization

Then `pnpm plop:sync`:

- `intents/index.intents.ts` — **all** `*.intent.ts`
- `intents/index.providers.ts` — **only** `*.provider.ts`

## Contract rules

| Do                                                  | Do not                                                 |
| --------------------------------------------------- | ------------------------------------------------------ |
| Domain / boundary types in core contracts           | SDK DTOs, React types, vendor JSON on **core** intents |
| Keep contracts thin (load/save/notify-style)        | Stuff orchestration into the contract type alone       |
| Realize with `*.provider.ts` on the owning boundary | Implement core contracts inside infrastructure         |
| Import models/schemas/errors from the same boundary | Import `/providers` outside composition                |
| Import package-root `boundary.ts`                   | Call `boundary("…")` again in each intent file         |

## Examples (smoke)

Unrealized core contract:

```ts
import { Pagebuilder } from "../boundary";

export const LoadPage = Pagebuilder.intent("loadPage").contract<
  { readonly slug: string },
  { readonly slug: string; readonly title: string },
  { readonly kind: "not_found" }
>();
```

Realized core provider that `using`s an unrealized intent (composition rewrites via `bind`):

```ts
export const GetPageProvider = GetPage.provide.using({ load: LoadPage }).with(
  ({ deps: { load } }) =>
    function (input) {
      return load(input);
    },
);
```

Adapter satisfier (realized on the adapter boundary):

```ts
export const LoadPageFromContentfulProvider =
  LoadPageFromContentful.provide.with(
    (_ctx) =>
      function (input) {
        /* … */
      },
  );
```

## Fetch raw vs materialize

| Role                       | Typical home                       | Responsibility                                  |
| -------------------------- | ---------------------------------- | ----------------------------------------------- |
| Fetch raw                  | Infrastructure intents / providers | Vendor-native shapes; no `@core/*`              |
| Materialize / realize core | Adapter intents / providers        | Map raw → core; satisfy unrealized core intents |

## Wiring

1. Core declares unrealized intents for outward needs.
2. Adapter (or same-boundary provider) realizes / materializes.
3. Composition imports `/providers`, registers providers, `bind`s contracts, exposes `surface` — skill `forma-composition`.

## Anti-patterns

- Vendor names on **core** intent types (`ContentfulLoadPage`).
- Core contracts accepting CMS JSON / Prisma rows.
- One mega-intent for an entire feature when DESIGN splits roles.
- Redefining `boundary("…")` in each intent instead of importing package-root `boundary.ts`.
- Hand-rolling intent files without population (barrel drift).
- Importing `@*/providers` from apps outside `composition/`.
- Exporting `boundary.ts` as a public package entrypoint.

## Related

- Composition: `forma-composition`
- Adapter stacks: `forma-adapter-stacks`
- Models: `forma-boundary-models`
- Boundaries: `forma-boundaries`
