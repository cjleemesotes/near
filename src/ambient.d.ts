declare module 'hash-wasm' {
  export interface WASMInterface {
    update(data: Uint8Array): void;
    digest(): string;
  }
  export function createSHA256(): Promise<WASMInterface>;
  export function createSHA512(): Promise<WASMInterface>;
  export function createBLAKE3(): Promise<WASMInterface>;
}
