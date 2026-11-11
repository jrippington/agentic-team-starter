# A retrieval benchmark

A small question set, each question with its verified source, put to lexical search over a small codebase, and scored by type of question, with and without a glossary entry. Lexical search finds text by matching terms, as `grep` does; this one weights a term by how few files it appears in, as search engines do. It cannot match a word that neither the question nor the code uses.

## What is here

| File | What it holds |
|---|---|
| `codebase/` | A small quoting system. The business says a quote expires; the code says it goes stale |
| `questions.json` | Eight questions in five types, worded as someone would ask them, and how many results a person would inspect (3), fixed before any run |
| `answers.json` | The verified source for each question, kept apart from the questions so that nobody tuning a search can change what counts as the right answer |
| `glossary.json` | One entry, mapping the business's "expiry" to the code's "stale" and "fresh" |
| `variants/glossary-without-expiry.json` | The glossary with that entry removed |
| `measure/benchmark.ts` | The benchmark |
| `observed/RUNS.md` | The runs this README describes, as recorded |

## What you need

Node.js 22 (22.12 or later) and npm, with network access to the npm registry, and Git for the undo.

## Run the benchmark

```sh
npm install
npm run measure
```

## What you should see

```text
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

Read it by type, not by the total. Q01, "Where is a quote's expiry worked out?", misses as worded: no file says "expiry", and the files that say "quote" most often are not the one that decides. With the glossary's code terms added, the file that decides, `src/quoting/freshness.ts`, comes third, behind two that use it. Q08 misses either way, and should: what changed recently is answered by the repository's history, which a search of the files cannot reach. The benchmark keeps the question so that the gap stays visible.

## Make the bad change

Someone tidies the glossary and removes the entry, since no file in the code says "expiry".

1. Run:

   ```sh
   cp variants/glossary-without-expiry.json glossary.json
   ```

2. Run `npm run measure`.

## What the benchmark prints

Q01 misses in both columns again, and the totals fall back:

```text
Q01  Where is X defined          miss: at 5                    miss: at 5
...
Where is X defined               2 of 3                        2 of 3
...
All questions                    6 of 8                        6 of 8
```

The benchmark is a measurement, so it exits with status 0 either way. What shows the regression is the comparison with the earlier run, which is why each run is worth keeping.

Undo the change with `git restore glossary.json`.

## What the benchmark does not catch

- Whether the file found answers the question. A hit means the verified source was among the first three results; a person still has to read it, and an answer generated from it can still miss the question.
- Questions about what calls what, beyond names. Q04 and Q05 succeed because the names appear in the callers; a use through a string or a template would not be found.
- Anything outside the eight questions. Eight questions show the method, not the quality of a search over your code; build your own set from questions your team actually needed answered.
- A glossary that has gone stale. When the code's words change, the entry stops helping, and only running the benchmark again shows it.

## In the book

*Engineering the Agentic Team*, Chapter 8.
