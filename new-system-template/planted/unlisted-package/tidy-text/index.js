import { lowerCase } from 'text-case';

export function tidy(text) {
  return lowerCase(text.trim().replace(/\s+/g, ' '));
}
