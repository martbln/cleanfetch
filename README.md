# cleanfetch

Clean any webpage to agent-ready markdown. Typical pages see about 89% fewer tokens.

`cleanfetch` renders a URL with Cloudflare Browser Rendering, strips obvious navigation/footer noise, then asks Anthropic Haiku to extract the factual content agents actually need.

```bash
npm install -g @martbln/cleanfetch
cleanfetch https://stripe.com/pricing > pricing.md
```

## Why

Agents waste context on navigation, footers, CTAs, image metadata, repeated boilerplate, and marketing filler. A pricing page or changelog can return tens of thousands of noisy tokens when the useful content is often a few thousand tokens or less.

`cleanfetch` gives your scripts and agents clean markdown instead of raw web sludge.

<details>
<summary>See example: Stripe pricing page</summary>

**Raw crawl excerpt (16,273 tokens):**

```md
[Skip to content](#main)

Products
Solutions
Developers
Resources
Pricing

Contact sales
Sign in

Stripe pricing & fees
Start now
Contact sales

Payments
Accept payments online, in person, and around the world.

2.9% + 30 cents per successful card charge

Additional fees may apply for international cards, currency conversion,
disputes, and other payment methods.

Ready to get started?
Create account
Contact sales

Global footer
Products
Solutions
Developers
Company
```

**Clean result excerpt (1,762 tokens, 89% reduction):**

```md
# Stripe pricing

## Payments

| Product | Price | Notes |
|---|---:|---|
| Online card payments | 2.9% + 30 cents | Per successful card charge |
| In-person payments | 2.7% + 5 cents | Per successful card charge |
| International cards | +1.5% | Additional fee |
| Currency conversion | +1% | Additional fee |

## Notes

- Custom pricing is available for businesses with large payment volume.
- Additional fees can apply for disputes and alternative payment methods.
```

</details>

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
import { clean } from "@martbln/cleanfetch";

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
import { cleanMarkdown, crawl, preFilter } from "@martbln/cleanfetch";

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

| Tool | Token reduction | JS rendering | Semantic cleanup | Self-host |
|---|---:|---|---|---|
| cleanfetch | ~89% | Yes | Yes, Claude Haiku | Yes |
| Firecrawl | ~60% | Yes | No | Yes, limited |
| Jina Reader | ~70% | No | No | No |
| Crawl4AI | ~65% | Yes | No | Yes |

## Hosted Version

Permanent cached endpoints, scheduled re-fetching, and a token savings dashboard are coming.

**[-> Join the waitlist](https://tally.so/r/Zjvjj5)**

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
