---
name: Pre-push guard
description: Scan every commit that would be pushed for credentials, device identifiers, and forbidden binaries before pushing to this repository.
---

# Pre-push guard

Use this skill before any `git push` in the vintage-phone-collector repository, especially when the target is `main`. The guard scans every commit being pushed, the full tree of each commit, and the commit messages. It is deliberately strict: a false positive is cheaper than publishing a credential.

## One-time setup

Check the local hook path:

```sh
git config --get core.hooksPath
```

It should print `.githooks`. If it does not, enable it in this clone:

```sh
git config core.hooksPath .githooks
```

On a fresh Linux or macOS clone, make sure the hook is executable:

```sh
chmod +x .githooks/pre-push
```

## Before each push

1. Fetch and review what would leave the machine:

   ```sh
   git fetch origin
   git log --oneline origin/main..HEAD
   git diff --stat origin/main..HEAD
   ```

2. Run the same scan manually:

   ```sh
   node scripts/pre-push-guard.mjs --range origin/main..HEAD
   ```

   Node.js is required; it is already required by OpenCode.

3. If the scan is clean, push normally. The pre-push hook repeats the scan automatically.

4. If the scan reports findings, stop. Do not use `git push --no-verify`, and do not add a blanket allowlist entry.

## Fixing findings

- **A real credential:** rotate or revoke it first. Removing the commit does not make the value safe.
- **A false positive:** add `pre-push-guard: allow` to that specific line only, after reviewing it. Mention the reason in the commit message.
- **A forbidden binary:** keep it outside the repository, as the device READMEs already require.
- **A secret in an unpushed commit:** amend or rebase it out before pushing.
- **A secret already pushed to `main`:** rotate it immediately and revert the content in a new commit. If the history must be rewritten, edit the `Protect main` ruleset temporarily, rewrite, force-push, and restore the ruleset. `main` blocks force pushes and deletion for everyone, including admins.

## What is checked

- Private keys and common token formats: GitHub, AWS, Google, Slack, Stripe, JWTs, bearer tokens, and connection strings with passwords.
- Credential assignments such as `password=`, `api_key:`, and `client_secret=`, excluding obvious placeholders and environment lookups.
- Device identifiers when written as a labelled value: IMEI, IMSI, ICCID, MEID, serial number, or SD CID.
- Forbidden files and types: `.env*`, private keys, `.apk`, `.odex`, `.xap`, `.appx`, `.appxbundle`, `.cab`, `.spkg`, `.ppkg`, `.iso`, `.img`, `.bin`, captures, logs, and files over 10 MiB.
- Commit messages as well as file contents.

## Limits

- A pattern scanner is not a guarantee. Read `git diff` before committing.
- It does not scan issues, pull-request descriptions, or content already on the remote.
- `git push --no-verify` skips the hook. Treat that as an emergency override, not a workflow.

## Maintenance

Run the guard's tests after changing its patterns:

```sh
node --test scripts/pre-push-guard.test.mjs
```
