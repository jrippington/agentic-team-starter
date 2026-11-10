# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | Vitest 5.1.0 (with Vite 8.3.7), secretlint 13.1.0 with `@secretlint/secretlint-rule-preset-recommend` 13.1.0 and `@secretlint/secretlint-rule-pattern` 13.1.0, and TypeScript 6.0.3 |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm test`
- Change: None.
- Exit status: 0

```text

> ch07-secret-scan@1.0.0 test
> vitest run --reporter=verbose && secretlint --no-gitignore "src/**/*" "test/**/*" "logs/**/*"


 RUN  v5.1.0 <repository>/ch07-secret-scan

 ✓ test/capture-payment.test.ts > captures a payment, sending the credential to the provider only 1ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  18:38:33
   Duration  97ms (import 42%, transform 27%, tests 16%, worker 15%)
```

## Run 2: after the bad change

- Command: `npm test`
- Change: In `src/capture-payment.ts`, the line `log.debug('provider request', { request });` added before the first `log.info` call.
- Exit status: 1

```text

> ch07-secret-scan@1.0.0 test
> vitest run --reporter=verbose && secretlint --no-gitignore "src/**/*" "test/**/*" "logs/**/*"


 RUN  v5.1.0 <repository>/ch07-secret-scan

 ✓ test/capture-payment.test.ts > captures a payment, sending the credential to the provider only 1ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  18:38:34
   Duration  81ms (import 37%, tests 26%, transform 24%, worker 13%)


<repository>/ch07-secret-scan/logs/capture-payment.log
  1:137  error  [PATTERN] found matching ***************************: **********************************  @secretlint/secretlint-rule-pattern

✖ 1 problem (1 error, 0 warnings, 0 infos)
```

## Run 3: after the undo

- Command: `npm test`
- Change: None.
- Exit status: 0

```text

> ch07-secret-scan@1.0.0 test
> vitest run --reporter=verbose && secretlint --no-gitignore "src/**/*" "test/**/*" "logs/**/*"


 RUN  v5.1.0 <repository>/ch07-secret-scan

 ✓ test/capture-payment.test.ts > captures a payment, sending the credential to the provider only 1ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  18:38:34
   Duration  81ms (import 41%, transform 26%, tests 20%, worker 12%)
```
