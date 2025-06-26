# File Hash Utility

This package provides an environment-aware `hashFile` function that works in Node.js and modern browsers, including Edge runtimes. It streams large files without exhausting memory and supports SHA-256, SHA-512, and BLAKE3 algorithms.

```ts
import { hashFile } from './dist/index.js';

const result = await hashFile('path/to/file');
if (result.ok) {
  console.log(result.hash);
}
```

