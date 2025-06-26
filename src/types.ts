export type HashAlgo = 'sha256' | 'sha512' | 'blake3';

export type HashSuccess = {
  ok: true;
  hash: string;
  bytes: number;
  algo: HashAlgo;
};

export type HashError = {
  ok: false;
  code: string;
  message: string;
  cause?: unknown;
};

export type HashResult = HashSuccess | HashError;
