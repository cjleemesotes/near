import { isNode } from './env.js';
import { hashNode } from './node-engine.js';
import { hashBrowser } from './browser-engine.js';
import type { Algo, HashResult } from './types.js';

export async function hashFile(
  source: string | Blob,
  opts?: { algorithm?: Algo; chunkSize?: number }
): Promise<HashResult> {
  const algo = opts?.algorithm ?? 'sha256';
  if (isNode && typeof source === 'string') {
    return hashNode(source, algo);
  }
  if (!isNode && source instanceof Blob) {
    return hashBrowser(source, algo, opts?.chunkSize);
  }
  return { ok: false, code: 'ETYPE', message: 'Invalid source for current runtime' };
}

export type { Algo, HashResult } from './types.js';
