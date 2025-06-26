# hash-util

A minimal TypeScript helper that streams files and computes hashes in both Node and browser runtimes.

## Example

### Node
```ts
import { hashFile } from './src';

const result = await hashFile('path/to/file');
if (result.ok) {
  console.log(result.hash, result.bytes);
}
```

### Browser
```ts
const blob = new File([data], 'foo.txt');
const result = await hashFile(blob, { algorithm: 'blake3' });
```
