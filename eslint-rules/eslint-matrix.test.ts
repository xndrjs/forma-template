import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
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
    (
      options as { rules?: { from?: unknown; allow?: unknown }[] } | null
    )?.rules ?? []
  );
}

describe("Forma ESLint matrix", () => {
  it("allows *-providers only from app-composition in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/composition/root.ts"),
    );
    const rules = dependencyRulesFor(config);
    const composition = rules.find((rule) =>
      JSON.stringify(rule.from ?? null).includes("app-composition"),
    );
    const allow = JSON.stringify(composition?.allow ?? null);
    expect(allow).toContain("core-providers");
    expect(allow).toContain("infrastructure-providers");
    expect(allow).toContain("adapter-providers");

    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    const appAllow = JSON.stringify(app?.allow ?? null);
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
        "packages/infrastructure-contentful/models/index.ts",
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

  it("disallows app → providers in boundaries matrix", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "apps/web/routes/page.ts"),
    );
    const rules = dependencyRulesFor(config);
    const app = rules.find(
      (rule) => JSON.stringify(rule.from ?? null) === '{"type":"app"}',
    );
    expect(JSON.stringify(app?.allow ?? null)).not.toContain("providers");
  });

  it("enforces Forma package kinds (intents/adapter), not ports/use-cases layers", async () => {
    const eslint = new ESLint({ cwd: repoRoot });
    const config = await eslint.calculateConfigForFile(
      path.join(repoRoot, "packages/core-pagebuilder/intents/index.intents.ts"),
    );
    const deps = config.rules?.["boundaries/dependencies"];
    const serialized = JSON.stringify(deps ?? null);
    expect(serialized).not.toContain("core-ports");
    expect(serialized).not.toContain("core-use-cases");
    expect(serialized).toContain("core-intents");
    expect(serialized).toContain("adapter");
    expect(serialized).toContain("core-providers");
  });
});
