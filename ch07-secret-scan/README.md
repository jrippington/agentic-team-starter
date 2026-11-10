# Secret scan

A payment handler that logs, and a secret scan over the code and over the log that the handler's test writes. The rule: no secret in code or logs. The scan is secretlint, with its recommended rules and one pattern rule for the payment provider's credential, which in this exercise is `prov_live_` followed by 24 letters or digits.

## What is here

| File | What it holds |
|---|---|
| `src/capture-payment.ts` | The handler. It asks the provider to take a payment, sends the credential in a request header, and logs the request and its outcome without the credential |
| `src/logger.ts` | A logger that writes each entry to a file as one line of JSON |
| `test/capture-payment.test.ts` | The test. It runs the handler with a stand-in credential and writes the log to `logs/capture-payment.log` |
| `.secretlintrc.json` | The scan's rules |
| `observed/RUNS.md` | The runs this README describes, as recorded |

`npm test` runs the test, then the scan over `src/`, `test/`, and `logs/`. The stand-in credential is plainly fake, and the test puts it together while it runs, so it is never written in the source. The scan is given `--no-gitignore` because secretlint skips files that Git ignores, and the repository ignores `logs/`.

## What you need

Node.js 22 (22.12 or later) and npm.

## Run the check

```sh
npm install
npm test
```

## What you should see

The test passes. The scan runs after it and prints nothing, which means it found nothing:

```text
 ✓ test/capture-payment.test.ts > captures a payment, sending the credential to the provider only 1ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

## Make the bad change

While chasing a problem with the provider, someone logs the whole request.

1. Open `src/capture-payment.ts`.
2. Add this line directly above the first `log.info(` call:

   ```ts
     log.debug('provider request', { request });
   ```

3. Run `npm test`.

## What the check prints

The test still passes. The scan then reports the credential in the log the test wrote, and `npm test` exits with status 1:

```text
<repository>/ch07-secret-scan/logs/capture-payment.log
  1:137  error  [PATTERN] found matching ***************************: **********************************  @secretlint/secretlint-rule-pattern

✖ 1 problem (1 error, 0 warnings, 0 infos)
```

On your machine, the first line shows the full path of the log. The first line of the log is the debugging entry, with the credential inside the `authorization` header:

```text
{"level":"debug","message":"provider request","request":{"url":"https://provider.example/v1/captures","headers":{"authorization":"Bearer prov_live_FAKEFAKEFAKEFAKEFAKEFAKE"},"body":{"paymentReference":"pay_2001","amountPence":41233}}}
```

secretlint masks what it reports. In version 13.1.0 it masks every value in the message, so the name of the pattern ("payment provider credential") is masked along with the credential. The rule's identifier, at the end of the line, says which rule fired.

The scan of `src/` finds nothing, because the source holds no credential, only a line that logs one. A scan of the code alone would have missed this change.

Undo the change with `git restore src/capture-payment.ts`, then run `npm test` again. The test writes a new log, and the scan passes.

## What the check does not catch

- A secret in a form no rule describes: a credential in another format, one split across two log fields or encoded, or a password someone chose.
- A log the tests do not write. The scan sees the logs of the paths the tests run. A debugging line on another path leaks in production and nowhere here.
- Intent. The scan finds strings that look like secrets; it does not know what the code means to do with them. That needs a security review by a named person.
- Where a secret has already gone. A scan does not take back a log line that has been shipped. A credential that reached a real log has to be revoked and replaced.

## In the book

*Architecture for the Agentic Team*, Chapter 7.
