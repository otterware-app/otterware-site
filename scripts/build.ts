// Assembles the site in dist/: the pages and files in public/, each page with the site's
// header and footer, and Otter Mail's changelog. Wrangler runs it before deploying
// (wrangler.jsonc's build) and before `wrangler dev`.

import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import { writeChangelog } from "./changelog.ts";
import { withSiteLayout } from "./layout.ts";

const root = NodePath.resolve(import.meta.dirname, "..");
const dist = NodePath.join(root, "dist");

NodeFS.rmSync(dist, { recursive: true, force: true });
NodeFS.cpSync(NodePath.join(root, "public"), dist, { recursive: true });
writeChangelog(dist);
for (const name of NodeFS.readdirSync(dist, { recursive: true, encoding: "utf8" })) {
  if (!name.endsWith(".html")) continue;
  const page = NodePath.join(dist, name);
  const pathname = `/${name.replace(/index\.html$/, "")}`;
  NodeFS.writeFileSync(page, withSiteLayout(NodeFS.readFileSync(page, "utf8"), pathname));
}
console.log("Site assembled in dist/.");
