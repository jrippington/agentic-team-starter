# Dependency allowlist

A small package, with an allowlist of the packages it may install and the reason for each. A short program checks every package named in `package.json`, and every package in `package-lock.json`, against the list. The rule: only allowlisted dependencies.

## What is here

| File | What it holds |
|---|---|
| `src/renewal-date.ts` | The package's code. It formats the renewal date on a policy notice with Node's built-in `Intl.DateTimeFormat` |
| `allowlist.json` | The allowlist. Each entry names a package, or a whole scope when it ends in `/*`, and gives the reason it is allowed |
| `checks/dependency-policy.ts` | The check |
| `observed/RUNS.md` | The runs this README describes, as recorded |

The lockfile lists 32 packages, more than npm installs on any one machine. esbuild, which tsx uses, publishes its program as a separate package for each platform; the lockfile lists them all, and npm installs only the one for yours. The single entry `@esbuild/*` allows them.

## What you need

Node.js 22 (22.12 or later) and npm, with network access to the npm registry.

## Run the check

```sh
npm install
npm run check
```

## What you should see

```text
Dependency policy: 32 packages in package-lock.json checked against allowlist.json

Passed: every package is on the allowlist, and every entry gives its reason.
```

## Make the bad change

A date-formatting package would be convenient, so someone adds one.

1. Run:

   ```sh
   npm install --save-exact date-fns@4.4.0
   ```

   npm adds `date-fns` to `package.json` and to `package-lock.json`.

2. Run `npm run check`.

## What the check prints

The check names the package and its version, and exits with status 1:

```text
Dependency policy: 33 packages in package-lock.json checked against allowlist.json
  date-fns 4.4.0, named in package.json, is not on the allowlist

Failed: One problem. Remove the package, or add it to allowlist.json with the reason
it is needed, so that the addition is reviewed as a change of its own.
```

`date-fns` brings in no packages of its own. A package that did would have each of those named too, with the package that requires it.

Undo the change with `npm uninstall date-fns`. That puts `package.json` and `package-lock.json` back exactly as they were, and the check passes again.

## What the check does not catch

- Whether an allowed package is safe. The allowlist approves names, not what a new version of an approved package does. The lockfile pins each version and its integrity hash, which is one reason a change to the lockfile deserves review.
- Code that arrives without a package: copied into the source, fetched by a script, or run with `npx` without being installed.
- Whether a reason is a good one. The check requires a reason; only a reviewer can judge it. A dependency policy is not a security review.
- A change to the allowlist itself. Adding a package and its allowlist entry in one change passes the check, so that is the change a reviewer should look for.

## In the book

*Architecture for the Agentic Team*, Chapter 7.
