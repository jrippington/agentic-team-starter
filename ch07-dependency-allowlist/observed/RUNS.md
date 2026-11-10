# Observed runs

The runs described in this exercise's README, as they were recorded.

| | |
|---|---|
| Date | 10 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | The dependency policy in `checks/dependency-policy.ts`, run by tsx 4.23.15 with TypeScript 6.0.3; npm 10.9.8 for the installs |

Each run names the change made to the exercise, as it is in the repository, before the command ran. The output is copied exactly, with two edits: ANSI colour codes are removed, and the absolute path of the repository on the recording machine is shown as `<repository>`. Timings and start times differ from run to run.

## Run 1: the starting state

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch07-dependency-allowlist@1.0.0 check
> tsx checks/dependency-policy.ts

Dependency policy: 32 packages in package-lock.json checked against allowlist.json

Passed: every package is on the allowlist, and every entry gives its reason.
```

## Run 2: the bad change

- Command: `npm install --save-exact date-fns@4.4.0`
- Change: None. The command makes the change: it adds `date-fns` 4.4.0 to `package.json` and `package-lock.json`.
- Exit status: 0

```text

added 1 package, and audited 9 packages in 861ms

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## Run 3: after the bad change

- Command: `npm run check`
- Change: As run 2.
- Exit status: 1

```text

> ch07-dependency-allowlist@1.0.0 check
> tsx checks/dependency-policy.ts

Dependency policy: 33 packages in package-lock.json checked against allowlist.json
  date-fns 4.4.0, named in package.json, is not on the allowlist

Failed: One problem. Remove the package, or add it to allowlist.json with the reason
it is needed, so that the addition is reviewed as a change of its own.
```

## Run 4: undo the change

- Command: `npm uninstall date-fns`
- Change: As run 3. The command removes `date-fns`; afterwards, `package.json` and `package-lock.json` were byte for byte as in the repository.
- Exit status: 0

```text

removed 1 package, and audited 8 packages in 450ms

found 0 vulnerabilities
```

## Run 5: after the undo

- Command: `npm run check`
- Change: None.
- Exit status: 0

```text

> ch07-dependency-allowlist@1.0.0 check
> tsx checks/dependency-policy.ts

Dependency policy: 32 packages in package-lock.json checked against allowlist.json

Passed: every package is on the allowlist, and every entry gives its reason.
```
