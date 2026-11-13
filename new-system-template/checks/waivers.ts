// The waivers-expire check: every exception to a rule names the rule, the
// exception, its owner and its expiry, and none has expired.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './root.ts';

interface Waiver {
  rule?: string;
  exception?: string;
  owner?: string;
  expires?: string;
}

export function checkWaivers(today = new Date()): string[] {
  const { waivers }: { waivers: Waiver[] } = JSON.parse(readFileSync(join(root, 'checks/waivers.json'), 'utf8'));
  const problems: string[] = [];
  for (const w of waivers) {
    if (!w.rule || !w.exception || !w.owner || !w.expires) {
      problems.push(`a waiver for ${w.rule || 'an unnamed rule'} is missing its rule, exception, owner or expiry`);
    } else if (Number.isNaN(Date.parse(w.expires))) {
      problems.push(`the waiver for ${w.rule} (${w.exception}) has an expiry that is not a date: ${w.expires}`);
    } else if (new Date(w.expires) < today) {
      problems.push(`the waiver for ${w.rule} (${w.exception}), owned by ${w.owner}, expired on ${w.expires}`);
    }
  }
  return problems;
}
