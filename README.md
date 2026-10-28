# Forma-oriented monorepo template

Empty TypeScript monorepo template organized around **Forma** boundaries, intents, providers, and composition. Scaffold packages/apps with `@xndrjs/plop-os` (`pnpm plop`).

Canonical architecture: [standards/forma-oriented-monorepo.md](./standards/forma-oriented-monorepo.md).

```txt
apps/            # deployable apps (composition roots)
packages/        # @core/* · @infrastructure/* · @adapter/* · @ui/*
tools/plop/      # generators + templates
standards/       # Forma bible + spec workflow
specs/           # feature SPEC.md / DESIGN.md
```

## First 15 minutes

```sh
node -v            # expect Node 22+ (see .nvmrc / engines)
corepack enable
pnpm install
pnpm typecheck && pnpm lint && pnpm test
pnpm plop          # scaffold first boundary/app
pnpm plop:sync     # barrels + root tsconfig references
```

## Tooling

The workspace uses:

- `pnpm` for workspace and dependency management;
- TypeScript with `moduleResolution: "Bundler"`;
- centralized ESLint flat config;
- Prettier for formatting;
- `@xndrjs/forma` for composition;
- `@xndrjs/plop-os` for scaffolding and barrel sync.

Main commands:

```sh
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm plop          # interactive scaffold
pnpm plop:sync     # sync barrel / tsconfig regions
pnpm plop:run <generator> --input '…'
```

## TypeScript project references

Root `tsconfig.json` is a **solution** config: `"files": []` and a `references` array pointing at managed `tsconfig.json` under `apps/*` and `packages/*`. `pnpm typecheck` runs `tsc -b` against that graph. `references` is maintained by `pnpm plop:sync` (`root-tsconfig-refs` region).

## Testing

Vitest is configured at the root level in `vitest.config.ts`.

The root config defines two initial test profiles:

- `node`: default profile for packages, CLI code, and utilities.
- `react`: `jsdom` profile for React/UI tests in apps or UI-oriented packages.

Commands:

```sh
pnpm test
pnpm test:watch
pnpm test:node
pnpm test:react
```

## Git Hooks

Husky runs `lint-staged` on `pre-commit`.

The hook formats and lints only staged files:

- Prettier runs on staged code, JSON, Markdown, and YAML files.
- ESLint runs with `--fix` on staged JavaScript and TypeScript files.

Full test and typecheck commands are intentionally left to CI.

## Package shapes (Forma)

Entrypoints differ by package kind:

| Kind | Public exports |
| ---- | -------------- |
| **Core** | `./models`, `./intents`, `./providers`, `./errors` |
| **Infrastructure** | `./schemas`, `./intents`, `./providers`, `./errors` |
| **Adapter** | `./mappers`, `./intents`, `./providers`, `./errors` |

```txt
packages/core-<feature>/
  boundary.ts       # shared Forma boundary("…"); same-package only
  models/           # domain-zod kits (*.shape / *.primitive / *.proof)
  intents/          # *.intent.ts + optional *.provider.ts; index.*.ts barrels
  errors/
  operations/       # core-only, internal (capabilities / services)
  package.json
  tsconfig.json

packages/infrastructure-<vendor>/
  boundary.ts
  schemas/          # plain Zod *.schema.ts
  intents/
  errors/
  package.json      # no operations/

packages/adapter-<feature>-<vendor>/
  boundary.ts
  mappers/          # *.mapper.ts (raw → core); no models/
  intents/
  errors/
  package.json      # no operations/
```

- **Core** — feature-specific, vendor-agnostic; owns domain kits + `operations/`.
- **Infrastructure** — vendor-specific, feature-agnostic (raw fetch, clients, `schemas/`); no `operations/`.
- **Adapter** — `adapter-<feature>-<vendor>[…]`; joins one core to a vendor stack via `mappers/`; no `operations/`.
- **UI** — `@ui/<name>`; importable from apps only.

`/providers` may be imported **only** from `apps/*/composition/**`. `/mappers` → same adapter + composition; `/schemas` → same-vendor infra + stack adapters + composition (non-composition apps still must not import infra).

### Composition

Apps own Forma composition roots under `composition/`. Prefer one file per runtime (server or client) with explicit `server-only` / `client-only` (example):

```txt
apps/<app>/
  composition/
    <app>.server.composition.ts
    <app>.client.composition.ts
```

Wire with Forma `compose({ surface, providers, bindings })` and `bind(required, satisfier)`.

