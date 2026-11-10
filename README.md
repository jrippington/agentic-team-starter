# Agentic team starter

Small, separate exercises that accompany *Architecture for the Agentic Team*. Each exercise shows one architectural rule and the check that holds it. You run the check and see it pass, make the change the rule forbids, and read what the check prints. Then you read what the check cannot see, because every check has a blind spot, and each README names it.

The exercises are written in TypeScript and run on Node.js. The code borrows its names from a small insurance system with four modules: Quoting, Policy, Payments, and Documents. None of the exercises needs a database server: the two that use PostgreSQL run PGlite, a build of PostgreSQL that runs inside Node.

## What you need

- Node.js 22, version 22.12 or later, and the npm that comes with it.
- Git, to get the repository and to put an exercise back after you have changed it.
- Network access to the npm registry, for `npm install`.

## Run an exercise

Each exercise is a folder with its own `package.json`. Install and run it from inside that folder. For example:

```sh
cd ch05-replay
npm install
npm test
```

The command differs from one exercise to another. Each folder's `README.md` gives it, says what you should see, gives the change to make as exact steps, and shows what the check prints after the change. Every exercise starts in a passing state.

Each README also says how to undo its change. For a file you edited, `git restore <file>` in the exercise folder puts it back as it was.

## The exercises

| Folder | Chapter | What it shows | Command |
|---|---|---|---|
| `ch01-required-event-fields` | 1 | A test that every event a payment handler emits carries the fields listed for its type | `npm test` |
| `ch03-module-boundaries` | 3 | A rule that a module uses another only through its published interface, with no cycles | `npm run check` |
| `ch04-invariant-and-duplication` | 4 | A property-based test of the premium invariant, and a check that finds a copied rounding rule | `npm test`, then `npm run check` |
| `ch05-replay` | 5 | A replay test: the same payment notification, delivered twice, is applied once | `npm test` |
| `ch06-interface-diff` | 6 | An interface diff that accepts an added field and refuses a renamed one, and a rename done by expand and contract | `npm run check` |
| `ch07-dependency-allowlist` | 7 | A policy that every installed package is on an allowlist, each entry with its reason | `npm run check` |
| `ch07-secret-scan` | 7 | A secret scan over the code and over the log a test writes | `npm test` |
| `ch08-one-implementation` | 8 | An interface with one implementation and a factory with one product, which the tests cannot tell you to keep or remove | `npm test` |
| `ch10-mock-and-mutation` | 10 | Tests that only check a mock was called, over a planted bug, and the test against real data that finds it | `npm test` |

## Each exercise stands alone

No exercise uses another's code or builds on another's result, so you can start with any of them. Each folder has its own dependencies, pinned to exact versions in its `package.json` and `package-lock.json`, and a folder copied somewhere else still runs.

## Recorded runs

Each exercise keeps the runs its README describes in `observed/RUNS.md`: the command, the tools and their versions, Node.js, the operating system, the date, and the output. Your timings will differ, and so will anything random, such as a property-based test's seed. If your output differs in some other way, the recorded run shows what was seen, and under which versions.

The workflow in `.github/workflows/exercises.yml` installs and runs every exercise on each push to `main`, so the starting state of each one is known to pass.

## Licence

MIT. See [LICENSE](LICENSE).
