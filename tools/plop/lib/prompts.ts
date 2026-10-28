import path from "node:path";
import type { CandidateData, DiscoveryRule, PlopOs } from "@xndrjs/plop-os";

import { kebabValidate } from "./names";
import { destLabel } from "./paths";

type Answers = Record<string, unknown>;

export function packageListPrompt<TData extends CandidateData>(
  plopOs: PlopOs,
  packageRule: DiscoveryRule<TData>,
  opts: { name?: string; message?: string; emptyError?: string } = {},
) {
  const name = opts.name ?? "packagePath";
  const message = opts.message ?? "package";
  const emptyError =
    opts.emptyError ?? "no packages found — scaffold a boundary first";
  return {
    type: "list" as const,
    name,
    message,
    choices() {
      const hits = plopOs.candidates(packageRule);
      if (hits.length === 0) throw new Error(emptyError);
      return hits.map((c) => ({ name: c.label, value: c.path }));
    },
    validate(v: unknown) {
      try {
        plopOs.resolveCandidate(packageRule, String(v));
        return true;
      } catch (e) {
        return e instanceof Error ? e.message : "invalid package path";
      }
    },
  };
}

/**
 * Nested destinations under a layer root (models/errors/operations/intents).
 * Expects prior `layerPath`, or derives it as `${packagePath}/${layer}` when `layer` is set.
 */
export function nestedDestPrompt<TData extends CandidateData>(
  plopOs: PlopOs,
  dirsRule: DiscoveryRule<TData>,
  opts: {
    layerPathKey?: string;
    name?: string;
    message?: string;
    /** Derive layerPath from package answer + this segment (e.g. "errors"). */
    layer?: string;
    packageKey?: string;
  } = {},
) {
  const layerPathKey = opts.layerPathKey ?? "layerPath";
  const name = opts.name ?? "destPath";
  const message = opts.message ?? "destination directory";
  const packageKey = opts.packageKey ?? "packagePath";
  return {
    type: "list" as const,
    name,
    message,
    choices(answers: Answers) {
      let layerPath = answers[layerPathKey];
      if (typeof layerPath !== "string" || !layerPath) {
        if (!opts.layer) {
          throw new Error(`select ${layerPathKey} first`);
        }
        layerPath = layerFromPackageAnswers(answers, opts.layer, packageKey);
        answers[layerPathKey] = layerPath;
      }
      if (typeof layerPath !== "string" || !layerPath) {
        throw new Error(`select ${layerPathKey} first`);
      }
      const dirs = plopOs.candidates(dirsRule, layerPath);
      if (dirs.length === 0) {
        throw new Error("no destination directories under that layer");
      }
      return dirs.map((c) => ({
        name: destLabel(layerPath, c.path),
        value: c.path,
      }));
    },
  };
}

/** Optional nested subdir under selected dest (empty = use dest as-is). */
export function newSubdirPrompt() {
  return {
    type: "input" as const,
    name: "newSubdir",
    message: "new nested folder under dest (empty = use selected dest)",
    default: "",
    validate(v: unknown) {
      const s = String(v ?? "").trim();
      if (!s) return true;
      return /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(s)
        ? true
        : "kebab path segments only (e.g. strips or strips/hero)";
    },
  };
}

export function kebabNamePrompt(message = "name (kebab-case)") {
  return {
    type: "input" as const,
    name: "name",
    message,
    validate: kebabValidate,
  };
}

/** Layer path = packagePath + layer segment. */
export function layerFromPackageAnswers(
  answers: Answers,
  layer: string,
  packageKey = "packagePath",
): string {
  return path.join(String(answers[packageKey]), layer);
}
