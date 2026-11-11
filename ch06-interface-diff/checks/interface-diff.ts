// The interface diff. It compares Quoting's published interface with the
// snapshot taken at the last release. A published interface may grow, so any
// added export or member passes. Any removed or renamed one fails, and so does
// any whose type has changed, because a consumer may still depend on it.
//
//   npm run check      compare the published interface with the snapshot
//   npm run snapshot   record the published interface as the new snapshot
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

const PUBLISHED = 'src/quote-result.ts';
const SNAPSHOT = 'snapshot/quote-result.json';

// Each exported name, and each member of each exported type, with its type as text.
function readPublishedInterface(file: string): Record<string, string> {
  const program = ts.createProgram([file], { strict: true, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${file} has no exports to compare`);

  const entries: Record<string, string> = {};
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    if (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
      entries[symbol.name] = 'type';
      for (const member of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))) {
        const optional = member.flags & ts.SymbolFlags.Optional ? '?' : '';
        entries[`${symbol.name}.${member.name}${optional}`] = checker.typeToString(
          checker.getTypeOfSymbol(member),
        );
      }
    } else {
      entries[symbol.name] = checker.typeToString(checker.getTypeOfSymbol(symbol));
    }
  }
  return Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
}

const current = readPublishedInterface(PUBLISHED);

if (process.argv.includes('--update')) {
  writeFileSync(SNAPSHOT, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`Recorded ${Object.keys(current).length} entries from ${PUBLISHED} in ${SNAPSHOT}.`);
  process.exit(0);
}

const released: Record<string, string> = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const removed = Object.keys(released).filter((name) => !(name in current));
const changed = Object.keys(released).filter((name) => name in current && current[name] !== released[name]);
const added = Object.keys(current).filter((name) => !(name in released));

console.log(`Interface diff: ${PUBLISHED} against ${SNAPSHOT}`);
for (const name of removed) console.log(`  removed  ${name}: ${released[name]}`);
for (const name of changed) console.log(`  changed  ${name}: ${released[name]}, now ${current[name]}`);
for (const name of added) console.log(`  added    ${name}: ${current[name]}`);

if (removed.length > 0 || changed.length > 0) {
  console.log(`\nFailed: ${removed.length} removed and ${changed.length} changed. A consumer may still depend on them.`);
  if (removed.length > 0 && added.length > 0) {
    console.log(
      'A rename is a removal and an addition. Add the new name beside the old one, move each\n' +
        'consumer to the new name, and remove the old one in a later release.',
    );
  }
  process.exitCode = 1;
} else if (added.length > 0) {
  console.log(`\nPassed: ${added.length} added, nothing removed or changed.`);
} else {
  console.log('\nPassed: the published interface matches the snapshot.');
}
