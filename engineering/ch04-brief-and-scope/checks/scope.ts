// The scope check. It reads the "Scope and out-of-bounds" section of a task
// brief, where each path is written in backticks, and the files a change
// touches, from the change's patch. Then it says, for each file, whether it is
// inside the brief's scope. A path ending in "/" covers everything under it.
//
// Usage: tsx checks/scope.ts [patch] [brief]   (defaults: change.patch, brief.md)
import { readFileSync } from 'node:fs';

const patchFile = process.argv[2] ?? 'change.patch';
const briefFile = process.argv[3] ?? 'brief.md';

// The paths listed under "In scope:" and "Out of bounds:" in the brief's scope section.
function readScope(brief: string): { inScope: string[]; outOfBounds: string[] } {
  const section = brief.split(/^## /m).find((part) => part.startsWith('Scope and out-of-bounds')) ?? '';
  const inScope: string[] = [];
  const outOfBounds: string[] = [];
  let list: string[] | undefined;
  for (const line of section.split('\n')) {
    if (/^In scope:/i.test(line)) list = inScope;
    else if (/^Out of bounds:/i.test(line)) list = outOfBounds;
    else if (line.startsWith('- ') && list) {
      const path = /`([^`]+)`/.exec(line)?.[1];
      if (path) list.push(path);
    } else if (line.trim() !== '') list = undefined;
  }
  return { inScope, outOfBounds };
}

// Every file the patch touches, from its "diff --git a/<old> b/<new>" lines; a rename counts both names.
function filesIn(patch: string): string[] {
  const files = new Set<string>();
  for (const match of patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm)) {
    files.add(match[1]!);
    files.add(match[2]!);
  }
  return [...files];
}

const covers = (entry: string, file: string) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry);

const { inScope, outOfBounds } = readScope(readFileSync(briefFile, 'utf8'));
const files = filesIn(readFileSync(patchFile, 'utf8'));

console.log(`Scope check: ${patchFile} against ${briefFile}\n`);
if (inScope.length === 0) {
  console.log(`Failed: ${briefFile} names no paths in scope, so nothing can be checked against it.`);
  process.exit(1);
}
if (files.length === 0) {
  console.log(`Failed: ${patchFile} changes no files.`);
  process.exit(1);
}

let outside = 0;
for (const file of files) {
  const barred = outOfBounds.find((entry) => covers(entry, file));
  if (barred) {
    outside++;
    console.log(`  OUTSIDE   ${file}: out of bounds (${barred})`);
  } else if (inScope.some((entry) => covers(entry, file))) {
    console.log(`  in scope  ${file}`);
  } else {
    outside++;
    console.log(`  OUTSIDE   ${file}: not in scope`);
  }
}

if (outside === 0) {
  console.log(`\nPassed: ${files.length} files changed, every one inside the brief's scope.`);
} else {
  const one = outside === 1;
  console.log(`\nFailed: ${outside} of ${files.length} files ${one ? 'is' : 'are'} outside the brief's scope. Take ${one ? 'it' : 'them'} out of`);
  console.log(`the change, or ask the brief's owner to widen the scope, as a decision of its own.`);
  process.exit(1);
}
