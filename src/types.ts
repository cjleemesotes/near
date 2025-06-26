export type Algo = 'sha256' | 'sha512' | 'blake3';

export type HashOk = {
  ok: true;
  hash: string;
  bytes: number;
  algo: string;
};

export type HashErr = {
  ok: false;
  code: string;
  message: string;
  cause?: unknown;
};

export type HashResult = HashOk | HashErr;
