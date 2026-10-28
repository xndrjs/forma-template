---
name: forma-boundaries
description: Troubleshoots eslint-plugin-boundaries and no-restricted-imports violations in the Forma monorepo, or adds a newly installed framework/SDK package name to the core import-ban list in eslint-rules/boundaries. Use when fixing boundary or forbidden-import errors in packages/ or apps/—not for general eslint.config.js refactors.
---

# Forma boundaries (ESLint)

## Workspace tooling policy

Editing global or package tooling to bypass errors is **forbidden** unless the user explicitly approves after you explain why.

**Do not change** (examples): `eslint.config.js` (beyond the narrow exception below), `tsconfig*.json`, Prettier/Vitest config, path aliases, `boundaries/*` element types.

**When stuck:** stop, describe the underlying conflict, propose a code or architecture fix, and ask the user.

See also router skill `forma-monorepo` — _Workspace tooling_.

## Canonical rules

Full package-kind matrix and hard bans:

[architecture/forma-oriented-monorepo.md](../../architecture/forma-oriented-monorepo.md) — _ESLint import matrix_, _Hard bans_, _Entrypoints_.

**Matrix implementation:** [`eslint-rules/boundaries/`](../../eslint-rules/boundaries/) (`layers.ts`, `elements.ts`, `dependencies.ts`, `restricted-imports.ts`, `index.ts`). Root `eslint.config.js` only loads the factory via jiti.

## Do not edit `eslint.config.js` (default)

**Fix the code** (move import, use public entrypoint, respect package kind) or discuss an architecture change first.

Read `eslint-rules/boundaries/` (and the thin root loader) to **understand** why a rule fired—do not treat either as a routine edit surface.

## The one allowed ban-list change

When the workspace adds a **framework** (e.g. React, Next) or **external SDK** that must **never** be imported from `@core/*`, extend the core-package ban list:

**File:** [`eslint-rules/boundaries/restricted-imports.ts`](../../eslint-rules/boundaries/restricted-imports.ts)  
**Export:** `coreRestrictedImportPatterns` (framework/SDK `patterns` group).

**How:** add the **npm package name** to the brace group (same style as existing entries).

**Do not use this** to ban `@infrastructure/*`, `@adapter/*`, or `@ui/*`—those are enforced by the dependency matrix in `dependencies.ts`.

After editing: `pnpm lint` on a core file that would import the new package (should fail) and on a compliant core file (should pass).

## Troubleshooting violations (preferred work)

| Error                                                   | Typical fix                                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `boundaries/dependencies`                               | Import only allowed package kinds; use `@core/<feature>/models` (etc.), not deep paths |
| `boundaries/dependencies` + `core-operations`           | Call operations only from same-feature core intents/ops — never from apps/composition  |
| `no-restricted-imports` + `/providers`                  | Move import into `apps/*/composition/**`, or depend on intents / composition roots     |
| `no-restricted-imports` + infrastructure from core      | Remove; realize via adapter + composition `bind`                                       |
| `no-restricted-imports` + `@core/*` from infrastructure | Remove; infra stays feature-agnostic; join in adapter                                  |
| `no-restricted-imports` + react/next/sdk in core        | Remove; keep SDKs in infra/apps                                                        |
| `check-file/filename-blocklist`                         | Rename to `*.shape.ts`, `*.intent.ts`, `*.provider.ts`, `*.capabilities.ts`, etc.      |

Resolver issues: verify paths in `tsconfig.base.json` / `tsconfig.eslint.json` match layout—**do not** edit tsconfig or ESLint to silence one file; stop and ask if alignment needs a structural change.

## Rules reference (read-only)

### Package-kind matrix (summary)

| From                       | May import                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **core**                   | own entrypoints only; no infra / adapter / ui / apps                                                       |
| **infra**                  | same vendor ok; **no** `@core/*`, adapter, ui                                                              |
| **adapter**                | its `@core/*/models\|intents\|errors` + stack `@infrastructure/*`                                          |
| **ui**                     | ui only                                                                                                    |
| **apps (non-composition)** | core models/intents/errors, `@ui/*`, composition roots — **not** `/providers`, **not** infra, **not** ops  |
| **apps/composition**       | core models/intents/errors + `/providers` (not operations), infra/adapter **including** `/providers`, ui   |

### Entrypoint depth

Fixed entrypoints only: `@core|<infra|<adapter>/<name>/{models,intents,providers,errors}`. Deep imports forbidden. `/operations` has no public export.

### Filename patterns (`check-file`)

Typical allowed names under boundary packages:

| Path                      | Allowed                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `core-*/models/`          | `*.shape.ts`, `*.primitive.ts`, `*.proof.ts`, tests, `index.ts`          |
| adapter / infra `models/` | plain Zod `*.shape.ts`, `index.ts` (no domain-zod kits)                  |
| `*/errors/`               | `*.error.ts`, `index.ts` (any boundary)                                  |
| `core-*/operations/`      | `*.capabilities.ts`, `*.service.ts`, tests, `index.ts` (**core only**)   |
| `*/intents/`              | `*.intent.ts`, `*.provider.ts`, `index.intents.ts`, `index.providers.ts` |

## If architecture truly changes

New package **kind**, new entrypoint, or new dependency matrix → update the [Forma bible](../../architecture/forma-oriented-monorepo.md) **first**, then `eslint-rules/boundaries/` in a dedicated change with team agreement—not as a drive-by lint fix.
