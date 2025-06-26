export type Algo = 'sha256' | 'sha512' | 'blake3';

export interface HashOk {
  ok: true;
  hash: string;
  bytes: number;
  algo: Algo;
}

export interface HashError {
  ok: false;
  code: string;
  message: string;
  cause?: unknown;
}

export type HashResult = HashOk | HashError;
