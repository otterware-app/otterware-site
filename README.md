# otterware.app

The Otterware site: the suite's page (`/`), a page per app (`/mail/`, `/drive/`), Otter Mail's
changelog, privacy policy and terms (`/mail/changelog/`, `/mail/privacy/`, `/mail/terms/`). The
apps themselves live on their own domains (mail.otterware.app, drive.otterware.app); the Otter
account at accounts.otterware.app.

Plain HTML and CSS in `public/`, assembled in `dist/` by `scripts/build.ts` and served by a
Cloudflare Worker. Workers Builds deploys it on every push to `main`.

```sh
pnpm install
pnpm dev     # http://localhost:4321, rebuilt at each visit
pnpm build   # dist/
pnpm test
```
