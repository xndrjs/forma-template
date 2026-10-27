---
name: forma-spec-map
description: Decomposes a product idea into a spec map—coherent capability specs under specs/—before writing SPEC.md/DESIGN.md or implementation. Use when planning a new system, splitting a god-spec, or asking which specs/folders to create; not for implementing a single spec (use forma-feature-workflow).
---

# Spec map (decomposition before specs)

## When to use

- A **new product** or large feature needs planning before any `specs/<feature>/` folders exist.
- An existing spec is a **god-spec** (unrelated workflows, mixed lifecycles, cannot be summarized in one sentence).
- The user asks for a **spec map**, **capability breakdown**, or **how to split specs**.

**Do not use** when a single `specs/<feature>/` is already scoped—use skill `forma-feature-workflow` (Phase 1: `SPEC.md` + `DESIGN.md`).

**Bridge:** spec map = **which capabilities exist and how they depend on each other**; per-spec docs = **what each does and how to build it** (Forma inventory in DESIGN).

---

## Purpose

High-level decomposition into coherent specifications **before** per-spec docs or code.

Optimize for: clarity, explicit **excluded** concerns per spec, evolvability, **to-be** structure (not execution planning).

---

## To-be vs delta (critical)

`specs/SPEC-MAP.md` is a **table of contents** for capability folders.

| Belongs in the map (to-be)       | Does **not** belong (delta)        |
| -------------------------------- | ---------------------------------- |
| Product overview (1–3 sentences) | Implementation order or phases     |
| Spec names + folder paths        | `@core/*` / package / intent names |
| Purpose per spec (one line)      | Kit filenames, provider methods    |
| Included flows (F1, F2, …)       | Error catalogs, sequence diagrams  |
| **Excluded** concerns per spec   | Shared wiring tables               |
| Depends on (other specs or none) | How an oversized draft was split   |

**Open questions:** domain/product only. Technical choices → per-spec `SPEC.md` / `DESIGN.md` or a separate plan.

---

## What a spec is

A **meaningful system capability**—a folder under [`specs/`](../../specs/) that will own `SPEC.md` and `DESIGN.md`.

| Good (capability) | Bad (artifact)       |
| ----------------- | -------------------- |
| Vault lifecycle   | AddTodoButton        |
| Entry management  | Save API             |
| Billing workflow  | User table component |

Not: one endpoint, one UI page, one DB table, one intent, one package.

---

## Workspace layout (after the map is agreed)

```txt
specs/
  SPEC-MAP.md
  <feature>/          # created when Phase 1 starts
    SPEC.md
    DESIGN.md
```

- **`<feature>`:** kebab-case, business-oriented—not necessarily equal to a `@core/*` name.
- Under `specs/`: only `SPEC-MAP.md` at root; per slice only `SPEC.md` + `DESIGN.md`.
- Mermaid diagrams live **inside** per-spec `DESIGN.md`, not in the map.

Canonical architecture: [forma-oriented-monorepo.md](../../architecture/forma-oriented-monorepo.md).

---

## Process

### Step 1 — Identify major flows

Actors, journeys, critical transitions—**no** frameworks, databases, or class hierarchies.

### Step 2 — Group flows by coherent responsibility

Shared domain concepts, lifecycle, security, or operational purpose → one spec.

### Step 3 — Split when reasons diverge

| Reason                              | Example                                 |
| ----------------------------------- | --------------------------------------- |
| Different lifecycle / state machine | Vault lifecycle vs entry CRUD           |
| Different trust boundary            | Auth vs profile                         |
| Different primary model             | Search vs publishing                    |
| Different external system           | Payments vs CMS                         |
| Independent evolve/test             | Change one without redefining the other |

### Step 4 — Size check

Summarizable in **one sentence**; coherent capability; clear **excluded** list. Too large if unrelated workflows or exclusions overlap another spec.

---

## Deliverable

**Done** when the user agrees and, if persisting, **`specs/SPEC-MAP.md`** is saved.

**Do not** write `SPEC.md`, `DESIGN.md`, implementation, or other files under `specs/` during map work—**only** `SPEC-MAP.md`. Do not pre-create slice folders.

### Required shape (lean)

```markdown
# Spec map — [Product / initiative name]

## Overview

[1–3 sentences]

## Table of contents

| Spec   | Folder          | Depends on      |
| ------ | --------------- | --------------- |
| [name] | `specs/<name>/` | — or other spec |

## [name]

- **Purpose:** [one line]
- **Flows:** [F1 … · F2 …]
- **Excluded:** [explicit list]
- **Depends on:** [other specs or none]
```

Keep well under ~50 lines for a typical PoC.

---

## Hard stops

**Stop and ask** if:

- User wants implementation or per-spec docs before the map is agreed.
- One proposed spec still mixes unrelated lifecycles or trust boundaries.
- The draft includes implementation order, phases, package/intent/kit names, or error tables.
- Excluded concerns cannot be named per spec.
- Extra files (`README.md`, etc.) appear under `specs/`—remove them.

After agreement, each `specs/<feature>/` advances via **`forma-feature-workflow`**.

---

## Prompt template

```txt
Given this product idea:

[PRODUCT IDEA]

Create a lean spec map (specs/SPEC-MAP.md) for this Forma monorepo.

To-be only: capability decomposition (table of contents).
Not delta: no implementation order, phases, package names, intents, or kits.

Include overview, TOC table, per-spec purpose/flows/excluded/depends-on.
Do not write SPEC.md, DESIGN.md, subfolders, or code.
```

---

## Skill map

| After                  | Skill                              |
| ---------------------- | ---------------------------------- |
| Per-spec SPEC + DESIGN | `forma-feature-workflow` (Phase 1) |
| Boundary naming        | `forma-boundary-design`            |
| Ambiguous routing      | `forma-monorepo`                   |

## Success criterion

Someone can see **which capabilities exist**, **how they depend**, and **what is out of each spec**—without reading architecture or a delivery plan.
