import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as NodeFS from "node:fs";
import { runInNewContext } from "node:vm";

const script = NodeFS.readFileSync(new URL("../public/site.js", import.meta.url), "utf8");

/** site.js on a page whose account link is `link`, with Accounts answering `signedIn`. */
async function run(hostname: string, signedIn: boolean, data: Record<string, string>) {
  const link = { textContent: "Sign in", href: "https://mail.otterware.app/", dataset: data };
  const calls: unknown[][] = [];
  const fetch = async (...args: unknown[]) => {
    calls.push(args);
    return { ok: true, json: async () => ({ signedIn }) };
  };
  runInNewContext(script, { fetch, location: { hostname }, document: { querySelector: () => link } });
  await new Promise(setImmediate);
  return { link, calls };
}

test("renames the link once Accounts says this browser is signed in", async () => {
  const account = await run("otterware.app", true, {
    signedIn: "Account",
    signedInHref: "https://accounts.otterware.app/otter/account",
  });
  // The page's objects come from another realm: compare them as JSON.
  assert.equal(
    JSON.stringify(account.calls),
    JSON.stringify([["https://accounts.otterware.app/otter/session", { credentials: "include" }]]),
  );
  assert.equal(account.link.textContent, "Account");
  assert.equal(account.link.href, "https://accounts.otterware.app/otter/account");

  const mail = await run("otterware.app", true, { signedIn: "Open Otter Mail" });
  assert.equal(mail.link.textContent, "Open Otter Mail");
  assert.equal(mail.link.href, "https://mail.otterware.app/");
});

test("keeps Sign in when signed out, and never asks production from local development", async () => {
  const out = await run("otterware.app", false, { signedIn: "Account" });
  assert.equal(out.link.textContent, "Sign in");
  const local = await run("localhost", true, { signedIn: "Account" });
  assert.equal(local.calls.length, 0);
  assert.equal(local.link.textContent, "Sign in");
});
