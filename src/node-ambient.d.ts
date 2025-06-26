declare var process: { versions?: { node?: string } };

declare module 'node:fs' {
  export { createReadStream, statSync } from 'fs';
}

declare module 'node:crypto' {
  export { createHash } from 'crypto';
}

type Buffer = Uint8Array;

declare namespace NodeJS {
  interface ErrnoException extends Error {
    code?: string;
  }
}
