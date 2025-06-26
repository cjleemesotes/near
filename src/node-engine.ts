import { createReadStream, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { Algo, HashResult } from './types';
import { toHashError } from './errors';

export async function hashNode(
  path: string,
  algo: Algo,
  chunkSize = 1024 * 1024,
): Promise<HashResult> {
  try {
    const size = statSync(path).size;
    const hash = createHash(algo);
    return await new Promise<HashResult>((resolve) => {
      createReadStream(path, { highWaterMark: chunkSize })
        .on('data', (data: Buffer) => hash.update(data))
        .on('end', () =>
          resolve({ ok: true, hash: hash.digest('hex'), bytes: size, algo }),
        )
        .on('error', (err: any) =>
          resolve(toHashError(err.code ?? 'EIO', err.message, err)),
        );
    });
  } catch (e: any) {
    return toHashError(e.code ?? 'EUNKNOWN', e.message, e);
  }
}