### Domain kits (core)

Order: `primitive` → `shape` → `proof` → capabilities / services in core `operations/`. Errors (`*.error.ts`) under `errors/` on any boundary.

```txt
packages/core-billing/models/email.primitive.ts
packages/core-billing/models/user.shape.ts
packages/core-billing/models/verified-user.proof.ts
packages/core-billing/operations/user.capabilities.ts
packages/core-billing/errors/user-not-found.error.ts
packages/core-billing/intents/load-user.intent.ts
```

### Scaffolding (`@xndrjs/plop-os`)

[`tools/plop/plopfile.ts`](./tools/plop/plopfile.ts) (root [`plopfile.mjs`](./plopfile.mjs) loader) + [`tools/plop/templates/`](./tools/plop/templates/).

| Generator family | Examples                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Packages         | `core-boundary`, `infrastructure-boundary`, `adapter-boundary`, `ui-package`, `app`, `composition-root`, `feature-spec` |
| Artifacts        | `shape` (core or infra), `primitive`, `proof`, `mapper`, `errors`, `capabilities`, `domain-service`, `intent`, `provider` |

Artifact prompts: Discovery list package → nested dest under the layer (optional new subdir) → kebab name. Then `pnpm plop:sync` to refresh barrels / root `tsconfig` references. Apps use `app-tsconfig.json.hbs` (`noEmit`); packages use declaration emit.

## ESLint in the monorepo

Root [`eslint.config.js`](./eslint.config.js) is a thin loader (base lint + jiti). The Forma import matrix lives in [`tools/eslint-rules/boundaries/`](./tools/eslint-rules/boundaries/) (`boundaries`, `no-restricted-imports`, `check-file`).

A single central configuration keeps package-kind boundaries, entrypoint bans, and shared conventions consistent. Physically separate configurations per app or package should be avoided unless a package becomes truly autonomous.

## Architecture documentation

Full rules: [standards/forma-oriented-monorepo.md](./standards/forma-oriented-monorepo.md).

Spec workflow: [standards/specification-driven-feature-workflow.md](./standards/specification-driven-feature-workflow.md).

### Agent skills

Task-specific guides live in [`.skills/`](./.skills/) (canonical). Symlinks expose the same tree to Cursor (`.cursor/skills`), GitHub Copilot (`.github/skills`), and Claude Code (`.claude/skills`).

**Agents:** `.cursor/skills` and `.claude/skills` are the **same files** as `.skills/` — edit only `.skills/<name>/SKILL.md`. Do not add “see canonical guide” stubs; see [AGENTS.md](./AGENTS.md).

| Skill                    | Scope                                          |
| ------------------------ | ---------------------------------------------- |
| `forma-monorepo`         | Router                                         |
| `forma-spec-map`         | Multi-capability / god-spec decomposition      |
| `forma-feature-workflow` | Multi-boundary feature implementation          |
| `forma-boundary-design`  | Boundary package naming and scope              |
| `forma-boundary-models`  | Kits, schemas, mappers, capabilities, services |
| `forma-intents`          | Intents ± provide                              |
| `forma-adapter-stacks`   | Adapter naming; fetch-raw vs materialize       |
| `forma-composition`      | App composition (`compose` / `bind` / surface) |
| `forma-boundaries`       | ESLint package-kind boundaries                 |

## Architectural boundaries

Boundaries are enforced through `eslint-plugin-boundaries` and `no-restricted-imports` in [`tools/eslint-rules/boundaries/`](./tools/eslint-rules/boundaries/). Full matrix: [standards/forma-oriented-monorepo.md](./standards/forma-oriented-monorepo.md).

Principles:

- core packages do not import infrastructure, adapter, or UI packages;
- infrastructure packages do not import `@core/*` or UI;
- adapters import core models/intents/errors and their infrastructure stack (`/schemas`, `/intents`, `/errors`);
- UI packages (`@ui/*`) are consumed from apps only;
- core packages do not import frameworks or external SDKs;
- packages do not import code from `apps/`;
- entrypoints by kind: core `models|intents|providers|errors`; infra `schemas|…`; adapter `mappers|…` — core `operations/` is internal (same-feature intents/ops only; never apps/composition) and absent on adapter/infra;
- `/providers` is importable only from `apps/*/composition/**`; `/mappers` from same adapter + composition only;
- each app’s `composition/` folder is the Forma wiring point (`compose`, providers, bind, surface).
