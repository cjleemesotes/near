import {
  NearBindgen,
  call,
  view,
  LookupMap,
  near,
} from 'near-sdk-js';

/**
 * An immutable hash registry:
 *   • auto‑incrementing u128 ID
 *   • ID → hash (hex) stored permanently
 */
@NearBindgen({})
export class Registry {
  counter: bigint;                 // last assigned ID
  hashes: LookupMap<string>;       // ID (string) → hash

  constructor() {
    this.counter = 0n;
    this.hashes = new LookupMap<string>('h'); // 'h' = storage prefix
  }

  /** Re‑hydrate LookupMap prototype when the contract state is loaded */
  deserialize(): void {
    // @ts-ignore – restore prototype
    this.hashes = Object.assign(new LookupMap<string>('h'), this.hashes);
  }

  /** Store a hash and return the new ID (starts at 1) */
  @call({})
  record_hash({ hash }: { hash: string }): string {
    if (!hash || typeof hash !== 'string')
      near.panic('Parameter "hash" must be a non‑empty string');

    this.counter += 1n;
    const id = this.counter.toString();
    this.hashes.set(id, hash);

    near.log(`{"event":"hash_recorded","id":"${id}","hash":"${hash}"}`);
    return id; // returning as string avoids BigInt JSON issues
  }

  /** Fetch a stored hash by ID; returns null if not found */
  @view({})
  get_hash({ id }: { id: string }): string | null {
    return this.hashes.get(id) ?? null;
  }

  /** Convenience: how many hashes are stored so far */
  @view({})
  get_counter(): string {
    return this.counter.toString();
  }
}
