import { clean } from "cleanfetch";

const result = await clean("https://stripe.com/pricing");

console.log(result.markdown);
console.error(
  `${result.rawTokens.toLocaleString()} raw -> ${result.cleanTokens.toLocaleString()} clean (${result.reduction}% reduction)`,
);
