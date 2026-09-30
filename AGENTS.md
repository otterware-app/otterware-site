# otterware.app

The Otterware landing page: one static page, `public/index.html`, with a row per app. It is a
Cloudflare Worker that only serves `public/` (`wrangler.jsonc`), deployed by Workers Builds on
pushes to `main`, so merging a pull request deploys it. Never deploy it by hand.

- `pnpm install`, then `pnpm dev` to preview it at http://localhost:8787.
- When an app launches, moves to a new domain or goes away, update its row.
- Keep it small: plain HTML and CSS, no build step, no scripts.
