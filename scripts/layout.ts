// Every page's header and footer, so they are the same everywhere. A page has an empty
// <nav class="nav"></nav> and <footer></footer>, and names the app it is about, if any, with
// <body data-app="mail">. Run by build.ts and dev.ts.

type App = {
  name: string;
  /** Its product page; none yet for the apps still to come. */
  page?: string;
  /** The app itself, where signing in from its pages takes you. */
  url?: string;
  /** The product bar's links under the nav, after Overview. */
  links?: [label: string, href: string][];
  /** The product bar's button. */
  action?: [label: string, href: string];
};

const APPS: Record<string, App> = {
  mail: {
    name: "Mail",
    page: "/mail/",
    url: "https://mail.otterware.app/",
    links: [
      ["Changelog", "/mail/changelog/"],
      ["Privacy", "/mail/privacy/"],
      ["Terms", "/mail/terms/"],
    ],
    action: ["Download", "https://github.com/otterware-app/otter-mail/releases/latest"],
  },
  drive: {
    name: "Drive",
    page: "/drive/",
    url: "https://drive.otterware.app/",
    links: [["CLI and agents", "/drive/#agents"]],
    action: ["Open Otter Drive", "https://drive.otterware.app/"],
  },
  code: { name: "Code" },
  calendar: { name: "Calendar" },
};

const ACCOUNTS = "https://accounts.otterware.app/otter";

/** The <body>'s data-app: the app a page is about. */
const appOf = (html: string) => /<body[^>]*\sdata-app="([a-z]+)"/.exec(html)?.[1];

/**
 * The nav: the apps (those to come, unlinked), and the account. From the suite's own pages,
 * signing in opens the Otter account; from an app's pages, the app itself, which signs in
 * through the same account. Once this browser is signed in, site.js renames the link.
 */
export function siteNav(current?: string): string {
  const apps = Object.entries(APPS)
    .map(([id, app]) =>
      app.page
        ? `<a href="${app.page}"${id === current ? ' aria-current="page"' : ""}>${app.name}</a>`
        : `<span class="soon" aria-disabled="true">${app.name} <small>Soon</small></span>`,
    )
    .join("\n          ");
  const app = current ? APPS[current] : undefined;
  const account = app?.url
    ? `<a class="account" href="${app.url}" data-signed-in="Open Otter ${app.name}">Sign in</a>`
    : `<a class="account" href="${ACCOUNTS}/sign-in" data-signed-in="Account" data-signed-in-href="${ACCOUNTS}/account">Sign in</a>`;
  return `<nav class="nav">
          <a class="logo" href="/"><img src="/apple-touch-icon.png" width="26" height="26" alt="" />Otterware</a>
          <div class="apps">
          ${apps}
          </div>
          <div class="links">${account}</div>
        </nav>`;
}

/** The bar under the nav on an app's pages: its pages, and its main action. */
function productBar(current?: string): string {
  const app = current ? APPS[current] : undefined;
  if (!app?.page) return "";
  const links = [["Overview", app.page], ...(app.links ?? [])]
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join("");
  const action = app.action ? `<a class="btn small" href="${app.action[1]}">${app.action[0]}</a>` : "";
  return `
      <div class="product-bar">
        <div class="wrap">
          <a class="product" href="${app.page}">Otter ${app.name}</a>
          <div class="links">${links}</div>
          ${action}
        </div>
      </div>`;
}

export function siteFooter(): string {
  return `<footer>
          <a href="/mail/">Otter Mail</a><a href="/drive/">Otter Drive</a
          ><a href="/mail/privacy/">Privacy</a><a href="/mail/terms/">Terms</a
          ><a href="https://github.com/otterware-app">GitHub</a>
        </footer>`;
}

/** A page with its nav (and product bar) and footer filled in, and the current page marked. */
export function withSiteLayout(html: string, pathname: string): string {
  const current = appOf(html);
  return html
    .replace('<nav class="nav"></nav>', () => siteNav(current))
    .replace(/(<header class="top">[\s\S]*?)(\s*<\/header>)/, (_, top: string, end: string) => top + productBar(current) + end)
    .replace("<footer></footer>", () => siteFooter())
    .replace(
      new RegExp(`(<div class="product-bar">[\\s\\S]*?)<a href="${pathname}">`),
      (_, before: string) => `${before}<a href="${pathname}" aria-current="page">`,
    );
}
