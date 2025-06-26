import { isNode } from './env';
import { hashNode } from './node-engine';
import { hashBrowser } from './browser-engine';
import type { HashAlgo, HashResult } from './types';

export async function hashFile(
  source: string | Blob | File,
  opts?: { algorithm?: HashAlgo; chunkSize?: number }
): Promise<HashResult> {
  const algo: HashAlgo = opts?.algorithm ?? 'sha256';
  const chunkSize = opts?.chunkSize;
  if (isNode && typeof source === 'string') {
    return hashNode(source, algo, chunkSize);
  }
  if (!isNode && source instanceof Blob) {
    return hashBrowser(source, algo, chunkSize);
  }
  return { ok: false, code: 'ETYPE', message: 'Invalid source for current runtime' };
}

export type { HashAlgo, HashResult } from './types';
