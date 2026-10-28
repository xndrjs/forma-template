---
name: forma-composition
description: Creates or extends Forma composition roots under apps/*/composition/—compose surface, providers, and bind; server-only vs client-only runtimes. Use when wiring providers, binding unrealized intents to adapter satisfiers, or adding composition modules.
---

# Composition root (`apps/*/composition/`)

## One composition module per runtime

**Encouraged:** one `*.composition.ts` per **runtime** for the app—not one file per `@core/<feature>`.

| Runtime | Marker                 | Typical file                  | Public export (example) |
| ------- | ---------------------- | ----------------------------- | ----------------------- |
| Server  | `import "server-only"` | `<app>.server.composition.ts` | `get<App>ServerRoot`    |
| Client  | `import "client-only"` | `<app>.client.composition.ts` | `get<App>ClientRoot`    |

- Wire **all** features for that runtime in the same root.
- Do **not** split into per-feature composition files.
- Runtime is always explicit (`runtime: "server" | "client"`); no isomorphic roots.

Architecture: [forma-oriented-monorepo.md](../../architecture/forma-oriented-monorepo.md) — _Composition_.

## Role

Composition is the **only** place that may import `@*/providers` and assemble:

- `providers: […]` — realized providers to register
- `bindings: [bind(Unrealized, Satisfier)]` — rewrite requirements across boundaries
- `surface: { alias: Provider }` — app-callable API

**Not** composition’s job:

- Domain capabilities / services (stay in boundary `operations/`)
- Business rules, validation, or domain transforms

## Smoke shape

```ts
import "server-only";

import { LoadPageFromContentful } from "@adapter/pagebuilder-contentful/intents";
import { LoadPageFromContentfulProvider } from "@adapter/pagebuilder-contentful/providers";
import { LoadPage } from "@core/pagebuilder/intents";
import { GetPageProvider } from "@core/pagebuilder/providers";
import { bind, compose } from "@xndrjs/forma";

export function getWebNextServerRoot() {
  return compose({
    surface: { getPage: GetPageProvider },
    providers: [LoadPageFromContentfulProvider],
    bindings: [bind(LoadPage, LoadPageFromContentful)],
  });
}
```

Call sites import the root from composition—not providers or infrastructure factories directly.

## Allowed imports

| Actor                   | Allowed                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/*/composition/**` | `@core/*` (incl. `/providers`), `@infrastructure/*` (incl. `/schemas` + `/providers`), `@adapter/*` (incl. `/mappers` + `/providers`), `@ui/*` |
| Rest of app             | `@core/*/models\|intents\|errors`, `@adapter/*/intents\|errors`, `@ui/*`, composition roots — **not** `/providers`, **not** `/mappers`, **not** infra |

## Checklist

- [ ] One composition file per **runtime**—not per core feature.
- [ ] Unrealized intents used by surface providers are `bind`ed to adapter (or other) satisfiers.
- [ ] Providers listed in `providers` / `surface` as needed.
- [ ] Rest of the app imports `get*Root`—not `@infrastructure/*` or `/providers`.
- [ ] No domain `.attach` / capability wiring here.

## Anti-patterns

- One `*.composition.ts` per `@core/<feature>`.
- Mixing server and client wiring without `server-only` / `client-only`.
- Instantiating infrastructure inside route handlers instead of through the root.
- Domain validation or pricing rules in composition.
- Importing `/providers` outside `composition/`.
- Duplicating the same Intent on both `surface` and `providers` (Forma rejects it).

## Related

- Intents: `forma-intents`
- Adapter stacks: `forma-adapter-stacks`
- Multi-boundary order: `forma-feature-workflow` (final phase)
- Boundaries: `forma-boundaries`
