import { createSHA256, createSHA512, createBLAKE3 } from 'hash-wasm';
import type { Algo, HashResult } from './types.js';

const factories = {
  sha256: createSHA256,
  sha512: createSHA512,
  blake3: createBLAKE3,
};

export async function hashBrowser(
  blob: Blob,
  algo: Algo,
  chunk = 4 * 1024 * 1024
): Promise<HashResult> {
  try {
    const hasher = await factories[algo]();
    let bytes = 0;
    for await (const chunkData of blob.stream()) {
      const buf = chunkData as Uint8Array;
      hasher.update(buf);
      bytes += buf.byteLength;
    }
    return { ok: true, hash: hasher.digest(), bytes, algo };
  } catch (e: any) {
    return { ok: false, code: 'EBROWSER', message: e.message, cause: e };
  }
}
