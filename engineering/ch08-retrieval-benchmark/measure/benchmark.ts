// The retrieval benchmark. Each question is put to lexical search over the
// files in codebase/, twice: as it is worded, and with the glossary's code
// terms added for any business term the question uses. A question succeeds
// when one of its verified sources is among the results a person would
// inspect, a number fixed in questions.json before anything is run.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

interface Question {
  readonly id: string;
  readonly type: string;
  readonly question: string;
}
interface GlossaryEntry {
  readonly term: string;
  readonly codeTerms: readonly string[];
}

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const { inspect, questions } = readJson('questions.json') as { inspect: number; questions: Question[] };
const answers = (readJson('answers.json') as { answers: Record<string, { sources: string[] }> }).answers;
const glossary = (readJson('glossary.json') as { entries: GlossaryEntry[] }).entries;

const root = 'codebase';
const files = (function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [relative(root, path)];
  });
})(root).sort();
const texts = new Map(files.map((file) => [file, readFileSync(join(root, file), 'utf8').toLowerCase()]));

// Words a search would not use to tell files apart.
const stopwords = new Set(
  'a an and are can do does for how in is it of on only the this to was we what when where which who why with'.split(' '),
);
const termsOf = (question: string) =>
  question
    .toLowerCase()
    .replace(/'s\b/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));

const withGlossary = (terms: string[]) => [
  ...terms,
  ...glossary.filter((entry) => terms.includes(entry.term)).flatMap((entry) => entry.codeTerms),
];

// Lexical search, weighted as search engines weight terms: a term counts for
// more the fewer files it appears in, and repeats in one file count less and less.
const count = (text: string, term: string) => text.split(term).length - 1;
const weight = (term: string) => Math.log((files.length + 1) / (files.filter((file) => count(texts.get(file)!, term) > 0).length + 1));
function search(terms: string[]): string[] {
  const score = (file: string) =>
    terms.reduce((sum, term) => {
      const n = count(texts.get(file)!, term);
      return n === 0 ? sum : sum + (1 + Math.log(n)) * weight(term);
    }, 0);
  return files
    .map((file) => ({ file, score: score(file) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .map((hit) => hit.file);
}

function judge(id: string, results: string[]): { hit: boolean; text: string } {
  const sources = answers[id]?.sources ?? [];
  const inFiles = sources.filter((source) => files.includes(source));
  if (inFiles.length === 0) return { hit: false, text: 'miss: its source is history' };
  const position = results.findIndex((file) => inFiles.includes(file));
  if (position === -1) return { hit: false, text: results.length ? 'miss: not returned' : 'miss: nothing returned' };
  if (position >= inspect) return { hit: false, text: `miss: at ${position + 1}` };
  return { hit: true, text: `hit at ${position + 1}` };
}

console.log(`Retrieval benchmark: ${questions.length} questions, lexical search over ${files.length} files in ${root}/,`);
console.log(`a hit when a verified source is among the first ${inspect} results\n`);

const pad = (text: string, width: number) => text.padEnd(width);
console.log(`${pad('ID', 5)}${pad('Type', 28)}${pad('Without glossary', 30)}With glossary`);
const tally = new Map<string, { asked: number; plain: number; glossed: number }>();
for (const q of questions) {
  const plain = judge(q.id, search(termsOf(q.question)));
  const glossed = judge(q.id, search(withGlossary(termsOf(q.question))));
  console.log(`${pad(q.id, 5)}${pad(q.type, 28)}${pad(plain.text, 30)}${glossed.text}`);
  const row = tally.get(q.type) ?? { asked: 0, plain: 0, glossed: 0 };
  row.asked++;
  if (plain.hit) row.plain++;
  if (glossed.hit) row.glossed++;
  tally.set(q.type, row);
}

console.log(`\n${pad('By type', 33)}${pad('Without glossary', 30)}With glossary`);
let plainTotal = 0;
let glossedTotal = 0;
for (const [type, row] of tally) {
  console.log(`${pad(type, 33)}${pad(`${row.plain} of ${row.asked}`, 30)}${row.glossed} of ${row.asked}`);
  plainTotal += row.plain;
  glossedTotal += row.glossed;
}
console.log(`${pad('All questions', 33)}${pad(`${plainTotal} of ${questions.length}`, 30)}${glossedTotal} of ${questions.length}`);
