import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type LogFields = Record<string, unknown>;

export interface Logger {
  info(message: string, fields?: LogFields): void;
  debug(message: string, fields?: LogFields): void;
}

// Writes each entry to a file as one line of JSON.
export function createFileLogger(file: string): Logger {
  mkdirSync(dirname(file), { recursive: true });
  const write = (level: string, message: string, fields: LogFields = {}) =>
    appendFileSync(file, `${JSON.stringify({ level, message, ...fields })}\n`);
  return {
    info: (message, fields) => write('info', message, fields),
    debug: (message, fields) => write('debug', message, fields),
  };
}
