// Shows that every check can fail. For each planted change in planted/, it
// copies the project to a temporary folder, applies the change there (after
// its rule.patch, if it has one, committed as the base), runs the
// verification command, and compares the checks that failed with the one the
// change is planted to fail. The project itself is never changed.
//
// Usage: npm run prove [-- <name> ...]
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { root } from './root.ts';

interface Planted {
  readonly check: string;
  readonly change: string;
}

const skip = new Set(['node_modules', '.git', 'observed']);
const plantedFolder = join(root, 'planted');
const wanted = process.argv.slice(2);
const names = readdirSync(plantedFolder, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (wanted.length === 0 || wanted.includes(d.name)))
  .map((d) => d.name)
  .sort();

function copyProject(): string {
  const copy = mkdtempSync(join(tmpdir(), 'prove-'));
  cpSync(root, copy, { recursive: true, filter: (source) => !relative(root, source).split('/').some((part) => skip.has(part)) });
  mkdirSync(join(copy, 'node_modules'));
  for (const name of readdirSync(join(root, 'node_modules'))) symlinkSync(join(root, 'node_modules', name), join(copy, 'node_modules', name));
  return copy;
}

function git(copy: string, ...args: string[]): void {
  execFileSync('git', ['-c', 'user.name=prove', '-c', 'user.email=prove@localhost', '-c', 'commit.gpgsign=false', ...args], { cwd: copy, stdio: 'pipe' });
}

let differs = 0;
for (const name of names) {
  const folder = join(plantedFolder, name);
  const planted: Planted = JSON.parse(readFileSync(join(folder, 'planted.json'), 'utf8'));
  const copy = copyProject();
  try {
    git(copy, 'init', '-q', '-b', 'main');
    git(copy, 'add', '-A');
    git(copy, 'commit', '-q', '-m', 'base');
    if (existsSync(join(folder, 'rule.patch'))) {
      git(copy, 'apply', join(folder, 'rule.patch'));
      git(copy, 'add', '-A');
      git(copy, 'commit', '-q', '-m', 'rule');
    }
    git(copy, 'apply', join(folder, 'change.patch'));
    const report = join(copy, 'verify-report.json');
    const verify = spawnSync('npx', ['tsx', 'checks/verify.ts', '--json', report], {
      cwd: copy,
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', VERIFY_BASE: 'HEAD' },
    });
    const results: { check: string; passed: boolean }[] = existsSync(report) ? JSON.parse(readFileSync(report, 'utf8')).results : [];
    const failed = results.filter((r) => !r.passed).map((r) => r.check);
    const asPlanted = failed.length === 1 && failed[0] === planted.check;
    if (!asPlanted) differs += 1;

    // What the verification command printed for the checks that failed, with the copy's path hidden.
    const failures: string[] = [];
    let keep = false;
    for (const line of (verify.stdout ?? '').split('\n')) {
      if (/^(PASS|FAIL) /.test(line)) keep = line.startsWith('FAIL');
      else if (!line.startsWith(' ')) keep = false;
      if (keep) failures.push(line);
    }
    const hide = (text: string) => [realpathSync(copy), copy].reduce((t, path) => t.split(path).join('<copy>'), text);

    console.log(`${name}: ${planted.change}`);
    console.log(`  Planted to fail: ${planted.check}. Failed: ${failed.join(', ') || 'nothing'}. ${asPlanted ? 'As planted.' : 'Not as planted.'}`);
    for (const line of failures) console.log(`  ${hide(line)}`);
    console.log('');
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
}

const count = names.length === 1 ? 'The 1 planted change' : `All ${names.length} planted changes`;
console.log(
  differs === 0
    ? `${count} failed the check each was planted to fail, and no other.`
    : `${differs} of ${names.length} planted changes did not fail as planted.`,
);
process.exitCode = differs === 0 && names.length > 0 ? 0 : 1;
