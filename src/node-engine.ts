import { createReadStream, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Algo, HashResult } from './types';

export async function hashNode(path: string, algo: Algo): Promise<HashResult> {
  try {
    const size = statSync(path).size;
    const hash = createHash(algo);
    return await new Promise<HashResult>((resolve) => {
      createReadStream(path)
        .on('data', (chunk: Buffer) => hash.update(chunk))
        .on('end', () => resolve({ ok: true, hash: hash.digest('hex'), bytes: size, algo }))
        .on('error', (err: NodeJS.ErrnoException) => resolve({ ok: false, code: err.code ?? 'EIO', message: err.message, cause: err }));
    });
  } catch (e: any) {
    return { ok: false, code: e.code ?? 'EUNKNOWN', message: e.message, cause: e };
  }
}
