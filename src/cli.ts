#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { CleanFetchCleanError, CleanFetchConfigError, CleanFetchCrawlError } from "./errors.js";
import { clean } from "./clean.js";
import type { CleanResult } from "./types.js";

export type CliArgs = {
  url: string;
  json: boolean;
  output?: string;
  model?: string;
  noStats: boolean;
};

const USAGE = `Usage: cleanfetch <url> [--json] [--output file.md] [--model model] [--no-stats]`;

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    url: "",
    json: false,
    noStats: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--json") {
      args.json = true;
      continue;
    }

    if (arg === "--no-stats") {
      args.noStats = true;
      continue;
    }

    if (arg === "--output") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${USAGE}\n\nMissing value for --output.`);
      args.output = value;
      index += 1;
      continue;
    }

    if (arg === "--model") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${USAGE}\n\nMissing value for --model.`);
      args.model = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`${USAGE}\n\nUnknown flag: ${arg}`);
    }

    if (args.url) {
      throw new Error(`${USAGE}\n\nUnexpected extra argument: ${arg}`);
    }

    args.url = arg;
  }

  if (!args.url) {
    throw new Error(USAGE);
  }

  return args;
}

export function formatStats(result: Pick<CleanResult, "rawTokens" | "cleanTokens" | "reduction">): string {
  return `Tokens: ${result.rawTokens.toLocaleString()} raw -> ${result.cleanTokens.toLocaleString()} clean (${result.reduction}% reduction)`;
}

async function main(): Promise<void> {
  let args: CliArgs;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  try {
    if (!args.noStats) {
      console.error(`Fetching ${args.url}...`);
    }

    const result = await clean(args.url, { model: args.model });

    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else if (args.output) {
      await writeFile(args.output, result.markdown, "utf8");
    } else {
      process.stdout.write(`${result.markdown}\n`);
    }

    if (!args.noStats) {
      console.error(formatStats(result));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));

    if (
      error instanceof CleanFetchConfigError ||
      !(error instanceof CleanFetchCrawlError || error instanceof CleanFetchCleanError)
    ) {
      process.exitCode = 1;
      return;
    }

    process.exitCode = 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
