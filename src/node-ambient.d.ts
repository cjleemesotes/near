type Buffer = Uint8Array;
declare var process: any;

declare module 'node:fs' {
  export function createReadStream(path: string, options?: any): any;
  export function statSync(path: string): { size: number };
}

declare module 'node:crypto' {
  export function createHash(algo: string): {
    update(data: any): void;
    digest(encoding: string): string;
  };
}
