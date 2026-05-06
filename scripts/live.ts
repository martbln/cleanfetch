import { clean } from "../src/index.js";

const url = process.argv[2] ?? "https://stripe.com/pricing";

const missing = ["ANTHROPIC_API_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"].filter(
  (name) => !process.env[name],
);

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const result = await clean(url);

console.log(`URL: ${result.url}`);
console.log(`Resolved URL: ${result.resolvedUrl}`);
console.log(`Tokens: ${result.rawTokens.toLocaleString()} raw -> ${result.cleanTokens.toLocaleString()} clean (${result.reduction}% reduction)`);
console.log("");
console.log(result.markdown);
