// The residual-judgement-register check: every entry says what no check
// covers, why, who reviews it, in which review and when.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './root.ts';

const fields = ['id', 'what', 'whyNotChecked', 'reviewer', 'review', 'when'] as const;

export function checkRegister(): string[] {
  const { entries }: { entries: Partial<Record<(typeof fields)[number], string>>[] } = JSON.parse(
    readFileSync(join(root, 'checks/residual-judgement-register.json'), 'utf8'),
  );
  const problems: string[] = [];
  const seen = new Set<string>();
  entries.forEach((entry, i) => {
    const name = entry.id || `entry ${i + 1}`;
    const missing = fields.filter((f) => !entry[f]?.trim());
    if (missing.length > 0) problems.push(`${name} has no ${missing.join(', no ')}`);
    if (entry.id && seen.has(entry.id)) problems.push(`${entry.id} is listed twice`);
    if (entry.id) seen.add(entry.id);
  });
  return problems;
}
