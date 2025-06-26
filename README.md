# near

This repository provides a reusable TypeScript utility to hash files both in Node and browser/Edge runtimes. It exposes a single `hashFile` API which streams large files efficiently and returns a structured result.

## Example

```ts
import { hashFile } from './dist/index.js';

// Node usage
const result = await hashFile('path/to/file');
if (result.ok) console.log(result.hash);

// Browser usage
const blob = new File([data], 'file.bin');
const result2 = await hashFile(blob, { algorithm: 'blake3' });
```
