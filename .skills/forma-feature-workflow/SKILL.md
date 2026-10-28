---
name: forma-feature-workflow
description: Step-by-step workflow for implementing a multi-boundary Forma feature—one phase per agent run with mandatory user checkpoint between phases; Phase 1 delivers specs/[feature]/SPEC.md (domain language) and DESIGN.md (Forma inventory) before any implementation. Use when a task spans @core, @infrastructure, @adapter, and apps; enforces inside-out order, test gates, and hard stops on architecture violations.
---

# Feature workflow (multi-boundary)

## When to use

A user story touches **models**, **operations**, **intents/providers**, **infrastructure/adapter**, and/or **composition**.

For a single artifact (only a shape, only ESLint), use the specialized skill instead—router `forma-monorepo`.

Canonical architecture: [forma-oriented-monorepo.md](../../standards/forma-oriented-monorepo.md)  
Lean docs: [specification-driven-feature-workflow.md](../../standards/specification-driven-feature-workflow.md)

---

## One phase per run (hard gate)

**Non-negotiable:** Phases 1–8 are **never** completed in a single agent run or a single user prompt.

| Rule                  | Meaning                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| **One active phase**  | Work only the **current** phase. Do not start the next in the same run.          |
| **Stop at phase end** | When the phase deliverable and **Gate** are met, **stop**. Summarize next phase. |
| **Wait for the user** | Do not proceed until the user **confirms** or asks for corrections (same phase). |
| **Serial order**      | Phases **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**. No skipping.                           |

**Prohibited:** implementing kits, intents, infrastructure, adapters, composition, and UI/apps in one run because “the spec is clear.”

**Allowed in one run:** work **within** the current phase only.

**How to advance:** User confirms (e.g. “ok Phase 1”, “proceed to Phase 2”).

---

## Phase 1 — Specs

**Before any kits, intents, or infrastructure code**, capture the feature under:

```txt
specs/<feature>/
  SPEC.md
  DESIGN.md
```

If the product spans **multiple capabilities** and no agreed decomposition exists, run skill **`forma-spec-map`** first (`specs/SPEC-MAP.md`), then return here **per** `specs/<feature>/`.

Create `specs/<feature>/` by matching existing spec folders.

### Hard rule

**Do not write implementation code** until **`SPEC.md`** and **`DESIGN.md`** are agreed and saved. If either is ambiguous or vendor-tainted, refine and ask—do not scaffold “to explore.”

### `SPEC.md` — domain language only

**Must include:** purpose, flows/acceptance criteria, business invariants.

**Must NOT include:** vendor names, SDK/API/DB terms, package paths, intents, adapters.

| User input (wrong)                                | Domain rewrite (right)                                      |
| ------------------------------------------------- | ----------------------------------------------------------- |
| “Fetch from Contentful `treeContent` by `sys.id`” | “Resolve page paths from CMS content over page identifiers” |

Until `SPEC.md` is technology-agnostic, Phase 1 is incomplete. Write **to-be**, not delta.

### `DESIGN.md` — Forma to-be inventory

| Section              | Content                                                              |
| -------------------- | -------------------------------------------------------------------- |
| **Core boundary**    | `@core/<feature>` ownership                                          |
| **Kits**             | primitives / shapes / proofs; capabilities / services; errors        |
| **Intents**          | unrealized vs realized; which boundary owns provide                  |
| **Infrastructure**   | `@infrastructure/<vendor>` for the stack (fetch raw)                 |
| **Adapter stack(s)** | `@adapter/<feature>-<vendors…>`; materialize / realize core intents  |
| **Composition**      | app roots (server / client); surface aliases; binds                  |
| **Apps / UI**        | routes/screens; `@ui/*` shared presentational pieces (presentation last) |

Optional Mermaid `sequenceDiagram` when bind/provide paths are non-obvious.

**Participants (left → right):** `app` → `@core/<feature>` → `@adapter/…` and/or `@infrastructure/…` → optional external service.

**Proof gates:** `Note over core: XxxProof.test(…)` then short `alt` / `else` labels.

**Artifact decision table:**

| Business rule                        | Artifact                         |
| ------------------------------------ | -------------------------------- |
| Structure at input                   | `XxxShape` / `XxxPrimitive`      |
| Extra guarantee on valid data        | `*.proof.ts`                     |
| Custom behavior on one kit           | `*.capabilities.ts`              |
| Cross-kit pure rules                 | `*.service.ts`                   |
| Cross-boundary / app-facing behavior | intent (± provide)               |
| Vendor raw access                    | infra `schemas/` + intent / provider |
| Map raw → core / satisfy unrealized  | adapter `mappers/` + intent / provider |
| Wire surface                         | composition `compose` / `bind`   |

Inventory only Forma artifacts (boundaries, kits, intents, adapters, composition)—not ports, use cases, loaders, or repositories.

