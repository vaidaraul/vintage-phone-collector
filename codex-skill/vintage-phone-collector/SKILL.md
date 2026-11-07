---
name: vintage-phone-collector
description: Restore and document vintage Windows Phone devices and classic games through careful package inspection, compatible deployment, and verified on-device testing.
metadata:
  short-description: Restore and document vintage Windows Phone projects
---

# Vintage Phone Collector

Use this skill for restoring, maintaining, or documenting vintage Windows Phone devices and their apps or games. Treat the project repository's device notes, upgrade history, package records, and test results as the source of truth for that specific device. Keep reusable procedures separate from device-specific history.

## Working approach

- Work incrementally. Before each command or device operation, explain what it checks or changes and what result is expected. Prefer one meaningful operation at a time so its output can guide the next step.
- Prioritize files and tools already available on the PC. Inspect the device, installed tool versions, and package before proposing additional software. Do not reinstall SDKs or add components without a concrete need.
- Read-only inspection is appropriate without extra approval. Do not install or remove apps, change developer settings, pair or reset a device, or alter its OS, bootloader, firmware, or partitions without discussing that specific operation first.
- Preserve working apps and the current device state. Do not delete, replace, or downgrade a working game to make room for an unverified package.
- Do not infer success from a package manifest, successful deployment, or a single launch. Record observed installation, launch, and playable behavior separately. Mark a game functional only after it launches and can be played; note crashes, purchase gates, authentication failures, missing services, and inconsistent behavior precisely.

## Inspect packages before deployment

For each XAP, APPX, APPXBUNDLE, or other package, record its exact filename, size, source or provenance, and a cryptographic hash where available. Inspect the manifest and identify:

- package name, version, publisher, architecture, target platform, minimum OS version, and application entry point;
- runtime or framework requirements, declared dependencies, capabilities, and package type;
- signature and certificate results, including tool output, trust-chain or revocation limitations, and whether validation covers the package contents.

Treat manifest publisher text and the mere presence of a signature file as claims to verify, not proof of authenticity. Distinguish a signature that parses from a signature whose package integrity and trust chain are successfully validated. Compare hashes only with an independently identified reference and state the reference source. Record provenance as original publisher distribution, archive, modified package, or unknown when evidence supports that classification.

Use tools appropriate to the format. XAP deployment tools do not automatically deploy APPX packages. Check the package's OS and CPU requirements against the actual phone model, OS build, and available dependencies. Minimum-version and architecture matches establish eligibility to attempt installation, not runtime compatibility or performance on limited hardware.

## Deploy and verify

Choose a deployment method supported by the specific phone OS and package type, using existing tools where possible. Explain the method and expected result before using it. Do not install dependencies or trust certificates as a workaround without first explaining what they change and discussing the specific action with the user.

After an authorized installation, verify on the phone and record:

1. whether deployment completed and any exact error code or message;
2. whether the app appears as installed;
3. whether it launches, including behavior after a relaunch or device restart when relevant;
4. whether the core gameplay or feature actually works;
5. limitations, stability, performance, account, network, purchase, or service issues.

Use evidence-based statuses such as `not inspected`, `inspection only`, `installed, not launched`, `launches, gameplay unverified`, `partially functional`, `functional`, `unstable`, or `failed`. Keep observations distinct from hypotheses and do not upgrade a status without new evidence.

## Maintain project documentation

Keep device-specific history and results in project documentation, not in this reusable skill. For each tested title, capture the exact version, package filename, source, hash, manifest facts, deployment method, device and OS build, test steps, observed outcome, and date. Record unknowns explicitly instead of filling gaps with assumptions. Preserve original download URLs only when verified; avoid redistributing copyrighted packages unless distribution rights are established.

When continuing an existing project, read its current notes first and update only facts supported by the latest evidence. Correct stale claims when the user reports new behavior. Do not describe an app as functional solely because an earlier test succeeded if later tests show it crashes or behaves inconsistently.
