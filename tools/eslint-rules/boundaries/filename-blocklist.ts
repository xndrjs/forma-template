/**
 * Forma `check-file/filename-blocklist` — allowed names per entrypoint folder.
 * Keys are micromatch patterns of *disallowed* paths; values are human hints.
 */
export const formaFilenameBlocklist = {
  "packages/core-*/models/!(*.shape(.test)?|*.test|*.primitive(.test)?|*.proof(.test)?|index).ts":
    "*.shape.ts, *.primitive.ts, *.proof.ts, colocated *.test.ts, or index.ts",
  "packages/infrastructure-*/schemas/!(*.schema(.test)?|index).ts":
    "*.schema.ts, colocated *.test.ts, or index.ts",
  "packages/adapter-*/mappers/!(*.mapper(.test)?|index).ts":
    "*.mapper.ts, colocated *.test.ts, or index.ts",
  "packages/{core,adapter,infrastructure}-*/errors/!(*.error|index).ts":
    "*.error.ts or index.ts",
  "packages/core-*/operations/!(*.capabilities(.test)?|*.service(.test)?|index).ts":
    "*.capabilities.ts, *.service.ts, colocated *.test.ts, or index.ts",
  "packages/core-*/intents/!(*.intent(.test)?|*.provider(.test)?|index.intents|index.providers).ts":
    "*.intent.ts, *.provider.ts, index.intents.ts, or index.providers.ts",
} as const;
