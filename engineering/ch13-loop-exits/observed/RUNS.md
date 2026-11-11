# Observed runs

The runs described in this example's README, as they were recorded.

| | |
|---|---|
| Date | 11 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | The loop driver in `loop/driver.ts`, run by tsx 4.23.15 with TypeScript 6.0.3, which runs the evaluator with Node.js's own test runner; Git 2.54.0 for the undo |

Each run names the change made to the example, as it is in the repository, before the command ran. The output is copied exactly; colour was turned off with `NO_COLOR=1`. The runs were made one after another in a fresh copy of the example, installed with `npm ci`.

## Run 1: the starting state

- Command: `npm run loop`
- Change: None.
- Exit status: 0

```text

> ch13-loop-exits@1.0.0 loop
> tsx loop/driver.ts

Loop: Make the quote summary show the last day the quote can be accepted, 30 days after it was created, so that every test in test/summary.test.mjs passes. Change only src/.
Protected evaluators: test/. Permitted changes: src/.

attempts/success.json: An attempt off by one day, then the right change.
  Exit: success, because the evaluator passed at iteration 2.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 2; open questions: none recorded

attempts/budget-exhaustion.json: Two different wrong attempts, under a budget of two iterations. (iteration budget lowered to 2)
  Exit: budget exhaustion, because the budget of 2 iterations was spent without the evaluator passing.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

attempts/stuck-detection.json: The same wrong attempt twice.
  Exit: stuck detection, because repetition: iteration 2 left exactly the change iteration 1 left; the evaluator was not run.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: repetition
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: The test expects 2026-04-01; is the last day counted from the day after the quote was created?

attempts/boundary-hit.json: An attempt that weakens the test it is meant to pass.
  Exit: boundary hit, because iteration 1 changed test/summary.test.mjs, a protected evaluator or a file outside the permitted changes; the evaluator was not run.
  Iteration 1: changed test/summary.test.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: test/summary.test.mjs; best attempt: none: no attempt was evaluated; open questions: none recorded

attempts/external-abort.json: A wrong attempt; during the second, a person creates STOP.
  Exit: external abort, because STOP appeared during iteration 2; the run stopped after the attempt.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

Passed: each of the 5 scenarios took the exit its attempts were written to reach.
```

## Run 2: the bad change

- Command: `cp variants/loose-loop.json loop.json`
- Change: None. The command makes the change: `loop.json` protects no evaluator and permits changes to `test/` as well as `src/`.
- Exit status: 0

The command printed nothing.

## Run 3: after the bad change

- Command: `npm run loop`
- Change: As run 2.
- Exit status: 1

```text

> ch13-loop-exits@1.0.0 loop
> tsx loop/driver.ts

Loop: Make the quote summary show the last day the quote can be accepted, 30 days after it was created, so that every test in test/summary.test.mjs passes. Change only src/.
Protected evaluators: none. Permitted changes: src/, test/.

attempts/success.json: An attempt off by one day, then the right change.
  Exit: success, because the evaluator passed at iteration 2.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 2; open questions: none recorded

attempts/budget-exhaustion.json: Two different wrong attempts, under a budget of two iterations. (iteration budget lowered to 2)
  Exit: budget exhaustion, because the budget of 2 iterations was spent without the evaluator passing.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

attempts/stuck-detection.json: The same wrong attempt twice.
  Exit: stuck detection, because repetition: iteration 2 left exactly the change iteration 1 left; the evaluator was not run.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: repetition
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: The test expects 2026-04-01; is the last day counted from the day after the quote was created?

attempts/boundary-hit.json: An attempt that weakens the test it is meant to pass.
  Exit: success, because the evaluator passed at iteration 1. Expected: boundary hit.
  Iteration 1: changed test/summary.test.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: test/summary.test.mjs; best attempt: iteration 1; open questions: none recorded

attempts/external-abort.json: A wrong attempt; during the second, a person creates STOP.
  Exit: external abort, because STOP appeared during iteration 2; the run stopped after the attempt.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

Failed: 1 of 5 scenarios took a different exit from the one their attempts were written to reach.
```

## Run 4: undo the change

- Command: `git restore loop.json`
- Change: As run 3. The command puts `loop.json` back as it is in the repository.
- Exit status: 0

The command printed nothing.

## Run 5: after the undo

- Command: `npm run loop`
- Change: None.
- Exit status: 0

```text

> ch13-loop-exits@1.0.0 loop
> tsx loop/driver.ts

Loop: Make the quote summary show the last day the quote can be accepted, 30 days after it was created, so that every test in test/summary.test.mjs passes. Change only src/.
Protected evaluators: test/. Permitted changes: src/.

attempts/success.json: An attempt off by one day, then the right change.
  Exit: success, because the evaluator passed at iteration 2.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 2; open questions: none recorded

attempts/budget-exhaustion.json: Two different wrong attempts, under a budget of two iterations. (iteration budget lowered to 2)
  Exit: budget exhaustion, because the budget of 2 iterations was spent without the evaluator passing.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

attempts/stuck-detection.json: The same wrong attempt twice.
  Exit: stuck detection, because repetition: iteration 2 left exactly the change iteration 1 left; the evaluator was not run.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: repetition
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: The test expects 2026-04-01; is the last day counted from the day after the quote was created?

attempts/boundary-hit.json: An attempt that weakens the test it is meant to pass.
  Exit: boundary hit, because iteration 1 changed test/summary.test.mjs, a protected evaluator or a file outside the permitted changes; the evaluator was not run.
  Iteration 1: changed test/summary.test.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: test/summary.test.mjs; best attempt: none: no attempt was evaluated; open questions: none recorded

attempts/external-abort.json: A wrong attempt; during the second, a person creates STOP.
  Exit: external abort, because STOP appeared during iteration 2; the run stopped after the attempt.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 1; open questions: none recorded

Passed: each of the 5 scenarios took the exit its attempts were written to reach.
```
