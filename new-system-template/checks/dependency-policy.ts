// The dependency-allowlist check. Every package that ships with the
// application, including those its dependencies bring in, must be on the
// allowlist's runtime list, and every development tool named in package.json
// on its tools list, each with the reason it is allowed.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './root.ts';

interface LockEntry {
  name?: string;
  version?: string;
  dev?: boolean;
  link?: boolean;
  resolved?: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const readJson = (file: string) => JSON.parse(readFileSync(join(root, file), 'utf8'));

export function checkDependencies(): string[] {
  const allow: { runtime: Record<string, string>; tools: Record<string, string> } = readJson('checks/dependency-allowlist.json');
  const manifest: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } = readJson('package.json');
  const lock: { packages: Record<string, LockEntry> } = readJson('package-lock.json');
  const problems: string[] = [];

  for (const [list, entries] of Object.entries(allow)) {
    if (list === 'description') continue;
    for (const [name, reason] of Object.entries(entries)) {
      if (!String(reason).trim()) problems.push(`the allowlist entry for ${name} gives no reason`);
    }
  }

  // The version installed, from the lockfile, following a link to the folder it points at.
  const installedVersion = (name: string, asked: string) => {
    const entry = lock.packages[`node_modules/${name}`];
    const target = entry?.link && entry.resolved ? lock.packages[entry.resolved] : entry;
    return target?.version ?? asked;
  };

  const direct = manifest.dependencies ?? {};
  for (const [name, version] of Object.entries(direct)) {
    if (!allow.runtime[name]) problems.push(`${name} ${installedVersion(name, version)}, a dependency of the application named in package.json, is not on the allowlist`);
  }
  for (const [name, version] of Object.entries(manifest.devDependencies ?? {})) {
    if (!allow.tools[name]) problems.push(`${name} ${version}, a development tool named in package.json, is not on the allowlist`);
  }

  // The name of the package at a path in the lockfile, such as "node_modules/a/node_modules/b".
  const nameAt = (path: string, entry: LockEntry) =>
    path.includes('node_modules/') ? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length) : (entry.name ?? path.split('/').pop() ?? path);

  // Which packages ask for each package, so that a package brought in by another can be traced to it.
  const requiredBy = new Map<string, Set<string>>();
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (path === '') continue;
    for (const name of Object.keys({ ...entry.dependencies, ...entry.optionalDependencies })) {
      requiredBy.set(name, (requiredBy.get(name) ?? new Set()).add(nameAt(path, entry)));
    }
  }

  for (const [path, entry] of Object.entries(lock.packages)) {
    // The root entry is the project itself; a link points at another entry, which is checked; development tools are checked by name above.
    if (path === '' || entry.link || entry.dev) continue;
    const name = nameAt(path, entry);
    if (allow.runtime[name] || Object.hasOwn(direct, name)) continue;
    const by = [...(requiredBy.get(name) ?? [])].join(', ') || 'no package in the lockfile';
    problems.push(`${name} ${entry.version ?? '(no version)'} ships with the application, brought in by ${by}, and is not on the allowlist`);
  }
  return problems;
}
