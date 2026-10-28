# Agent instructions (@xndrjs/forma-template)

## Architecture

Read [standards/forma-oriented-monorepo.md](./standards/forma-oriented-monorepo.md) for package kinds, Forma entrypoints, ESLint matrix, and composition.

Route ambiguous work via the architecture router skill `forma-monorepo` under `.skills/`.

## Agent skills — symlink layout

| Path                                                 | Role                                |
| ---------------------------------------------------- | ----------------------------------- |
| `.skills/<name>/SKILL.md`                            | **Only path to edit**               |
| `.cursor/skills`, `.claude/skills`, `.github/skills` | Symlinks to `.skills/` (same inode) |

When updating skills:

- Write full content to `.skills/<name>/SKILL.md`.
- Do **not** create redirect stubs (`See canonical guide in .skills/...`) — they erase the only copy.
- Do **not** write separate copies under `.cursor/skills` or `.claude/skills`.

## Skill map (common intents)

| Intent                                                       | Skill                    |
| ------------------------------------------------------------ | ------------------------ |
| Multi-capability planning / god-spec split                   | `forma-spec-map`         |
| Multi-boundary feature (SPEC → kits → intents → composition) | `forma-feature-workflow` |
| Boundary package naming / split                              | `forma-boundary-design`  |
| Kits / schemas / mappers, capabilities, services, errors     | `forma-boundary-models`  |
| Intents ± provide (`*.intent.ts` / `*.provider.ts`)          | `forma-intents`          |
| Adapter stacks / fetch-raw vs materialize                    | `forma-adapter-stacks`   |
| Composition roots (`compose` / `bind` / surface)             | `forma-composition`      |
| Boundary / import violations                                 | `forma-boundaries`       |

Full router table: skill `forma-monorepo`.

## Scaffolding (`@xndrjs/plop-os`)

| Command                           | Role                                     |
| --------------------------------- | ---------------------------------------- |
| `pnpm plop`                       | Interactive scaffold (stock Plop)        |
| `pnpm plop:run <gen> --input '…'` | Non-interactive scaffold                 |
| `pnpm plop:sync`                  | Rewrite barrel / `tsconfig` sync regions |

Generators live in [`tools/plop/plopfile.ts`](./tools/plop/plopfile.ts) (root [`plopfile.mjs`](./plopfile.mjs) is a thin TS loader); templates under [`tools/plop/templates/`](./tools/plop/templates/). Artifact flows pick package via Discovery, then nested dest under the layer, then kebab name.

Domain kits (`@xndrjs/domain-zod`) live in **core** only — order **primitive → shape → proof**, then **capabilities** / services in core `operations/` only. Infra: plain Zod `*.schema.ts` under `schemas/`. Adapter: `*.mapper.ts` under `mappers/` (no `models/`, no `operations/`). Intents: `*.intent.ts` (+ optional sibling `*.provider.ts`). Errors: `*.error.ts` under `errors/` on any boundary.

Apps: one composition file per runtime (`server-only` / `client-only`); wire with Forma `compose` / `bind` / `surface`. After package/app scaffolds, run `pnpm plop:sync` so root `tsconfig.json` `references` stay aligned.
