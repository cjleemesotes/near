import { createSHA256, createSHA512, createBLAKE3, WASMInterface } from 'hash-wasm';
import type { Algo, HashResult } from './types';
import { toHashError } from './errors';

const factories = {
  sha256: createSHA256,
  sha512: createSHA512,
  blake3: createBLAKE3,
} as const;

export async function hashBrowser(
  blob: Blob,
  algo: Algo,
  chunkSize = 4 * 1024 * 1024,
): Promise<HashResult> {
  try {
    const create = factories[algo];
    const hasher: WASMInterface = await create();
    let bytes = 0;
    const reader = blob.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value as Uint8Array;
      hasher.update(chunk);
      bytes += chunk.byteLength;
    }
    return { ok: true, hash: hasher.digest(), bytes, algo };
  } catch (e: any) {
    return toHashError('EBROWSER', e.message, e);
  }
}
