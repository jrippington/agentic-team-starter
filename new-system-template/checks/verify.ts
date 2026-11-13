// The verification command: runs every check, the same way on your machine and
// in continuous integration, and reports each by the name of the rule it
// enforces. Exits with status 1 if any check fails.
//
// Usage: npm run verify [-- --json <file>]
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { checkDependencies } from './dependency-policy.ts';
import { checkProtectedPaths } from './protected-paths.ts';
import { checkRegister } from './register.ts';
import { root } from './root.ts';
import { checkWaivers } from './waivers.ts';

interface Result {
  readonly check: string;
  readonly passed: boolean;
  readonly detail: readonly string[];
}

function run(command: string, args: readonly string[]): { ok: boolean; output: string } {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function lines(text: string, pattern?: RegExp): string[] {
  return text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() && (!pattern || pattern.test(l)));
}

function fromList(check: string, problems: string[]): Result {
  return { check, passed: problems.length === 0, detail: problems };
}

// Each file in test/checks/ is a check of its own, named after the file.
function checkTests(): Result[] {
  const directory = mkdtempSync(join(tmpdir(), 'verify-'));
  const report = join(directory, 'checks.json');
  const vitest = run('npx', ['vitest', 'run', '--project', 'checks', '--reporter=json', `--outputFile=${report}`]);
  if (!existsSync(report)) return [{ check: 'check-tests', passed: false, detail: ['the check tests did not run', ...lines(vitest.output, /Error/).slice(0, 4)] }];
  const parsed: { testResults: { name: string; status: string; message?: string; assertionResults: { status: string; title: string; failureMessages: string[] }[] }[] } =
    JSON.parse(readFileSync(report, 'utf8'));
  rmSync(directory, { recursive: true, force: true });
  return parsed.testResults
    .map((file) => {
      const failed = file.assertionResults.filter((a) => a.status === 'failed');
      // The first lines of each failure say what was wrong; the stack trace below them does not.
      const detail = failed.flatMap((a) => [a.title, ...lines(a.failureMessages.join('\n')).filter((l) => !/^\s+at /.test(l) && !/^\s*[-+] /.test(l)).slice(0, 6).map((l) => `  ${l.trim()}`)]);
      if (file.status === 'failed' && failed.length === 0 && file.message) detail.push(...lines(file.message).slice(0, 6));
      return { check: basename(file.name).replace(/\.test\.ts$/, ''), passed: file.status === 'passed', detail };
    })
    .sort((a, b) => a.check.localeCompare(b.check));
}

const results: Result[] = [];

const typecheck = run('npx', ['tsc', '--noEmit']);
results.push({ check: 'typecheck', passed: typecheck.ok, detail: lines(typecheck.output, /error TS/).slice(0, 8) });

const tests = run('npx', ['vitest', 'run', '--project', 'tests']);
results.push({ check: 'tests', passed: tests.ok, detail: tests.ok ? [] : lines(tests.output, /FAIL|×|AssertionError|Error:/).slice(0, 8) });

const boundaries = run('npx', ['depcruise', 'src', '--config', 'checks/dependency-rules.cjs', '--ignore-known', 'checks/existing-violations.json', '--output-type', 'err']);
results.push({ check: 'module-boundaries', passed: boundaries.ok, detail: boundaries.ok ? [] : lines(boundaries.output, /error|violations/) });

results.push(fromList('dependency-allowlist', checkDependencies()));

const secrets = run('npx', ['secretlint', '--no-gitignore', 'src/**/*', 'test/**/*', 'checks/**/*', 'decisions/**/*', 'rule-cards/**/*', '.github/**/*', '*.json', '*.ts', '*.md']);
results.push({ check: 'no-secrets', passed: secrets.ok, detail: secrets.ok ? [] : lines(secrets.output).slice(0, 8) });

results.push(...checkTests());
results.push(fromList('protected-paths', checkProtectedPaths()));
results.push(fromList('waivers-expire', checkWaivers()));
results.push(fromList('residual-judgement-register', checkRegister()));

for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.check}`);
  for (const d of r.passed ? [] : r.detail) console.log(`      ${d}`);
}
const failed = results.filter((r) => !r.passed);
console.log(failed.length === 0 ? `\nAll ${results.length} checks passed.` : `\n${failed.length} of ${results.length} checks failed: ${failed.map((r) => r.check).join(', ')}`);

const args = process.argv.slice(2);
const jsonPath = args.includes('--json') ? args[args.indexOf('--json') + 1] : undefined;
if (jsonPath) writeFileSync(jsonPath, `${JSON.stringify({ results }, null, 2)}\n`);
process.exitCode = failed.length === 0 ? 0 : 1;
