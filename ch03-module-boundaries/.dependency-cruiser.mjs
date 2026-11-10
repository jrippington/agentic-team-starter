// The boundary rule for the three modules in src/: quoting, policy and documents.
// Each module publishes one file, its index.ts. Everything else in the module,
// including its internal/ folder, is its own business.
export default {
  forbidden: [
    {
      name: 'no-reach-in',
      comment:
        "A module may import another module only through that module's index.ts, its published interface.",
      severity: 'error',
      from: { path: '^src/([^/]+)/' },
      to: {
        path: '^src/[^/]+/',
        pathNot: ['^src/$1/', '^src/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'no-cycles',
      comment: 'No chain of imports may lead from a file back to itself.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
