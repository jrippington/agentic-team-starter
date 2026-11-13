# Rule card: Module boundaries

Checks in `npm run verify`: `module-boundaries`.

| Field | |
|---|---|
| What the rule says | No file imports another module's internals: a module is used only through its `index.ts`. Each module may use only the modules `checks/module-map.json` lists for it; a folder under `src/` that is not in the map may import nothing in `src/`; every module may use `src/lib/`, which uses no module. There are no cycles. |
| Why | A module can be changed inside without reading the others only while nothing reaches past its published interface, and while modules depend only on the modules someone decided they may. |
| Who owns it | The architecture owner, who keeps the module map, with a named deputy |
| Its rung | Governed: checked on every change, with its files on the list of protected paths |
| How it is checked | dependency-cruiser runs `checks/dependency-rules.cjs`, which is built from `checks/module-map.json`, over `src/`, ignoring the violations listed in `checks/existing-violations.json`, which may only shrink |
| The bad change that shows the check can fail | `planted/reach-in`: a new module imports the contacts module's internal `tidyName`. `npm run prove` shows the check fail on it |
| What the check cannot see | Whether a boundary is in the right place (the register's entry `module-boundary-placement`); a dependency that does not go through an import, such as two modules reading one table, or code loaded by name while the program runs; the same logic copied instead of imported; a published interface that hands out internals under another name |
| How an exception is granted | A line in `checks/existing-violations.json`, or a waiver in `checks/waivers.json` with its owner and expiry, either added in a change of its own that the rule's owner approves; a line is removed in the change that fixes it |
| Its decision record | [`decisions/0001-modules-and-allowed-dependencies.md`](../decisions/0001-modules-and-allowed-dependencies.md) |
| Its review date | Six months after the project starts; write the date here |
| Where it runs | `npm run verify`, on the developer's machine and in continuous integration on every change |
| The evidence it produces | Each violation, with the rule's name, the importing file and the imported file |
| Its cost | About half a second on the machine named in `observed/RUNS.md` |
