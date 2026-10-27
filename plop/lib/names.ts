export function pascalName(value: string): string {
  return String(value)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
}

export function camelName(value: string): string {
  const p = pascalName(value);
  return p ? p[0]!.toLowerCase() + p.slice(1) : "";
}

export function kebabOk(v: unknown): boolean {
  return Boolean(v && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v)));
}

export function kebabValidate(v: unknown): true | string {
  return kebabOk(v) ? true : "kebab-case name required (e.g. page-slug)";
}
