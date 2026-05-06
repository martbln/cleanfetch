# Contributing

Thanks for helping improve `cleanfetch`.

## Scope

This repo is intentionally narrow:

- single URL in, clean markdown out;
- Cloudflare Browser Rendering;
- Anthropic Haiku semantic cleanup;
- Node.js SDK and CLI.

Out of scope for v0:

- multi-page crawling;
- hosted endpoint management;
- API key/team management;
- MCP server;
- Python SDK;
- provider plugin systems.

## Development

```bash
npm install
npm run check
```

## Live Testing

Live tests require:

```bash
ANTHROPIC_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

Then run:

```bash
npm run test:live -- https://stripe.com/pricing
```

## Pull Requests

Keep PRs small and focused. Add or update tests for behavior changes.
