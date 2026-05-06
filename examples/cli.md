# CLI Examples

Write clean markdown to stdout:

```bash
cleanfetch https://stripe.com/pricing
```

Save clean markdown to a file:

```bash
cleanfetch https://stripe.com/pricing > pricing.md
cleanfetch https://stripe.com/pricing --output pricing.md
```

Get structured JSON:

```bash
cleanfetch https://stripe.com/pricing --json
```

Suppress stats:

```bash
cleanfetch https://stripe.com/pricing --no-stats
```
