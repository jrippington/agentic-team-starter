# Observed runs

The runs described in this example's README, as they were recorded.

| | |
|---|---|
| Date | 11 November 2026 |
| Operating system | Darwin 27.0.0 (from `uname -sr`) |
| Node.js | v22.23.1, with npm 10.9.8 |
| Tools | The benchmark in `measure/benchmark.ts`, run by tsx 4.23.15 with TypeScript 6.0.3; Git 2.54.0 for the undo |

Each run names the change made to the example, as it is in the repository, before the command ran. The output is copied exactly; colour was turned off with `NO_COLOR=1`. The runs were made one after another in a fresh copy of the example, installed with `npm ci`.

## Run 1: the starting state

- Command: `npm run measure`
- Change: None.
- Exit status: 0

```text

> ch08-retrieval-benchmark@1.0.0 measure
> tsx measure/benchmark.ts

Retrieval benchmark: 8 questions, lexical search over 9 files in codebase/,
a hit when a verified source is among the first 3 results

ID   Type                        Without glossary              With glossary
Q01  Where is X defined          miss: at 5                    hit at 3
Q02  Where is X defined          hit at 3                      hit at 3
Q03  Where is X defined          hit at 1                      hit at 1
Q04  What calls or uses Y        hit at 1                      hit at 1
Q05  What calls or uses Y        hit at 1                      hit at 1
Q06  How do we do Z              hit at 1                      hit at 1
Q07  Why was W decided           hit at 1                      hit at 1
Q08  What changed recently in V  miss: its source is history   miss: its source is history

By type                          Without glossary              With glossary
Where is X defined               2 of 3                        3 of 3
What calls or uses Y             2 of 2                        2 of 2
How do we do Z                   1 of 1                        1 of 1
Why was W decided                1 of 1                        1 of 1
What changed recently in V       0 of 1                        0 of 1
All questions                    6 of 8                        7 of 8
```

## Run 2: the bad change

- Command: `cp variants/glossary-without-expiry.json glossary.json`
- Change: None. The command makes the change: `glossary.json` no longer has its one entry.
- Exit status: 0

The command printed nothing.

## Run 3: after the bad change

- Command: `npm run measure`
- Change: As run 2.
- Exit status: 0

```text

> ch08-retrieval-benchmark@1.0.0 measure
> tsx measure/benchmark.ts

Retrieval benchmark: 8 questions, lexical search over 9 files in codebase/,
a hit when a verified source is among the first 3 results

ID   Type                        Without glossary              With glossary
Q01  Where is X defined          miss: at 5                    miss: at 5
Q02  Where is X defined          hit at 3                      hit at 3
Q03  Where is X defined          hit at 1                      hit at 1
Q04  What calls or uses Y        hit at 1                      hit at 1
Q05  What calls or uses Y        hit at 1                      hit at 1
Q06  How do we do Z              hit at 1                      hit at 1
Q07  Why was W decided           hit at 1                      hit at 1
Q08  What changed recently in V  miss: its source is history   miss: its source is history

By type                          Without glossary              With glossary
Where is X defined               2 of 3                        2 of 3
What calls or uses Y             2 of 2                        2 of 2
How do we do Z                   1 of 1                        1 of 1
Why was W decided                1 of 1                        1 of 1
What changed recently in V       0 of 1                        0 of 1
All questions                    6 of 8                        6 of 8
```

## Run 4: undo the change

- Command: `git restore glossary.json`
- Change: As run 3. The command puts `glossary.json` back as it is in the repository.
- Exit status: 0

The command printed nothing.

## Run 5: after the undo

- Command: `npm run measure`
- Change: None.
- Exit status: 0

```text

> ch08-retrieval-benchmark@1.0.0 measure
> tsx measure/benchmark.ts

Retrieval benchmark: 8 questions, lexical search over 9 files in codebase/,
a hit when a verified source is among the first 3 results

ID   Type                        Without glossary              With glossary
Q01  Where is X defined          miss: at 5                    hit at 3
Q02  Where is X defined          hit at 3                      hit at 3
Q03  Where is X defined          hit at 1                      hit at 1
Q04  What calls or uses Y        hit at 1                      hit at 1
Q05  What calls or uses Y        hit at 1                      hit at 1
Q06  How do we do Z              hit at 1                      hit at 1
Q07  Why was W decided           hit at 1                      hit at 1
Q08  What changed recently in V  miss: its source is history   miss: its source is history

By type                          Without glossary              With glossary
Where is X defined               2 of 3                        3 of 3
What calls or uses Y             2 of 2                        2 of 2
How do we do Z                   1 of 1                        1 of 1
Why was W decided                1 of 1                        1 of 1
What changed recently in V       0 of 1                        0 of 1
All questions                    6 of 8                        7 of 8
```
