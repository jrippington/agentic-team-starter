// The loop driver. It runs attempts against a fresh copy of start/, one
// iteration at a time, and after each one decides, in this order, whether the
// loop must stop: a person has created STOP; a protected evaluator or a file
// outside the permitted changes has changed; an attempt repeats an earlier
// change; the evaluator passes; two iterations fail the same way; the
// iteration budget is spent. The driver, not the attempt, runs the evaluator.
//
// Here the attempts are scripted, so that every exit can be shown. An agent's
// attempt command would take their place.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';

interface Spec {
  readonly task: string;
  readonly budgets: { readonly iterations: { readonly value: number } };
  readonly evaluator: { readonly command: readonly string[] };
  readonly protectedEvaluators: readonly string[];
  readonly permittedChanges: readonly string[];
}
interface Attempt {
  readonly files: Record<string, string>;
  readonly question?: string;
}
interface Scenario {
  readonly attempts: string;
  readonly expected: string;
  readonly iterations?: number;
}

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const spec = readJson('loop.json') as Spec;
const { scenarios } = readJson('scenarios.json') as { scenarios: Scenario[] };

const filesIn = (root: string): Map<string, string> => {
  const out = new Map<string, string>();
  (function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else out.set(relative(root, path), readFileSync(path, 'utf8'));
    }
  })(root);
  return out;
};
const start = filesIn('start');
const covers = (entry: string, file: string) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry);

// The files that differ from the start, and their contents, as one comparable value.
function changes(copy: string): { files: string[]; key: string } {
  const now = filesIn(copy);
  const files = [...new Set([...start.keys(), ...now.keys()])].filter((f) => f !== 'STOP' && start.get(f) !== now.get(f)).sort();
  return { files, key: JSON.stringify(files.map((f) => [f, now.get(f) ?? null])) };
}

interface Row {
  readonly iteration: number;
  readonly files: string[];
  readonly evaluator: string;
  readonly detectors: string;
}

function runLoop(scenario: Scenario): { exit: string; reason: string; rows: Row[]; state: string[]; best: string; questions: string[] } {
  const attempts = (readJson(scenario.attempts) as { iterations: Attempt[] }).iterations;
  const budget = scenario.iterations ?? spec.budgets.iterations.value;
  const copy = mkdtempSync(join(tmpdir(), 'loop-'));
  cpSync('start', copy, { recursive: true });
  const rows: Row[] = [];
  const questions: string[] = [];
  const seen = new Map<string, number>();
  let lastFailure: string | undefined;
  let best: { iteration: number; failing: number } | undefined;
  const finish = (exit: string, reason: string) => {
    const state = changes(copy).files;
    rmSync(copy, { recursive: true, force: true });
    const bestText = best ? `iteration ${best.iteration}` : 'none: no attempt was evaluated';
    return { exit, reason, rows, state, best: bestText, questions };
  };
  try {
    for (let i = 1; i <= budget; i++) {
      const attempt = attempts[i - 1];
      if (!attempt) return finish('budget exhaustion', `the attempts ran out at iteration ${i}`);
      for (const [file, content] of Object.entries(attempt.files)) {
        mkdirSync(dirname(join(copy, file)), { recursive: true });
        writeFileSync(join(copy, file), content);
      }
      if (attempt.question) questions.push(attempt.question);
      const { files, key } = changes(copy);
      const row = (evaluator: string, detectors = 'none fired') => rows.push({ iteration: i, files, evaluator, detectors });
      if (existsSync(join(copy, 'STOP'))) {
        row('not run');
        return finish('external abort', `STOP appeared during iteration ${i}; the run stopped after the attempt`);
      }
      const crossing = files.filter((f) => spec.protectedEvaluators.some((p) => covers(p, f)) || !spec.permittedChanges.some((p) => covers(p, f)));
      if (crossing.length) {
        row('not run');
        return finish('boundary hit', `iteration ${i} changed ${crossing.join(', ')}, a protected evaluator or a file outside the permitted changes; the evaluator was not run`);
      }
      const earlier = seen.get(key);
      if (earlier !== undefined) {
        row('not run', 'repetition');
        return finish('stuck detection', `repetition: iteration ${i} left exactly the change iteration ${earlier} left; the evaluator was not run`);
      }
      seen.set(key, i);
      const [command, ...args] = spec.evaluator.command;
      const result = spawnSync(command!, args, { cwd: copy, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
      const failing = [...(result.stdout ?? '').matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]!);
      if (best === undefined || failing.length < best.failing) best = { iteration: i, failing: failing.length };
      if (result.status === 0) {
        row('passed');
        return finish('success', `the evaluator passed at iteration ${i}`);
      }
      const failure = (result.stdout ?? '').replace(/duration_ms: [\d.]+/g, '');
      const sameAsLast = failure === lastFailure;
      row(`failed: ${failing.join('; ')}`, sameAsLast ? 'no improvement' : 'none fired');
      if (sameAsLast) return finish('stuck detection', `no improvement: iterations ${i - 1} and ${i} ended with the same failing tests and messages`);
      lastFailure = failure;
    }
    return finish('budget exhaustion', `the budget of ${budget} iterations was spent without the evaluator passing`);
  } catch (error) {
    rmSync(copy, { recursive: true, force: true });
    throw error;
  }
}

console.log(`Loop: ${spec.task}`);
console.log(`Protected evaluators: ${spec.protectedEvaluators.join(', ') || 'none'}. Permitted changes: ${spec.permittedChanges.join(', ')}.\n`);
let unexpected = 0;
for (const scenario of scenarios) {
  const note = (readJson(scenario.attempts) as { note: string }).note;
  const outcome = runLoop(scenario);
  const asExpected = outcome.exit === scenario.expected;
  if (!asExpected) unexpected++;
  console.log(`${scenario.attempts}: ${note}${scenario.iterations ? ` (iteration budget lowered to ${scenario.iterations})` : ''}`);
  console.log(`  Exit: ${outcome.exit}, because ${outcome.reason}.${asExpected ? '' : ` Expected: ${scenario.expected}.`}`);
  for (const r of outcome.rows) console.log(`  Iteration ${r.iteration}: changed ${r.files.join(', ') || 'nothing'}; evaluator ${r.evaluator}; detectors: ${r.detectors}`);
  console.log(`  Hand-off: working copy against the start: ${outcome.state.join(', ') || 'no change'}; best attempt: ${outcome.best}; open questions: ${outcome.questions.join(' ') || 'none recorded'}\n`);
}
if (unexpected === 0) {
  console.log(`Passed: each of the ${scenarios.length} scenarios took the exit its attempts were written to reach.`);
} else {
  console.log(`Failed: ${unexpected} of ${scenarios.length} scenarios took a different exit from the one their attempts were written to reach.`);
  process.exit(1);
}
