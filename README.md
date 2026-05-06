# cleanfetch

Clean any webpage to agent-ready markdown.

`cleanfetch` renders a URL with Cloudflare Browser Rendering, strips obvious navigation/footer noise, then asks Anthropic Haiku to extract the factual content agents actually need.

```bash
npm install -g cleanfetch
cleanfetch https://stripe.com/pricing > pricing.md
```

## Why

Agents waste context on navigation, footers, CTAs, image metadata, repeated boilerplate, and marketing filler. A pricing page or changelog can return tens of thousands of noisy tokens when the useful content is often a few thousand tokens or less.

`cleanfetch` gives your scripts and agents clean markdown instead of raw web sludge.

## Quick Start

Set credentials:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_API_TOKEN=...
```

Run:

```bash
cleanfetch https://stripe.com/pricing > pricing.md
```

By default, stdout is clean markdown only. Progress and token stats go to stderr.

## CLI

```bash
cleanfetch <url> [--json] [--output file.md] [--model model] [--no-stats]
```

Examples:

```bash
cleanfetch https://stripe.com/pricing
cleanfetch https://stripe.com/pricing > pricing.md
cleanfetch https://stripe.com/pricing --output pricing.md
cleanfetch https://stripe.com/pricing --json
cleanfetch https://stripe.com/pricing --model claude-haiku-4-5-20251001
cleanfetch https://stripe.com/pricing --no-stats
```

## SDK

```ts
import { clean } from "cleanfetch";

const result = await clean("https://stripe.com/pricing");

console.log(result.markdown);
console.log(result.rawTokens);
console.log(result.cleanTokens);
console.log(result.reduction);
```

You can pass credentials directly:

```ts
await clean("https://stripe.com/pricing", {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
});
```

## Stage APIs

```ts
import { cleanMarkdown, crawl, preFilter } from "cleanfetch";

const crawled = await crawl("https://stripe.com/pricing");
const filtered = preFilter(crawled.markdown);
const markdown = await cleanMarkdown(filtered, { url: crawled.resolvedUrl });
```

## How It Works

```txt
URL
  -> Cloudflare Browser Rendering /crawl
  -> generic markdown pre-filter
  -> Anthropic Haiku semantic extraction
  -> clean markdown
```

The pre-filter removes obvious positional and markdown noise before the LLM call. Haiku then keeps prices, fees, product facts, technical specs, dates, FAQs, and other factual content while removing navigation, CTAs, testimonials, boilerplate, and marketing filler.

## Comparison

| Tool | Best For | Difference |
|---|---|---|
| cleanfetch | Clean markdown for agents and scripts | Two-stage cleanup with a tiny SDK/CLI surface |
| Firecrawl | Broader crawling and extraction platform | More features, more surface area |
| Jina Reader | Quick URL-to-markdown reads | Fetch-on-demand reader, less focused on semantic cleanup |
| Crawl4AI | Python-first crawling workflows | Great for Python scraping/RAG stacks |

## Hosted Version

Need permanent cached endpoints, scheduled re-fetching, analytics, and a hosted dashboard? Use `noui.md`.

## Development

```bash
npm install
npm run check
```

Optional live test:

```bash
npm run test:live -- https://stripe.com/pricing
```

## License

AGPL-3.0-only.
