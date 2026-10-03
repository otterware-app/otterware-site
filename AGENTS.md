# otterware.app

The Otterware site: the suite's page and a page per app. The apps are on their own domains
(`mail.otterware.app`, `drive.otterware.app`) and show no marketing; this site does.

- `public/`: the pages and their files. `index.html` is the suite; `mail/` and `drive/` the apps'
  pages (`mail/privacy/`, `mail/terms/`: Otter Mail's policy and terms, which Google's OAuth
  consent screen links to, so they keep their URLs). `style.css` styles every page; `office.js`
  draws the hero (Otter Mail as a small office); `site.js` renames the nav's account link once
  this browser is signed in to Otter.
- Every page has an empty `<nav class="nav"></nav>` and `<footer></footer>`, filled by
  `scripts/layout.ts`, and names its app with `<body data-app="mail">`, which adds the app's bar
  under the nav and points "Sign in" at the app. From the suite's own pages, "Sign in" opens the
  Otter account (accounts.otterware.app). Apps still to come are in the nav, unlinked.
- `changelog/mail/`: Otter Mail's notes, copied from the otter-mail repository by the Mail
  changelog workflow (hourly). Write notes there, in otter-mail, not here.
- `scripts/build.ts` assembles `dist/` (wrangler runs it before deploying); `scripts/dev.ts`
  serves the site for development.

`pnpm dev` to preview at http://localhost:4321, `pnpm test` before handing work back. Workers
Builds deploys on pushes to `main`, so merging a pull request deploys it. Never deploy it by
hand.

Keep it small: plain HTML and CSS, a script only where a page needs one, no framework. When an
app launches, moves or goes away, update the nav (`scripts/layout.ts`) and the suite's page.
