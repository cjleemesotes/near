Below is a **clean, editor‑agnostic onboarding guide** that brings a brand‑new developer workstation—macOS, Linux, *or* Windows 11 + WSL—up to the point where you can **write, compile, deploy, and call a NEAR smart contract** on *testnet*. Nothing is tied to a particular repository; you can drop your own TypeScript or Rust contract code into the flow.

---

## 0  What you’ll install

| Purpose                         | Tool                    | Notes                                  |
| ------------------------------- | ----------------------- | -------------------------------------- |
| Blockchain CLI                  | **near‑cli** (v3, Rust) | Publishes through npm (`near-cli`).    |
| JS / TS contracts               | **near‑sdk‑js**         | TypeScript→Wasm compiler & bindings.   |
| Rust contracts (optional)       | **cargo‑near**          | Easiest way to build & test Rust Wasm. |
| Node.js LTS                     | via **nvm**             | Works everywhere, including WSL.       |
| Git, jq                         | distro packages         | basic utilities.                       |
| VS Code (Remote WSL) or any IDE | optional                | makes editing in WSL seamless.         |

---

## 1  Base system setup

### Linux / macOS

```bash
sudo apt update -qq && sudo apt install -yqq git jq curl build-essential
# macOS: brew install git jq curl coreutils
```

### Windows 11 with WSL 2

1. **Enable WSL** (Windows Terminal → `wsl --install`).
2. Install **Ubuntu 24.04** (or similar).
3. Inside WSL run the Linux commands above.

---

## 2  Node.js LTS + global NEAR CLI

```bash
# install & activate nvm (one‑liner):
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

nvm install --lts -q && nvm use --lts
npm i -g near-cli            # installs Rust‑based near‑cli v3
```

Verify:

```bash
near --version   # near-cli 3.x.x
node --version   # v20.x or v22.x
```

---

## 3  Create or import a **testnet** account

If you *already* own a `.testnet` account, skip to ★ Login.

### 3‑a Create via Testnet wallet

1. Visit [https://wallet.testnet.near.org](https://wallet.testnet.near.org).
2. Pick a name like `mydev.testnet`.
3. Secure it (email or seed phrase).
4. Fund with at least **5 Ⓝ** via faucet.

### ★ Login from CLI (adds key to `~/.near-credentials`)

```bash
near login            # opens the wallet; approve access
# Legacy file option places the key at ~/.near-credentials/testnet/<account>.json
```

---

## 4  Scaffold a new JS / TS contract (near‑sdk‑js)

```bash
mkdir -p ~/near/hello-js && cd ~/near/hello-js
npm init -y
npm i -D near-sdk-js@latest typescript@4.9.x
npx near-sdk-js init             # creates src/contract.ts and config
```

Minimal `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "es2020",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "experimentalDecorators": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

Build → Wasm:

```bash
npx near-sdk-js build src/contract.ts build/contract.wasm
```

---

## 5  (Option) Scaffold a Rust contract

```bash
# one‑time
curl -sSf https://github.com/near/cargo-near/releases/latest/download/cargo-near-installer.sh | sh

# project
cargo near new hello-rs && cd hello-rs
cargo near build      # Wasm ends up in target/wasm32-unknown-unknown/release/<name>.wasm
```

---

## 6  Deploy to testnet

```bash
near deploy mydev.testnet build/contract.wasm          # JS/TS
# or
near deploy mydev.testnet target/wasm32-unknown-unknown/release/hello_rs.wasm   # Rust
```

Output:

```
Done deploying to mydev.testnet
Transaction ID: 7m6…abc
```

---

## 7  Call & view methods (smoke test)

Assuming your contract exposes `increment()` and `get_counter()`:

```bash
# change method
near call mydev.testnet increment '{}' --accountId mydev.testnet

# view method
near view mydev.testnet get_counter '{}'
# → 1
```

---

## 8  Typical environment variables

Put these in `.env` (and load with `dotenv` for scripts):

```
NEAR_ACCOUNT=mydev.testnet
NEAR_PRIVATE_KEY=ed25519:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEAR_NETWORK=testnet           # default if omitted
```

---

## 9  Common pitfalls & fixes

| Symptom                                                         | Fix                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Key does not exist`                                            | Run `near login` *inside* WSL; ensure key file in `~/.near-credentials/testnet`.             |
| `Dynamic imports are only supported when '--module' flag is...` | Set `"module": "es2020"` in `tsconfig.json`.                                                 |
| `near deploy <options>` shows help                              | v3 CLI expects **positional** args: `near deploy <accountId> <wasmFile>`.                    |
| EPERM / chmod errors during `npm install` on WSL                | Move project into `/home/...`, not `/mnt/c/...`, or mount Windows drive with `metadata`.     |
| VS Code opens Cursor instead of Code                            | Prepend Microsoft VS Code’s `bin` directory to `$PATH` or `alias code='…/VS Code/bin/code'`. |

---

### You’re ready

You can now:

* Build TypeScript (`near‑sdk‑js`) or Rust (`cargo‑near`) contracts.
* Deploy, call, and view methods on NEAR Testnet.
* Extend with unit tests (`near-workspaces`) or front‑end integration as needed.

Happy building on NEAR!
