# Specification-driven feature workflow

Lightweight specification workflow for multi-boundary features.

**Agents:** follow skill `forma-feature-workflow` under [`.skills/`](../.skills/) (phases, gates, hard stops). Multi-capability decomposition: `forma-spec-map`. Canonical architecture: [forma-oriented-monorepo.md](./forma-oriented-monorepo.md).

## Why lean specs

Features span boundary models, intents/providers, adapters, and app composition. Without a shared target, agents and developers diverge or leak across package kinds. Heavy Spec-Driven task lists inflate context; package layout + ESLint already enforce Forma package-kind rules, so this repo keeps specs small: conceptual alignment without execution prose in the docs.

## Spec location

| Path                        | Role                                                  |
| --------------------------- | ----------------------------------------------------- |
| `specs/SPEC-MAP.md`         | Optional product ToC of capabilities (spec-map)       |
| `specs/<feature>/SPEC.md`   | What/why — domain language only                       |
| `specs/<feature>/DESIGN.md` | How — to-be inventory of Forma architecture artifacts |

No production code during specification. Slice folders use kebab-case business names.

### `SPEC.md`

Intent, actors, stories, acceptance criteria—technology- and vendor-agnostic. No intents, adapters, paths, frameworks, or SDKs.

### `DESIGN.md`

**To-be catalog** (not a delta), in Forma vocabulary:

- `@core/<feature>` boundaries and kits (models / errors / core-only operations)
- Intents (unrealized vs realized) and which boundary owns provide
- `@infrastructure/<vendor>` packages needed for the stack
- `@adapter/<feature>-<vendor>[…]` stacks and materialization responsibilities
- App composition roots (server / client) and surface aliases
- Sequence diagrams when useful (`bind` / provide call paths)

Inventory only Forma artifacts (boundaries, kits, intents, adapters, composition)—not ports, use cases, loaders, or repositories.

## Incremental implementation

After approval of `SPEC.md` + `DESIGN.md` (or delivery mode—see feature-workflow skill):

```text
Boundary kits (primitive → shape → proof) on core
  → Capabilities / domain services (core operations/ only)
  → Errors (any boundary errors/)
  → Intents (± provide)
  → Infrastructure (raw) + Adapter (materialize / realize core intents)
  → Composition (providers, bind, surface)
```

Halt for approval between phases by default. Large/critical work may ship a PR with **only** `specs/<feature>/*` before code. Match existing package conventions when implementing.

## Trade-offs

**Gains:** less doc bloat; architecture + lint as guardrails; clear SPEC vs DESIGN split; DESIGN speaks Forma (boundaries, intents, adapters).  
**Risks:** still needs human review that SPEC stays domain-only and DESIGN stays to-be.
