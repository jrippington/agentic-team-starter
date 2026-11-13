import { defineConfig } from 'vitest/config';

// Two sets of tests. "tests" are the functional tests, which say what the code
// does. "checks" are tests that enforce a rule; `npm run verify` reports each
// file in test/checks/ under its own name, the file name without ".test.ts".
export default defineConfig({
  test: {
    projects: [
      { extends: true, test: { name: 'tests', include: ['test/*.test.ts'] } },
      { extends: true, test: { name: 'checks', include: ['test/checks/*.test.ts'] } },
    ],
  },
});
