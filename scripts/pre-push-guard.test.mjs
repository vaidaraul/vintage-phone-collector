import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_BLOB_BYTES,
  isPlaceholder,
  pathProblem,
  scanText,
} from "./pre-push-guard.mjs";

function kinds(text) {
  return new Set(scanText(text).map(([, kind]) => kind));
}

test("private keys are blocked", () => {
  const text = "-----BEGIN " + "RSA PRIVATE KEY-----";
  assert.ok(kinds(text).has("private key"));
});

test("GitHub tokens are blocked", () => {
  const text = "token = " + "ghp_" + "a".repeat(36);
  assert.ok(kinds(text).has("GitHub token"));
});

test("AWS access keys are blocked", () => {
  const text = "key " + "AKIA" + "A".repeat(16);
  assert.ok(kinds(text).has("AWS access key"));
});

test("generic credential assignments are blocked", () => {
  const text = "pass" + 'word = "hunter2"';
  assert.ok(kinds(text).has("credential assignment"));
});

test("connection strings with passwords are blocked", () => {
  const text = "postgres://user:" + "hunter2" + "@db.example.com";
  assert.ok(kinds(text).has("connection string"));
});

test("labelled device identifiers are blocked", () => {
  const text = "IMEI" + ": " + "123456789012345";
  assert.ok(kinds(text).has("device identifier"));
});

test("placeholder values are ignored", () => {
  const text = "pass" + 'word = "REPLACE_WITH_LOCAL_RANDOM_PASSPHRASE"';
  assert.deepEqual([...kinds(text)], []);
});

test("environment lookups are ignored", () => {
  const text = "pass" + 'word = os.environ["DB_PASSWORD"]';
  assert.deepEqual([...kinds(text)], []);
});

test("short values are ignored", () => {
  const text = "pass" + 'word = "abc"';
  assert.deepEqual([...kinds(text)], []);
});

test("prose is ignored", () => {
  const text = "Do not publish device serials, credentials, or private network secrets.";
  assert.deepEqual([...kinds(text)], []);
});

test("the allow marker skips a reviewed line", () => {
  const text = "pass" + 'word = "hunter2" # pre-push-guard: allow';
  assert.deepEqual([...kinds(text)], []);
});

test("a lab SSID is not a credential", () => {
  assert.deepEqual([...kinds("ssid=HTC-Lab")], []);
});

test("placeholder detection covers examples", () => {
  assert.equal(isPlaceholder("REPLACE_WITH_LOCAL_RANDOM_PASSPHRASE"), true);
  assert.equal(isPlaceholder("hunter2"), false);
});

test(".env is blocked", () => {
  assert.equal(pathProblem(".env", 10), "forbidden file name");
});

test(".env.example is allowed", () => {
  assert.equal(pathProblem(".env.example", 10), null);
});

test(".env.local is blocked", () => {
  assert.equal(pathProblem("config/.env.local", 10), "environment file");
});

test("phone packages are blocked", () => {
  assert.equal(pathProblem("Weather.apk", 10), "forbidden file type");
});

test("private key files are blocked", () => {
  assert.equal(pathProblem("certs/private.pem", 10), "forbidden file type");
});

test("markdown is allowed", () => {
  assert.equal(
    pathProblem("devices/htc-wildfire-a3333/README.md", 100),
    null,
  );
});

test("oversized files are blocked", () => {
  const problem = pathProblem("big.txt", MAX_BLOB_BYTES + 1);
  assert.ok(problem);
  assert.match(problem, /limit/);
});
