// The module-boundaries rule, for dependency-cruiser, built from
// checks/module-map.json. A module's published interface is its index.ts;
// nothing else in a module may be imported by another module. Each module may
// use only the modules the map lists for it. Every module may use src/lib,
// which uses no module. There are no cycles. Violations present when the rule
// was switched on are listed in checks/existing-violations.json, which may
// only shrink.
const { modules } = require('./module-map.json');

const names = Object.keys(modules);
// Any folder directly under src/ other than src/lib, captured so that a rule can refer to it.
const anyModule = '(?!lib/)([^/]+)';

const allowedDependencies = names.map((name) => {
  const mayUse = modules[name].mayUse;
  const allowed = ['lib', name, ...mayUse].map((m) => `${m}/`).join('|');
  return {
    name: `${name}-uses-only-listed-modules`,
    comment: `${name} may use ${mayUse.length === 0 ? 'no other module' : `only ${mayUse.join(', ')}`}, as checks/module-map.json says.`,
    severity: 'error',
    from: { path: `^src/${name}/` },
    to: { path: `^src/(?!(?:${allowed}))[^/]+/` },
  };
});

module.exports = {
  forbidden: [
    {
      name: 'published-interface-only',
      comment: "A module may import another module only through that module's index.ts.",
      severity: 'error',
      from: { path: `^src/${anyModule}/` },
      to: { path: `^src/${anyModule}/(?!index\\.ts$)`, pathNot: '^src/$1/' },
    },
    {
      name: 'module-in-map',
      comment: 'Every module is listed in checks/module-map.json with the modules it may use.',
      severity: 'error',
      from: { path: `^src/(?!(?:${['lib', ...names].map((m) => `${m}/`).join('|')}))[^/]+/` },
      to: { path: '^src/' },
    },
    ...allowedDependencies,
    {
      name: 'lib-uses-no-module',
      comment: 'Shared code in src/lib uses no module.',
      severity: 'error',
      from: { path: '^src/lib/' },
      to: { path: `^src/${anyModule}/` },
    },
    {
      name: 'no-cycles',
      comment: 'Two modules that depend on each other are, in practice, one module.',
      severity: 'error',
      from: { path: '^src/' },
      to: { circular: true },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    doNotFollow: { path: 'node_modules' },
  },
};
