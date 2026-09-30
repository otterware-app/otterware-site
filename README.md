# otterware.app

The front door to Otterware's apps: one static page (`public/index.html`) that points to each of
them, served by a Cloudflare Worker. Workers Builds deploys it on every push to `main`.

```sh
pnpm install
pnpm dev   # http://localhost:8787
```
