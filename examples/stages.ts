import { cleanMarkdown, crawl, preFilter } from "cleanfetch";

const crawled = await crawl("https://stripe.com/pricing");
const filtered = preFilter(crawled.markdown);
const markdown = await cleanMarkdown(filtered, { url: crawled.resolvedUrl });

console.log(markdown);
