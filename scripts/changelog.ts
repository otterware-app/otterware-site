// Otter Mail's changelog page (/mail/changelog/: every released note, the versions down the
// side). The notes are written in the otter-mail repository and copied into changelog/mail/
// by the Mail changelog workflow, with `released`, the version Mail last released: notes
// written ahead of a release wait for it. Run by build.ts and dev.ts.

import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import { Marked, type Tokens } from "marked";

const notes = NodePath.resolve(import.meta.dirname, "../changelog/mail");

type Entry = {
  version: string;
  /** A few words naming the release: "Onboarding", "A smarter ⌘K". */
  title: string;
  /** The release day, YYYY-MM-DD. */
  date: string;
  /** Markdown after the front matter: a lead line, images, then ## sections of bullets. */
  body: string;
};

const escape = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** One note: front matter (`title:`, `date:` between `---` lines), then markdown. */
function parseEntry(version: string, text: string): Entry {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`changelog/mail/${version}.md: missing front matter`);
  const fields = Object.fromEntries(
    match[1]!.split(/\r?\n/).flatMap((line) => {
      const at = line.indexOf(":");
      return at < 0 ? [] : [[line.slice(0, at).trim(), line.slice(at + 1).trim()]];
    }),
  );
  const title = fields.title?.replace(/^["']|["']$/g, "");
  const date = fields.date;
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? ""))
    throw new Error(`changelog/mail/${version}.md: needs a title and a date (YYYY-MM-DD)`);
  return { version, title, date: date!, body: match[2]!.trim() };
}

/** Semver order of X.Y.Z versions: negative when `a` is older. */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** "2026-09-30" → "September 30, 2026". */
const formatDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** Every released note, newest first (a malformed one throws). */
export function readChangelog(): Entry[] {
  const released = NodeFS.readFileSync(NodePath.join(notes, "released"), "utf8").trim();
  return NodeFS.readdirSync(notes)
    .filter((name) => /^\d+\.\d+\.\d+\.md$/.test(name))
    .map((name) =>
      parseEntry(name.slice(0, -3), NodeFS.readFileSync(NodePath.join(notes, name), "utf8")),
    )
    .filter((e) => compareVersions(e.version, released) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version));
}

/** An image on its own line becomes a figure, its alt text the caption. */
const figure = (image: Tokens.Image) => {
  const name = /^(?:\.\/)?images\/([^/]+)$/.exec(image.href)?.[1];
  const src = name ? `/mail/changelog/images/${name}` : image.href;
  return `<figure><img src="${escape(src)}" alt="${escape(image.text)}" loading="lazy" /><figcaption>${escape(image.text)}</figcaption></figure>\n`;
};

const markdown = new Marked({
  renderer: {
    paragraph({ tokens }) {
      const only = tokens.length === 1 ? tokens[0] : undefined;
      if (only?.type === "image") return figure(only as Tokens.Image);
      return `<p>${this.parser.parseInline(tokens)}</p>\n`;
    },
  },
});

/**
 * Writes <dist>/mail/changelog/index.html: every released note on one page, newest first,
 * with the versions down the side. Each note's anchor is its version (#0.5.17).
 */
export function writeChangelog(dist: string): void {
  const entries = readChangelog();
  const out = NodePath.join(dist, "mail", "changelog");
  NodeFS.mkdirSync(out, { recursive: true });
  NodeFS.cpSync(NodePath.join(notes, "images"), NodePath.join(out, "images"), {
    recursive: true,
  });

  const toc = entries
    .map(
      (e) =>
        `            <li><a href="#${e.version}"><span class="version">${escape(e.version)}</span> ${escape(e.title)}</a></li>`,
    )
    .join("\n");
  const notesHtml = entries
    .map(
      (e) => `          <article class="entry" id="${e.version}">
            <p class="meta"><a href="#${e.version}">${escape(e.version)}</a> · <time datetime="${e.date}">${formatDate(e.date)}</time></p>
            <h2>${escape(e.title)}</h2>
${markdown.parse(e.body.replace(/^## /gm, "### "))}
          </article>`,
    )
    .join("\n");

  NodeFS.writeFileSync(
    NodePath.join(out, "index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Changelog · Otter Mail</title>
    <meta name="description" content="What's new in Otter Mail, release by release." />
    <link rel="icon" href="/favicon.png" />
    <link rel="stylesheet" href="/style.css" />
    <script src="/site.js" defer></script>
  </head>
  <body class="landing" data-app="mail">
    <header class="top">
      <div class="wrap">
        <nav class="nav"></nav>
      </div>
    </header>

    <main class="page changelog">
      <div class="wrap">
        <header>
          <h1>Changelog</h1>
          <p>What's new in Otter Mail, on the Mac and the web.</p>
        </header>
        <div class="changelog-layout">
          <nav class="toc" aria-label="Versions">
            <ol>
${toc}
            </ol>
          </nav>
          <div class="entries">
${notesHtml}
          </div>
        </div>
        <footer></footer>
      </div>
    </main>

    <script>
      // The side list follows the note being read: the last one whose top has
      // scrolled near the top of the window.
      (() => {
        const entries = [...document.querySelectorAll(".entry")];
        const links = [...document.querySelectorAll(".toc a")];
        const update = () => {
          // At the bottom of the page, the last note (it may never reach the top).
          const bottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
          const current = bottom
            ? entries.at(-1)
            : (entries.filter((e) => e.getBoundingClientRect().top < 160).pop() ?? entries[0]);
          for (const a of links) a.toggleAttribute("aria-current", a.hash === "#" + current?.id);
        };
        addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
        addEventListener("hashchange", update);
        update();
      })();
    </script>
  </body>
</html>
`,
  );
  console.log(`Mail changelog: ${entries.length} releases.`);
}
