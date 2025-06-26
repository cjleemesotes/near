export type HashResult =
  | { ok: true; hash: string; bytes: number; algo: string }
  | { ok: false; code: string; message: string; cause?: unknown };

export type Algo = 'sha256' | 'sha512' | 'blake3';
