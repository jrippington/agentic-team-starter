// The protected-paths check. A change that touches a protected path and the
// application's code together fails: a change to a rule or a check is a change
// of its own. The change is compared with its base: the commit in VERIFY_BASE,
// or the last commit if that is not set. Outside a Git repository, or before
// the first commit, there is nothing to compare with, and the check passes.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './root.ts';

function git(...args: string[]): string[] {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean);
}

// The files the change touches, given from this folder.
export function changedFiles(base = process.env.VERIFY_BASE || 'HEAD'): string[] {
  try {
    git('rev-parse', '--verify', `${base}^{commit}`);
  } catch {
    return [];
  }
  const files = [...git('diff', '--name-only', '--relative', base), ...git('ls-files', '--others', '--exclude-standard')];
  return [...new Set(files)];
}

export function checkProtectedPaths(files = changedFiles()): string[] {
  const { paths }: { paths: string[] } = JSON.parse(readFileSync(join(root, 'checks/protected-paths.json'), 'utf8'));
  const isProtected = (file: string) => paths.some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p));
  // Removing an entry from the list of existing violations, in the change that fixes it, is not a rule change.
  const protectedFiles = files.filter(isProtected).filter((f) => !(f === 'checks/existing-violations.json' && listOnlyShrinks()));
  const codeFiles = files.filter((f) => f.startsWith('src/'));
  if (protectedFiles.length === 0 || codeFiles.length === 0) return [];
  return [
    `this change touches protected paths (${protectedFiles.join(', ')}) and the application's code (${codeFiles.join(', ')}) together; make the rule change a change of its own`,
  ];
}

// True if the list of existing violations has only lost entries since the base.
function listOnlyShrinks(base = process.env.VERIFY_BASE || 'HEAD'): boolean {
  try {
    const before: unknown[] = JSON.parse(execFileSync('git', ['show', `${base}:./checks/existing-violations.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
    const after: unknown[] = JSON.parse(readFileSync(join(root, 'checks/existing-violations.json'), 'utf8'));
    const earlier = new Set(before.map((v) => JSON.stringify(v)));
    return after.length < before.length && after.every((v) => earlier.has(JSON.stringify(v)));
  } catch {
    return false;
  }
}
