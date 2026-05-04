import Anthropic from "@anthropic-ai/sdk";
import { resolveAnthropicConfig } from "./config.js";
import { CleanFetchCleanError } from "./errors.js";
import type { CleanMarkdownOptions } from "./types.js";

const SYSTEM_PROMPT = `You are a content extraction assistant. Extract only factual, structured content from a webpage markdown dump.

REMOVE:
- Navigation menus, header, footer, sidebar
- CTAs and buttons (Get started, Sign in, Contact sales, Start now, etc.)
- Marketing prose that contains no facts or data
- Testimonials, case studies, customer logos, social proof
- Country/language selectors
- Promotional banners and event announcements
- Repeated boilerplate (e.g. "Included at no additional charge")
- Section labels with no real content under them

KEEP:
- Prices, fees, percentages, fixed amounts
- Product and plan names with their pricing
- Feature lists with specifics (limits, caps, counts)
- FAQs with factual answers
- Dates, version numbers, technical specs
- Anything that answers "what does this cost or do?"

Output clean structured markdown. No commentary. No preamble. Just the content.`;

export async function cleanMarkdown(markdown: string, options: CleanMarkdownOptions): Promise<string> {
  const config = resolveAnthropicConfig(options);
  const client = options.anthropicClient ?? new Anthropic({ apiKey: config.anthropicApiKey });

  try {
    const message = await client.messages.create({
      model: config.model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract the content from this page (${options.url}):\n\n${markdown}`,
        },
      ],
    });

    const parts = message.content as Array<{ type?: string; text?: string }>;
    const text = parts.find((part) => part.type === "text" || typeof part.text === "string")?.text;

    if (!text) {
      throw new CleanFetchCleanError("Anthropic returned no text content");
    }

    return text;
  } catch (error) {
    if (error instanceof CleanFetchCleanError) throw error;
    throw new CleanFetchCleanError(`Anthropic cleaning failed: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}
