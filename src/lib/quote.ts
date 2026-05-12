import { unstable_cache } from "next/cache";
import { callLLM } from "./llm";
import { quotePrompt } from "./prompts";

export type Quote = {
  text: string;
  attribution: string;
};

const CACHE_SECONDS = 60 * 60 * 24;
const FALLBACK_MODEL = "claude-haiku-4-5-20251001";

function getTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function generateQuote(
  model: string,
  _dateKey: string
): Promise<Quote | null> {
  const { system, prompt } = quotePrompt();

  try {
    const response = await callLLM({
      prompt,
      systemPrompt: system,
      model,
      maxTokens: 200,
    });

    const parsed = parseJSON(response);
    if (!parsed?.quote || !parsed?.attribution) return null;

    return {
      text: parsed.quote.trim().replace(/^["']|["']$/g, ""),
      attribution: parsed.attribution.trim(),
    };
  } catch (e) {
    console.error("Quote generation failed:", e);
    return null;
  }
}

const getCachedQuote = unstable_cache(generateQuote, ["daily-quote"], {
  revalidate: CACHE_SECONDS,
});

export async function getQuote(): Promise<Quote | null> {
  const model =
    process.env.QUOTE_MODEL || process.env.DEFAULT_LLM_MODEL || FALLBACK_MODEL;
  return getCachedQuote(model, getTodayKey());
}

function parseJSON(
  text: string
): { quote?: string; attribution?: string } | null {
  try {
    return JSON.parse(text);
  } catch {}

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {}
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return null;
}
