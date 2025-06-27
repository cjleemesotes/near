import { createSHA256, createSHA512, createBLAKE3 } from 'hash-wasm';
import type { HashAlgo, HashResult } from './types.js';

type Factory = () => Promise<{ update(d: Uint8Array): void; digest(enc?: 'hex'): string }>;
const factories: Record<HashAlgo, Factory> = {
  sha256: createSHA256 as Factory,
  sha512: createSHA512 as Factory,
  blake3: createBLAKE3 as Factory,
};

export async function hashBrowser(blob: Blob, algo: HashAlgo): Promise<HashResult> {
  try {
    const hasher = await factories[algo]();
    let bytes = 0;
    for await (const chunk of blob.stream()) {
      const data = chunk as Uint8Array;
      hasher.update(data);
      bytes += data.byteLength;
    }
    return { ok: true, hash: hasher.digest('hex'), bytes, algo };
  } catch (e: any) {
    return { ok: false, code: 'EBROWSER', message: String(e?.message ?? e), cause: e };
  }
}
