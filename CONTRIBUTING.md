# Contributing

Use Node.js 22.12 or newer and the pnpm version declared in `package.json`.

```sh
pnpm install
pnpm check
```

Keep this package a thin React adapter over `@pulsepond/typescript-sdk`. Do not
duplicate event validation, identity, persistence, batching, retry, or network
transport. Do not add automatic route, render, click, URL, DOM, or user-data
collection. React hooks must remain safe under Strict Mode and server
rendering.

Every behavior change needs a focused test. Pull requests should explain the
public API, lifecycle ownership, privacy implications, and checks run.

Stable GitHub Releases publish through npm Trusted Publishing. Update the
package version in a pull request, merge it into `main`, then publish a GitHub
Release tagged `v<package.json version>`. Never add an npm token.
