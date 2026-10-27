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

describe("Forma ESLint matrix", () => {
  it("bans /providers outside apps/*/composition/**", async () => {
    const messages = await lintAt(
      "apps/web/routes/page.ts",
      'import "@core/pagebuilder/providers";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(true);
  });

  it("allows /providers from apps/*/composition/**", async () => {
    const messages = await lintAt(
      "apps/web/composition/root.ts",
      'import "@core/pagebuilder/providers";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(false);
  });

  it("bans infrastructure → @core/*", async () => {
    const messages = await lintAt(
      "packages/infrastructure-contentful/client.ts",
      'import "@core/pagebuilder/models";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(true);
  });

  it("bans core → @adapter/*", async () => {
    const messages = await lintAt(
      "packages/core-pagebuilder/models/index.ts",
      'import "@adapter/pagebuilder-contentful/models";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(true);
  });

  it("bans adapter → /providers", async () => {
    const messages = await lintAt(
      "packages/adapter-pagebuilder-contentful/materialize.ts",
      'import "@core/pagebuilder/providers";\n',
    );
    expect(hasRule(messages, "no-restricted-imports")).toBe(true);
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
  });
});
