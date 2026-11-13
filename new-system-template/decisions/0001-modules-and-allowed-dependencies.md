# 0001. Modules, their published interfaces and the module map

Status: accepted, 13 November 2026.

## Context

The application is divided into modules so that each part can be changed without reading the others. That holds only while no module reaches past another's published interface, and while the dependencies between modules are the ones someone decided on. A reviewer reading a diff cannot reliably see either once a project has more than a few files, so both are checked on every change.

## Decision

Each module is a folder under `src/`. Its `index.ts` is its published interface, the only file another module may import; everything else in the folder, including its `internal/` folder, belongs to the module. `checks/module-map.json` lists every module and the modules each may use. Shared code goes in `src/lib/`, which every module may use and which uses no module. There are no cycles. dependency-cruiser checks all of this on every change, as the `module-boundaries` check in `npm run verify` ([rule card](../rule-cards/module-boundaries.md)). A violation present when the rule is switched on goes on `checks/existing-violations.json`, which may only shrink.

## Consequences

A new module may depend on nothing until a line in the module map says so, and adding that line is a rule change, made and reviewed on its own. What the decision misses: whether a boundary is in the right place, which is reviewed as the residual judgement register says; and dependencies that do not go through an import, such as two modules reading one table.
