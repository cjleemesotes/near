import { isNode } from './env';
import type { Algo, HashResult } from './types';
import { hashNode } from './node-engine';
import { hashBrowser } from './browser-engine';

export async function hashFile(
  source: string | Blob,
  opts?: { algorithm?: Algo; chunkSize?: number },
): Promise<HashResult> {
  const algorithm = opts?.algorithm ?? 'sha256';

  if (isNode && typeof source === 'string') {
    return await hashNode(source, algorithm, opts?.chunkSize);
  }

  if (!isNode && source instanceof Blob) {
    return await hashBrowser(source, algorithm, opts?.chunkSize);
  }

  return { ok: false, code: 'ETYPE', message: 'Invalid source for current runtime' };
}

export type { HashResult, Algo } from './types';
