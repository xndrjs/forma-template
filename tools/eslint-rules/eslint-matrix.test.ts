import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function lintAt(filePath: string, code: string) {
  const eslint = new ESLint({ cwd: repoRoot });
  const results = await eslint.lintText(code, {
    filePath: path.join(repoRoot, filePath),
  });
  return results[0]?.messages ?? [];
}

function hasRule(messages: { ruleId: string | null }[], ruleId: string) {
  return messages.some((m) => m.ruleId === ruleId);
}

function dependencyRulesFor(config: { rules?: Record<string, unknown> }) {
  const deps = config.rules?.["boundaries/dependencies"];
  const options = Array.isArray(deps) ? deps[1] : null;
  return (
    (options as { rules?: { from?: unknown; allow?: unknown }[] } | null)
      ?.rules ?? []
  );
}

function allowTypes(rule: { allow?: unknown } | undefined): string {
  return JSON.stringify(rule?.allow ?? null);
}

describe("Forma ESLint matrix", () => {
  it("splits infrastructure into schemas|intents|errors|providers and adapter into mappers|intents|errors|providers", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/composition/root.ts"),
    );
    const elements = JSON.stringify(
      config.settings?.["boundaries/elements"] ?? null,
    );
    for (const layer of [
      "schemas",
      "intents",
      "errors",
      "providers",
    ] as const) {
      expect(elements).toContain(`infrastructure-${layer}`);
    }
    for (const layer of [
      "mappers",
      "intents",
      "errors",
      "providers",
    ] as const) {
      expect(elements).toContain(`adapter-${layer}`);
    }
    expect(elements).not.toContain("infrastructure-models");
    expect(elements).not.toContain("adapter-models");
    // Package-root Forma handles (same-package only)
    expect(elements).toContain("core-boundary");
    expect(elements).toContain("infrastructure-boundary");
    expect(elements).toContain("adapter-boundary");
    // Monolith package elements must not remain
    expect(elements).not.toMatch(/"type":"infrastructure"/);
    expect(elements).not.toMatch(/"type":"adapter"/);
  });

  it("keeps *-boundary out of app and app-composition allow lists", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/composition/root.ts"),
    );
    const rules = dependencyRulesFor(config);
    const composition = rules.find((rule) =>
      JSON.stringify(rule.from ?? null).includes("app-composition"),
    );
    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    expect(allowTypes(composition)).not.toContain("boundary");
    expect(allowTypes(app)).not.toContain("boundary");
  });

  it("bans core-operations from app-composition and app", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/composition/root.ts"),
    );
    const rules = dependencyRulesFor(config);
    const composition = rules.find((rule) =>
      JSON.stringify(rule.from ?? null).includes("app-composition"),
    );
    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    expect(allowTypes(composition)).not.toContain("core-operations");
    expect(allowTypes(app)).not.toContain("core-operations");

    const intents = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"core-intents"}',
    );
    expect(allowTypes(intents)).toContain("core-operations");
  });

  it("allows *-providers only from app-composition in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/composition/root.ts"),
    );
    const rules = dependencyRulesFor(config);
    const composition = rules.find((rule) =>
      JSON.stringify(rule.from ?? null).includes("app-composition"),
    );
    const allow = allowTypes(composition);
    expect(allow).toContain("core-providers");
    expect(allow).toContain("infrastructure-providers");
    expect(allow).toContain("adapter-providers");

    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    const appAllow = allowTypes(app);
    expect(appAllow).not.toContain("providers");
  });

  it("still bans deep core imports via no-restricted-imports", async () => {
    const messages = await lintAt(
      "apps/web/routes/page.ts",
      'import "@core/pagebuilder/models/deep";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(true);
  });

  it("disallows infrastructure → core in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(
        repoRoot,
        "packages/infrastructure-contentful/schemas/index.ts",
      ),
    );
    const rules = dependencyRulesFor(config);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      if (!JSON.stringify(rule.from ?? null).includes("infrastructure")) {
        continue;
      }
      expect(JSON.stringify(rule.allow ?? null)).not.toContain("core-");
    }
  });

  it("disallows core → adapter in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "packages/core-pagebuilder/models/index.ts"),
    );
    const rules = dependencyRulesFor(config);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      if (!JSON.stringify(rule.from ?? null).includes("core-")) {
        continue;
      }
      expect(JSON.stringify(rule.allow ?? null)).not.toContain("adapter");
    }
  });

  it("disallows app → providers and adapter-mappers in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/routes/page.ts"),
    );
    const rules = dependencyRulesFor(config);
    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    const appAllow = JSON.stringify(app?.allow ?? null);
    expect(appAllow).not.toContain("providers");
    expect(appAllow).not.toContain("adapter-mappers");
    expect(appAllow).not.toContain("infrastructure-");
  });
});
