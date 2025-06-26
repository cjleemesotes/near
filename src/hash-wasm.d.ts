declare module 'hash-wasm' {
  export interface Hasher {
    update(data: Uint8Array): void;
    digest(): string;
  }
  export function createSHA256(): Promise<Hasher>;
  export function createSHA512(): Promise<Hasher>;
  export function createBLAKE3(): Promise<Hasher>;
}
