// The project's folder, the one that holds package.json, so that every check
// reads the same files wherever it is run from.
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));
