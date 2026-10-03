import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import { readChangelog } from "./changelog.ts";

const images = NodePath.resolve(import.meta.dirname, "../changelog/mail/images");

test("parses every released note", () => {
  const entries = readChangelog();
  assert.ok(entries.length > 0);
  for (const e of entries) {
    assert.ok(e.title.length > 0, e.version);
    assert.ok(e.body.length > 0, e.version);
  }
});

test("finds every image a note shows", () => {
  for (const e of readChangelog()) {
    for (const [, src] of e.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const name = /^(?:\.\/)?images\/([^/]+)$/.exec(src!)?.[1];
      assert.ok(name, `${e.version}: ${src} should be images/<file>`);
      assert.ok(NodeFS.existsSync(NodePath.join(images, name)), `${e.version}: ${src}`);
    }
  }
});
