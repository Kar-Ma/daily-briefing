import { unstable_cache } from "next/cache";
import { callLLM } from "./llm";
import { newsPrompt } from "./prompts";

export type Headline = {
  title: string;
  description: string;
  source: string;
  url: string;
};

const FALLBACK_MODEL = "claude-haiku-4-5-20251001";
const CACHE_SECONDS = 60 * 60 * 24;

type BraveArticle = {
  title: string;
  url: string;
  description: string;
  age?: string;
  meta_url?: { hostname?: string };
  breaking?: boolean;
};

async function fetchBraveNews(): Promise<BraveArticle[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.search.brave.com/res/v1/news/search");
  url.searchParams.set("q", "top world news");
  url.searchParams.set("count", "15");
  url.searchParams.set("freshness", "pd");
  url.searchParams.set("country", "us");

  try {
    const res = await fetch(url, {
      headers: {
        "X-Subscription-Token": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Brave Search failed:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch (e) {
    console.error("Brave Search error:", e);
    return [];
  }
}

async function fetchAndCurateHeadlines(model: string): Promise<Headline[]> {
  const articles = await fetchBraveNews();
  if (articles.length === 0) return [];

  const trimmed = articles.slice(0, 15).map((a) => ({
    title: a.title,
    description: a.description,
    source: a.meta_url?.hostname ?? "",
    url: a.url,
    age: a.age,
    breaking: a.breaking,
  }));

  const { system, prompt } = newsPrompt(trimmed);

  try {
    const response = await callLLM({
      prompt,
      systemPrompt: system,
      model,
      maxTokens: 1024,
    });

    const parsed = parseJSON(response);
    if (!parsed?.headlines || !Array.isArray(parsed.headlines)) return [];

    return parsed.headlines.slice(0, 3).map((raw) => {
      const h = raw as {
        title?: string;
        summary?: string;
        source?: string;
        url?: string;
      };
      return {
        title: h.title ?? "(no title)",
        description: h.summary ?? "",
        source: h.source ?? "",
        url: h.url ?? "",
      };
    });
  } catch (e) {
    console.error("News curation failed:", e);
    return [];
  }
}

function getTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const getCachedHeadlines = unstable_cache(
  async (model: string, _dateKey: string) => fetchAndCurateHeadlines(model),
  ["news-headlines"],
  { revalidate: CACHE_SECONDS }
);

export async function getHeadlines(): Promise<Headline[]> {
  const model =
    process.env.NEWS_MODEL || process.env.DEFAULT_LLM_MODEL || FALLBACK_MODEL;
  return getCachedHeadlines(model, getTodayKey());
}

function parseJSON(text: string): { headlines?: unknown[] } | null {
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
