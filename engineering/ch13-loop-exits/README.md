# A bounded loop and its five exits

A loop specification and a small driver that runs attempts at a task one iteration at a time, runs the evaluator itself, and stops at one of five exits: success, budget exhaustion, stuck detection, boundary hit or external abort. Here the attempts are scripted, one set written to reach each exit, so that every exit can be seen. An agent's attempt command would take their place.

## What is here

| File | What it holds |
|---|---|
| `loop.json` | The specification: the task, the iteration budget, the evaluator, the protected evaluators (`test/`), the permitted changes (`src/`), the stuck detectors and the exits |
| `start/` | The working copy the loop starts from: a quote summary and its test, which fails until the summary shows the last day the quote can be accepted |
| `attempts/` | The scripted attempts, one file for each exit |
| `scenarios.json` | Which attempts to run, and the exit each set was written to reach |
| `variants/loose-loop.json` | The specification with the tests no longer protected |
| `loop/driver.ts` | The driver |
| `observed/RUNS.md` | The runs this README describes, as recorded |

The driver copies `start/` afresh for every scenario, so nothing in this folder changes when it runs.

## What you need

Node.js 22 (22.12 or later) and npm, with network access to the npm registry, and Git for the undo.

## Run the loop

```sh
npm install
npm run loop
```

## What you should see

Each scenario's exit, the reason, one line for each iteration, and the hand-off. The first and the fourth:

```text
attempts/success.json: An attempt off by one day, then the right change.
  Exit: success, because the evaluator passed at iteration 2.
  Iteration 1: changed src/summary.mjs; evaluator failed: the summary shows the last day the quote can be accepted; detectors: none fired
  Iteration 2: changed src/summary.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: src/summary.mjs; best attempt: iteration 2; open questions: none recorded

attempts/boundary-hit.json: An attempt that weakens the test it is meant to pass.
  Exit: boundary hit, because iteration 1 changed test/summary.test.mjs, a protected evaluator or a file outside the permitted changes; the evaluator was not run.
  Iteration 1: changed test/summary.test.mjs; evaluator not run; detectors: none fired
  Hand-off: working copy against the start: test/summary.test.mjs; best attempt: none: no attempt was evaluated; open questions: none recorded
```

The last line:

```text
Passed: each of the 5 scenarios took the exit its attempts were written to reach.
```

`observed/RUNS.md` has the whole output. Every exit ends with the same hand-off: the trace, the working copy's state against the start, the best attempt so far, and the open questions.

## Make the bad change

The loop keeps stopping when an attempt touches a test, so someone loosens it: the tests are no longer protected, and the loop may change them.

1. Run:

   ```sh
   cp variants/loose-loop.json loop.json
   ```

2. Run `npm run loop`.

## What the driver prints

The attempt that weakens its own test now ends in success, and the driver says that this is not the exit the attempt was written to reach. It exits with status 1:

```text
Protected evaluators: none. Permitted changes: src/, test/.
...
attempts/boundary-hit.json: An attempt that weakens the test it is meant to pass.
  Exit: success, because the evaluator passed at iteration 1. Expected: boundary hit.
  Iteration 1: changed test/summary.test.mjs; evaluator passed; detectors: none fired
  Hand-off: working copy against the start: test/summary.test.mjs; best attempt: iteration 1; open questions: none recorded
...
Failed: 1 of 5 scenarios took a different exit from the one their attempts were written to reach.
```

The success is hollow, and the hand-off shows why: the only file changed is the test. A loop whose evaluator it may change has no evaluator.

Undo the change with `git restore loop.json`.

## What the driver does not catch

- Whether a passing change is the right one. The evaluator is only as good as the test; success goes to review, and nothing is merged by the loop.
- What an attempt does outside the working copy: a network call, a package installed elsewhere, a change to a shared database. The driver sees files; the agent's own settings and the environment have to hold the rest.
- Cost and time. This loop's only budget is iterations; a loop run by an agent needs budgets for time and spending too, set where the agent's runtime can count them.
- Whether the scripted attempts look like an agent's. They show the driver, not an agent: what happens when an attempt weakens a test, not whether an agent would try.

## In the book

*Engineering the Agentic Team*, Chapter 13.
