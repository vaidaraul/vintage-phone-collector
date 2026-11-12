#!/usr/bin/env node
/**
 * Block pushes that contain credentials, device identifiers, or forbidden binaries.
 *
 * Intended to run from .githooks/pre-push, where Git supplies the refs being
 * pushed on stdin. It can also be run manually:
 *
 *     node scripts/pre-push-guard.mjs --range origin/main..HEAD
 *
 * Exit codes: 0 clean, 1 findings, 2 error.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MAX_BLOB_BYTES = 10 * 1024 * 1024;
const ALLOW_MARKER = "pre-push-guard: allow";
const MAX_REPORTED = 50;
const MAX_BUFFER = 128 * 1024 * 1024;

const FORBIDDEN_NAMES = new Set([
  ".env",
  ".netrc",
  ".npmrc",
  ".pypirc",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
  "id_rsa",
]);

const FORBIDDEN_SUFFIXES = [
  ".apk",
  ".odex",
  ".xap",
  ".appx",
  ".appxbundle",
  ".appxupload",
  ".cab",
  ".spkg",
  ".ppkg",
  ".iso",
  ".img",
  ".bin",
  ".pcap",
  ".pcapng",
  ".etl",
  ".log",
  ".pem",
  ".key",
  ".p12",
  ".pfx",
  ".jks",
  ".keystore",
];

const RULES = [
  {
    kind: "private key",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    kind: "GitHub token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/g,
  },
  {
    kind: "AWS access key",
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  },
  {
    kind: "AWS secret key",
    pattern: /aws_secret_access_key\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})/gi,
    valueGroup: 1,
  },
  {
    kind: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    kind: "Slack token",
    pattern: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g,
  },
  {
    kind: "Stripe secret key",
    pattern: /\b(?:sk|rk)_(?:live|test)_[0-9A-Za-z]{16,}\b/g,
  },
  {
    kind: "JWT",
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    kind: "bearer token",
    pattern: /authorization\s*:\s*bearer\s+([A-Za-z0-9._~+/-]{20,}=*)/gi,
    valueGroup: 1,
  },
  {
    kind: "connection string",
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^/\s:@]{1,64}:([^/\s@]{1,128})@/gi,
    valueGroup: 1,
  },
  {
    kind: "credential assignment",
    pattern:
      /\b(password|passwd|pwd|passphrase|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|client[_-]?secret|auth[_-]?token)\b\s*[:=]\s*['"]?([^\s'"#]{6,})/gi,
    valueGroup: 2,
  },
  {
    kind: "device identifier",
    pattern:
      /\b(?:imei|imsi|iccid|meid|serial(?:\s*(?:number|no\.?))?|sd\s*cid)\b\s*[:=]\s*['"]?([A-Za-z0-9:_-]{6,})/gi,
    valueGroup: 1,
  },
];

const PLACEHOLDER =
  /(?:^|[^a-z0-9])(?:replace|change(?:me)?|your|example|sample|dummy|placeholder|redacted|todo|tbd|none|null|true|false|password|passwd|secret|token)(?:[^a-z0-9]|$)/i;
const PLACEHOLDER_TOKEN = /\$\{[^}]*\}|<[^>]*>|%\([^)]*\)s|\*{3,}/;
const CODE_VALUE =
  /^(?:os\.|environ|getenv|request\.|self\.|config(?:\.|\[)|settings(?:\.|\[)|data(?:\.|\[)|process\.env|env(?:\.|\[)|getpass|input\()/i;

export function isPlaceholder(value) {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "").trim();
  if (cleaned.length < 6) return true;
  if (PLACEHOLDER.test(cleaned) || PLACEHOLDER_TOKEN.test(cleaned)) return true;
  if (CODE_VALUE.test(cleaned)) return true;
  if (/^0+$/.test(cleaned)) return true;
  return false;
}

export function scanText(text) {
  const findings = [];
  const seen = new Set();
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.toLowerCase().includes(ALLOW_MARKER)) continue;
    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      for (const match of line.matchAll(rule.pattern)) {
        if (rule.valueGroup) {
          const value = match[rule.valueGroup] ?? "";
          if (isPlaceholder(value)) continue;
        }
        const key = `${index + 1}:${rule.kind}`;
        if (!seen.has(key)) {
          seen.add(key);
          findings.push([index + 1, rule.kind]);
        }
        break;
      }
    }
  }
  return findings;
}

export function pathProblem(filePath, size) {
  const name = path.basename(filePath).toLowerCase();
  if (FORBIDDEN_NAMES.has(name)) return "forbidden file name";
  if (name.startsWith(".env.") && name !== ".env.example") {
    return "environment file";
  }
  if (FORBIDDEN_SUFFIXES.some((suffix) => name.endsWith(suffix))) {
    return "forbidden file type";
  }
  if (size > MAX_BLOB_BYTES) {
    return `${size} bytes; limit is ${MAX_BLOB_BYTES}`;
  }
  return null;
}

function gitText(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitBuffer(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "buffer",
    maxBuffer: MAX_BUFFER,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function isZero(sha) {
  return sha.length > 0 && /^0+$/.test(sha);
}

function commitsFromHook(input) {
  const commits = [];
  for (const line of input.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 4) continue;
    const [, localSha, , remoteSha] = parts;
    if (isZero(localSha)) continue;
    let output;
    try {
      output = isZero(remoteSha)
        ? gitText(["rev-list", localSha, "--not", "--remotes"])
        : gitText(["rev-list", `${remoteSha}..${localSha}`]);
    } catch {
      // The remote object may not exist locally after a force push or a ref
      // that was never fetched. Scan everything not already on a remote.
      output = gitText(["rev-list", localSha, "--not", "--remotes"]);
    }
    commits.push(...output.split(/\r?\n/).filter(Boolean));
  }
  return [...new Set(commits)];
}

function defaultRevRange() {
  try {
    const upstream = gitText([
      "rev-parse",
      "--abbrev-ref",
      "--symbolic-full-name",
      "@{upstream}",
    ]).trim();
    if (upstream) return "@{upstream}..HEAD";
  } catch {
    // No upstream configured; fall back to the full history.
  }
  return "HEAD";
}

function collectEntries(commits) {
  const entries = new Map();
  for (const commit of commits) {
    const raw = gitBuffer(["ls-tree", "-r", "-l", "-z", commit]).toString("utf8");
    for (const record of raw.split("\0")) {
      if (!record) continue;
      const tab = record.indexOf("\t");
      if (tab === -1) continue;
      const meta = record.slice(0, tab).split(/\s+/);
      const filePath = record.slice(tab + 1);
      if (meta.length < 4 || meta[1] !== "blob") continue;
      const size = Number(meta[3]);
      if (!Number.isFinite(size)) continue;
      entries.set(`${filePath}\0${meta[2]}\0${size}`, {
        path: filePath,
        sha: meta[2],
        size,
      });
    }
  }
  return [...entries.values()];
}

export function scanCommits(commits) {
  const findings = [];
  const entries = collectEntries(commits);
  const bySha = new Map();
  for (const entry of entries) {
    if (!bySha.has(entry.sha)) bySha.set(entry.sha, []);
    bySha.get(entry.sha).push(entry);
  }

  for (const [sha, paths] of bySha) {
    const size = paths[0].size;
    let textFindings = [];
    if (size <= MAX_BLOB_BYTES) {
      const data = gitBuffer(["cat-file", "blob", sha]);
      if (!data.subarray(0, 8192).includes(0)) {
        textFindings = scanText(data.toString("utf8"));
      }
    }
    for (const entry of paths) {
      const problem = pathProblem(entry.path, entry.size);
      if (problem) {
        findings.push({ location: entry.path, kind: "forbidden file", detail: problem });
      }
      for (const [line, kind] of textFindings) {
        findings.push({ location: `${entry.path}:${line}`, kind });
      }
    }
  }

  for (const commit of commits) {
    const message = gitText(["show", "-s", "--format=%B", commit]);
    for (const [line, kind] of scanText(message)) {
      findings.push({
        location: `commit ${commit.slice(0, 12)} message:${line}`,
        kind,
      });
    }
  }
  return findings;
}

function dedupe(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.location}\0${finding.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function usage() {
  return [
    "usage: node scripts/pre-push-guard.mjs [--hook | --range RANGE]",
    "",
    "  --hook          read refs from stdin, as Git does for a pre-push hook",
    "  --range RANGE   revision range to scan, e.g. origin/main..HEAD",
  ].join("\n");
}

export function main(argv = process.argv.slice(2)) {
  let hook = false;
  let revRange = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--hook") {
      hook = true;
    } else if (arg === "--range") {
      revRange = argv[index + 1];
      if (!revRange) {
        console.error(usage());
        return 2;
      }
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      return 0;
    } else {
      console.error(`unknown argument: ${arg}\n${usage()}`);
      return 2;
    }
  }
  if (hook && revRange) {
    console.error("use either --hook or --range, not both");
    return 2;
  }

  let commits;
  try {
    if (hook) {
      commits = commitsFromHook(readFileSync(0, "utf8"));
    } else {
      const range = revRange || defaultRevRange();
      commits = [...new Set(gitText(["rev-list", range]).split(/\r?\n/).filter(Boolean))];
    }
  } catch (error) {
    console.error(`pre-push guard: error: ${error.message}`);
    return 2;
  }

  if (commits.length === 0) {
    console.log("pre-push guard: nothing to scan.");
    return 0;
  }

  let findings;
  try {
    findings = dedupe(scanCommits(commits));
  } catch (error) {
    console.error(`pre-push guard: error: ${error.message}`);
    return 2;
  }

  if (findings.length > 0) {
    console.error(
      `pre-push guard: ${findings.length} finding(s) across ${commits.length} commit(s); push blocked.`,
    );
    for (const finding of findings.slice(0, MAX_REPORTED)) {
      const detail = finding.detail ? ` (${finding.detail})` : "";
      console.error(`  ${finding.location}: ${finding.kind}${detail}`);
    }
    if (findings.length > MAX_REPORTED) {
      console.error(`  ... and ${findings.length - MAX_REPORTED} more`);
    }
    console.error(
      "Remove the value, rotate it if it was real, and commit again. Do not bypass with --no-verify.",
    );
    return 1;
  }

  console.log(`pre-push guard: clean (${commits.length} commit(s) scanned).`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main());
}