**Gate:** user agreement · both files saved · no implementation · **stop**

---

## Phase 2 — Boundary kits (core `models/` + errors)

Implement DESIGN **core** kits in order: **primitive → shape → proof**; add errors under `errors/` (any boundary). Capabilities/services only in core `operations/`.

1. Add kits via `pnpm plop` (`shape` / `primitive` / `proof`) or by hand; fill Zod / `refineType`; `pnpm plop:sync`.
2. Colocate tests when non-trivial.

**Gate:** model tests · `pnpm lint` · **stop**

---

## Phase 3 — Operations (capabilities + services)

Implement DESIGN capabilities and services **before** intents that call them.

- Single-kit → `*.capabilities.ts` (`forShapeKit` / `forPrimitiveKit`) — skill `forma-boundary-models`
- Cross-model → `*.service.ts` pure functions

**Gate:** domain tests green · no infra imports in `models/` or `operations/` · **stop**

---

## Phase 4 — Core intents (± provide)

Implement DESIGN intents on **`@core/<feature>`** only. Infrastructure and adapter intents wait for Phases 5–6.

1. Unrealized contracts where composition will `bind`.
2. Realized providers (`*.provider.ts`) where core owns the behavior (`using` as needed).
3. Keep `index.intents.ts` / `index.providers.ts` barrels in sync — skill `forma-intents`.

**Gate:** contracts free of vendor types on core · lint · **stop**

---

## Phase 5 — Infrastructure

Implement DESIGN `@infrastructure/<vendor>` **before** any adapter work. Core (Phases 2–4) and infrastructure must both be in place before Phase 6.

1. Plain Zod under `schemas/` (`*.schema.ts`) — vendor/raw structural validation only.
2. Fetch-raw intents (± provide); batching/caching as needed.
3. **No** `@core/*` imports; no feature mapping or domain rules here — skill `forma-boundary-models` / `forma-intents`.

**Gate:** infra schemas/intents green · no `@core/*` in infrastructure · **stop**

---

## Phase 6 — Adapter

Only after **Core (2–4) and Infrastructure (5)** are done.

1. Adapter stack package(s): `mappers/*.mapper.ts` (map raw → core).
2. Realize unrealized core intents (materialize) — skill `forma-adapter-stacks` / `forma-boundary-models`.

**Gate:** mapper/provider tests as needed · no SDK types leaking into `@core/*` · **stop**

---

## Phase 7 — Composition

Wire via skill **`forma-composition`**.

1. One composition file per runtime; extend existing or add a new runtime root when needed.
2. Register providers, `bind` unrealized → satisfier, expose `surface`.
3. No new business rules in composition.

**Gate:** `pnpm lint` · relevant tests · **stop**

---

## Phase 8 — Apps + UI

Only after **Core, Infrastructure, Adapter, and Composition (2–7)** are done and tested. Presentation last — do not invent screens to “explore” unfinished domain or vendor wiring.

1. App routes / screens / handlers that consume composition roots (not providers or infra factories).
2. Reusable presentational pieces in `@ui/<name>` when shared across apps or routes — apps only may import `@ui/*`.
3. No new domain rules, proofs, or vendor mapping in React/UI.

**Gate:** `pnpm lint` · relevant app/UI tests · **stop — wait for sign-off**

---

## Hard stops

**Stop and ask / split** if:

- Multiple phases in one agent run
- Specs only in chat—not under `specs/<feature>/`
- `SPEC.md` still vendor-tainted
- Implementation before agreed SPEC + DESIGN
- `@core/*` importing infra / adapter / ui / SDKs
- Core intents exposing vendor types
- Domain invariants only in adapters or React
- Cross-core imports without explicit design
- Mixing server/client composition without runtime markers
- Starting adapters (Phase 6) before infrastructure (Phase 5) is complete
- Mapping or realizing core intents inside `@infrastructure/*`
- Building apps/UI (Phase 8) before composition and underlying boundaries are tested

**Never** relax workspace tooling to bypass a violation. Exception: new framework name on the core ban list—`forma-boundaries`—with user awareness.

---

## Skill map (by phase)

| Phase | Skills                                                   |
| ----- | -------------------------------------------------------- |
| 0     | `forma-spec-map`                                         |
| 1     | `forma-boundary-design`, _(this skill)_                  |
| 2–3   | `forma-boundary-models`                                  |
| 4     | `forma-intents`                                          |
| 5     | `forma-boundary-models`, `forma-intents` (infra only)    |
| 6     | `forma-adapter-stacks`, `forma-boundary-models`          |
| 7     | `forma-composition`, `forma-boundaries`                  |
| 8     | _(this skill)_ — apps consume composition; `@ui/*` only from apps |

Router: `forma-monorepo`.
