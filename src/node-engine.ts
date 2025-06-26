import { createReadStream, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { HashAlgo, HashResult } from './types';

export async function hashNode(path: string, algo: HashAlgo, chunkSize = 1024 * 1024): Promise<HashResult> {
  try {
    const size = statSync(path).size;
    const hash = createHash(algo);
    return await new Promise<HashResult>((resolve) => {
      createReadStream(path, { highWaterMark: chunkSize })
        .on('data', (chunk) => hash.update(chunk))
        .on('end', () => resolve({ ok: true, hash: hash.digest('hex'), bytes: size, algo }))
        .on('error', (err: any) => resolve({ ok: false, code: err.code ?? 'EIO', message: String(err.message), cause: err }));
    });
  } catch (err: any) {
    return { ok: false, code: err.code ?? 'EUNKNOWN', message: String(err.message), cause: err };
  }
}
