---
name: forma-monorepo
description: Routes ambiguous work in the Forma TypeScript monorepo to the right specialized skill. Use only when the user asks where to start, which package kind to use, or for a high-level architecture overview—not when the task is already specific (kits, intents, ESLint, composition).
---

# Forma monorepo (router)

## Full context

Canonical contract (package kinds, entrypoints, ESLint matrix, composition):

[architecture/forma-oriented-monorepo.md](../../architecture/forma-oriented-monorepo.md)

Do not duplicate that document in chat—summarize and link when needed.

## Which specialized skill to follow

| User intent / task                                                                         | Skill directory                    |
| ------------------------------------------------------------------------------------------ | ---------------------------------- |
| Spec map: split product into `specs/<feature>/` before god-specs                           | `forma-spec-map`                   |
| Multi-boundary feature (SPEC → kits → intents → adapter → composition)                     | `forma-feature-workflow`           |
| `specs/<feature>/SPEC.md` + `DESIGN.md` (Forma inventory)                                  | `forma-feature-workflow` (Phase 1) |
| New/split boundary package naming (core / infra / adapter / ui)                            | `forma-boundary-design`            |
| Boundary / forbidden-import violation; ban new framework/SDK in core                       | `forma-boundaries`                 |
| `*.shape.ts`, `*.primitive.ts`, `*.proof.ts`, capabilities, domain services, errors        | `forma-boundary-models`            |
| `*.intent.ts` / `*.provider.ts`, unrealized vs realized, barrels                           | `forma-intents`                    |
| Adapter stack naming, fetch-raw vs materialize, infra packaging                            | `forma-adapter-stacks`             |
| `apps/*/composition/`, `compose` / `bind` / surface / providers                            | `forma-composition`                |

**Read and apply** the matching `SKILL.md` under `.skills/<name>/` before implementing.

## Global invariants (always)

- **1 Forma boundary = 1 package** (core, infrastructure, adapter).
- Public entrypoints only: `models`, `intents`, `providers`, `errors`. Core `operations/` is internal; adapter/infra have no `operations/`.
- `/providers` importable **only** from `apps/*/composition/**`.
- Core MUST NOT import `@infrastructure/*`, `@adapter/*`, `@ui/*`, frameworks/SDKs, or `apps/*`.
- Infrastructure MUST NOT import `@core/*`.
- Adapter joins one core + its vendor stack; apps consume UI and composition roots.
- Scaffold via `@xndrjs/plop-os` (`pnpm plop` / `plop:run`); keep barrels with `pnpm plop:sync`.

## Workspace tooling (do not edit by default)

**Strongly discouraged** without explicit user approval:

- Root or package `tsconfig.json` / `tsconfig.*.json`
- `eslint.config.js`, Prettier config, Vitest config, `package.json` workspace scripts
- Path aliases or boundary rules changed to silence a single error

**If a change seems necessary:** stop implementation, explain **why** to the user, and wait for approval.

**Never** loosen tooling to ship faster. Fix the code or agree on an architecture change first.

Routine exception (skill `forma-boundaries`): add a new framework/SDK name to the core `no-restricted-imports` ban list when the workspace adopts that dependency.

## Human docs

- [README.md](../../README.md) — scripts and layout
- [AGENTS.md](../../AGENTS.md) — skill map + symlink edit path
