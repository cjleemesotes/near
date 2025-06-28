Below is a **one-stop, step-by-step cookbook** that takes a **brand-new workstation** — macOS, Linux, or Windows 11 + WSL 2 — from zero to:

1. **Compiling & deploying** a NEAR smart-contract (TypeScript or Rust) on **testnet**.
2. **Building, linking, and using** a TypeScript-powered command-line tool (`hash-cli`) that talks to the chain.

It’s completely repository-agnostic: drop any project into the flow.

---

# 0 Install-at-a-glance

| Area                           | Tool / Package                                                | Why you need it                      |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------ |
| Contract deployment / calls    | **near-cli v3** (Rust)                                        | Publish Wasm, sign & view on testnet |
| Compile JS/TS → Wasm           | **near-sdk-js**                                               | Typescript decorators + bindings     |
| Compile Rust → Wasm (optional) | **cargo-near**                                                | Zero-config Rust pipeline            |
| Runtime JS SDK (CLI)           | `@near-js/{accounts,providers,keystores-node,signers,crypto}` | v2 modular SDK                       |
| Scripting / build              | **Node LTS** via **nvm**                                      | Works on all OSes & WSL              |
| CLI pretties                   | `chalk`, `commander`, `hash-wasm`                             | Colours, arg-parsing, hashing        |
| Editor                         | VS Code (+ Remote-WSL)                                        | Nice to have                         |
| Misc. utilities                | `git`, `jq`, `curl`, `build-essential`                        | Compilers & helpers                  |

---

# 1 Base OS setup

### macOS / native Linux

```bash
# Linux (Debian/Ubuntu)
sudo apt update -qq \
&& sudo apt install -yqq git jq curl build-essential

# macOS – same packages via Homebrew
# brew install git jq curl coreutils
```

### Windows 11 + WSL 2

```powershell
wsl --install          # installs WSL2 + Ubuntu (reboot once)
```

Open **Ubuntu** and run the Linux commands from the previous section.

---

# 2 Node LTS + global NEAR CLI

```bash
# 2-a  nvm
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

# 2-b  Node + near-cli (Rust binary shipped via npm)
nvm install --lts -q && nvm use --lts
npm i -g near-cli

# 2-c  Sanity check
near --version   # near-cli 3.x.x
node --version   # v20.x or v22.x
```

---

# 3 Create / import a **testnet** account

### 3-a  Fresh account

