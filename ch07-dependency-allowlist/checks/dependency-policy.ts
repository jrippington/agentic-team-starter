// The dependency policy. Every package this project installs must be on the
// allowlist, each entry with the reason it is allowed. The check reads the
// packages named in package.json and every package in package-lock.json,
// which includes the packages that those bring in.
//
// Any entry ending in "/*", such as "@esbuild/*", allows every package in
// that scope.
import { readFileSync } from 'node:fs';

interface LockEntry {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const allowlist: Record<string, { reason?: string }> = readJson('allowlist.json').packages;
const manifest = readJson('package.json');
const lockfile: { packages: Record<string, LockEntry> } = readJson('package-lock.json');

const isAllowed = (name: string) =>
  Object.hasOwn(allowlist, name) ||
  Object.keys(allowlist).some((entry) => entry.endsWith('/*') && name.startsWith(entry.slice(0, -1)));

// The package's name from its path in the lockfile, such as "node_modules/a/node_modules/b".
const nameAt = (path: string) => path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);

// Who asks for each package: package.json itself, or the packages that depend on it.
const requiredBy = new Map<string, Set<string>>();
for (const [path, entry] of Object.entries(lockfile.packages)) {
  const requester = path === '' ? 'package.json' : nameAt(path);
  const wanted = {
    ...entry.dependencies,
    ...entry.devDependencies,
    ...entry.optionalDependencies,
    ...entry.peerDependencies,
  };
  for (const name of Object.keys(wanted)) {
    requiredBy.set(name, (requiredBy.get(name) ?? new Set()).add(requester));
  }
}

const problems: string[] = [];

for (const [entry, { reason }] of Object.entries(allowlist)) {
  if (!reason?.trim()) problems.push(`allowlist entry ${entry} gives no reason`);
}

const named = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.optionalDependencies };
for (const [name, version] of Object.entries(named)) {
  if (!isAllowed(name)) problems.push(`${name} ${version}, named in package.json, is not on the allowlist`);
}

const installed = Object.entries(lockfile.packages).filter(([path]) => path !== '');
for (const [path, entry] of installed) {
  const name = nameAt(path);
  if (isAllowed(name) || Object.hasOwn(named, name)) continue;
  const by = [...(requiredBy.get(name) ?? [])].join(', ') || 'nothing';
  problems.push(`${name} ${entry.version}, required by ${by}, is not on the allowlist`);
}

console.log(`Dependency policy: ${installed.length} packages in package-lock.json checked against allowlist.json`);
for (const problem of problems) console.log(`  ${problem}`);

if (problems.length > 0) {
  const count = problems.length === 1 ? 'One problem' : `${problems.length} problems`;
  console.log(
    `\nFailed: ${count}. Remove the package, or add it to allowlist.json with the reason\n` +
      'it is needed, so that the addition is reviewed as a change of its own.',
  );
  process.exitCode = 1;
} else {
  console.log('\nPassed: every package is on the allowlist, and every entry gives its reason.');
}