1. Visit **[https://wallet.testnet.near.org](https://wallet.testnet.near.org)**.
2. Register e.g. **`yourname.testnet`**.
3. Secure with email or seed phrase.
4. Fund with ≥ **5 Ⓝ** (faucet or friend).

### 3-b  Authorize CLI

```bash
near login
# approve in browser → key saved to ~/.near-credentials/testnet/<account>.json
```

---

# 4 TypeScript contract bootstrap (near-sdk-js)

```bash
mkdir -p ~/near/hello-js && cd ~/near/hello-js
npm init -y
npm i -D near-sdk-js@latest typescript@4.9
npx near-sdk-js init             # creates src/contract.ts & tests
```

### Minimal `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "es2020",
    "moduleResolution": "node",
    "lib": ["ES2020","DOM"],
    "experimentalDecorators": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

### Build → Wasm

```bash
npx near-sdk-js build src/contract.ts build/contract.wasm
```

---

# 5 (Optional) Rust contract bootstrap

```bash
curl -sSf https://github.com/near/cargo-near/releases/latest/download/cargo-near-installer.sh | sh   # one-time
cargo near new hello-rs && cd hello-rs
cargo near build
# Wasm → target/wasm32-unknown-unknown/release/hello_rs.wasm
```

---

# 6 Deploy to testnet

```bash
# JS/TS
near deploy yourname.testnet build/contract.wasm

# Rust
# near deploy yourname.testnet target/wasm32-unknown-unknown/release/hello_rs.wasm
```

---

# 7 Smoke-test the contract

```bash
# Mutating method (example from scaffold)
near call yourname.testnet increment '{}' --accountId yourname.testnet

# View method
near view yourname.testnet get_counter '{}'
# → 1
```

---

# 8 Build the **hash-cli** (TypeScript + modular v2 SDK)

### 8-a  Project tree

```
<repo>/
├── cli/cli.ts           # command-line tool (see 8-d full source)
├── src/…                # node-engine.ts, browser-engine.ts, etc.
├── ambient.d.ts         # `declare module 'blake3';`
└── package.json
```

### 8-b  Runtime & dev dependencies

```bash
npm install \
  @near-js/accounts @near-js/providers \
  @near-js/keystores-node @near-js/signers @near-js/crypto \
  chalk commander hash-wasm

npm i -D typescript near-sdk-js
```

### 8-c  `tsconfig.cli.json`

```jsonc
{
  "compilerOptions": {
    "rootDir": ".",        // cli/** + src/**
    "outDir":  "dist",
    "target":  "ES2020",
    "module":  "es2020",
    "moduleResolution": "node",
    "types": ["node"],
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["cli/**/*.ts","src/**/*.ts","ambient.d.ts"]
}
```

### 8-d  `cli/cli.ts` – drop-in template

```ts
#!/usr/bin/env node
import { Command }    from 'commander';
import chalk          from 'chalk';
import { hashFile }   from '../src/index.js';

import { Account }                       from '@near-js/accounts';
import { JsonRpcProvider }               from '@near-js/providers';
import { UnencryptedFileSystemKeyStore } from '@near-js/keystores-node';
import { KeyPairSigner }                 from '@near-js/signers';
import { KeyPair }                       from '@near-js/crypto';

// ─────────────────────────  CONFIG  ─────────────────────────
const CONTRACT   = process.env.NEAR_CONTRACT        ?? 'yourname.testnet';
const NETWORK_ID = process.env.NEAR_NETWORK         ?? 'testnet';
const RPC_URL    = `https://rpc.${NETWORK_ID}.near.org`;
const CRED_DIR   = process.env.NEAR_CREDENTIALS_DIR ??
                   `${process.env.HOME}/.near-credentials`;

// ─────────────────────────  HELPERS  ─────────────────────────
async function getAccount(): Promise<Account> {
  const provider = new JsonRpcProvider({ url: RPC_URL });
  const keyStore = new UnencryptedFileSystemKeyStore(CRED_DIR);
  const key: KeyPair | null = await keyStore.getKey(NETWORK_ID, CONTRACT);
  if (!key) throw new Error(`Key for ${CONTRACT} not found in ${CRED_DIR}`);
  const signer = new KeyPairSigner(key);
  return new Account(CONTRACT, provider, signer);
}

const provider = new JsonRpcProvider({ url: RPC_URL });
async function viewGetHash(id: string): Promise<string | null> {
  const res: any = await provider.query({
    request_type: 'call_function',
    account_id:   CONTRACT,
    method_name:  'get_hash',
    args_base64:  Buffer.from(JSON.stringify({ id })).toString('base64'),
    finality: 'optimistic',
  });
  const txt = Buffer.from(res.result as Uint8Array).toString();
  return txt || null;
}

// ─────────────────────────  CLI  ─────────────────────────
const prog = new Command().name('hash-cli').version('0.1.0');

prog.command('anchor <file>')
  .option('-a, --algo <algo>', 'sha256 | sha512 | blake3', 'sha256')
  .description('hash <file> locally and store the hash on-chain')
  .action(async (file, opts) => {
    const res = await hashFile(file, { algorithm: opts.algo });
    if (!res.ok) { console.error(chalk.red(res.message)); process.exit(2); }

    const account = await getAccount();
    const outcome = await account.functionCall({
      contractId: CONTRACT,
      methodName: 'record_hash',
      args:       { hash: res.hash },
      gas:        BigInt('30000000000000'),
      attachedDeposit: BigInt(0),
    });

    const id64 = (outcome as any).status.SuccessValue ?? '';
    const id   = id64 ? Buffer.from(id64, 'base64').toString() : '(unknown)';
    console.log(chalk.green(`✔ stored id ${id}`));
  });

prog.command('verify <id> <file>')
  .option('-a, --algo <algo>', 'sha256 | sha512 | blake3', 'sha256')
  .description('rehash <file> and compare with on-chain hash')
  .action(async (id, file, opts) => {
    const res = await hashFile(file, { algorithm: opts.algo });
    if (!res.ok) { console.error(chalk.red(res.message)); process.exit(2); }

    const stored = await viewGetHash(id);
    if (stored === null) { console.error(chalk.red(`No hash for id ${id}`)); process.exit(3); }

    const ok = stored === res.hash;
    console.log(ok ? chalk.green('✓ match') : chalk.red('✗ mismatch'));
    process.exit(ok ? 0 : 1);
  });

prog.parseAsync();
```

### 8-e  `package.json` excerpts

```jsonc
{
  "scripts": {
    "build:wasm": "near-sdk-js build src/contract.ts build/contract.wasm",
    "build:cli":  "tsc -p tsconfig.cli.json",
    "build":      "npm run build:wasm && npm run build:cli"
  },
  "bin": {
    "hash-cli": "dist/cli/cli.js"
  }
}
```

### 8-f  Compile & link

```bash
npm run build              # emits dist/cli/cli.js
chmod +x dist/cli/cli.js   # allow shebang execution
npm link --force           # adds hash-cli to $PATH
hash-cli --help            # banner ✔
```

---

# 9 Using the CLI

```bash
# store a hash on-chain
hash-cli anchor ./photo.png
# ✔ stored id 2

# later verification
hash-cli verify 2 ./photo.png
# ✓ match
```

---

# 10 Environment variables (optional)

```
NEAR_CONTRACT=yourname.testnet
NEAR_NETWORK=testnet
NEAR_CREDENTIALS_DIR=/home/<you>/.near-credentials
```

Load them via `dotenv` in scripts if desired.

---

# 11 Troubleshooting quick-ref

| Issue / error                                           | What to check / do                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Key does not exist`                                    | Run `near login`; verify key file path in \~/.near-credentials/testnet   |
| TypeScript “dynamic imports only supported when …”      | tsconfig: `"module": "es2020"` (or newer)                                |
| Decorator warnings each build                           | Add `"experimentalDecorators": true` **or** build via near-sdk-js only   |
| `ERR_MODULE_NOT_FOUND dist/src/index.js` after npm link | `rootDir`/`include` must cover **cli/** and **src/**; rebuild            |
| CLI not on `$PATH`                                      | `npm config get prefix` → `<prefix>/bin/hash-cli` exists? re-`npm link`  |
| VS Code opens Cursor                                    | Put *VS Code* bin folder earlier in `$PATH` or alias `code`              |
| WSL: `EPERM` during npm install on `/mnt/c`             | Work in `/home/<user>` (ext4) **or** mount Windows drive with `metadata` |
| Native `blake3` build fails                             | Use `npm i blake3@2.1.6` or stick to sha256/sha512                       |

---

## You’re all set 🎉

* Compile contracts (TypeScript or Rust).
* Deploy, call, and view on NEAR Testnet.
* Build global Node CLIs that sign & call via the modular v2 SDK.

Happy hacking on **NEAR**!
