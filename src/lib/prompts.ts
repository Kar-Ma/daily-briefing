/**
 * All LLM prompts live here so they're easy to find, read, and tinker with.
 * Each function returns { system, prompt } ready to pass to callLLM().
 *
 * Conventions:
 * - System prompt sets role and tone in one or two sentences.
 * - User prompt holds the task instructions plus the input data.
 * - JSON inputs are stringified at the bottom of the prompt for clarity.
 */

export type PromptPair = {
  system: string;
  prompt: string;
};

type NewsArticle = {
  title: string;
  description: string;
  source: string;
  url: string;
  age?: string;
  breaking?: boolean;
};

export function newsPrompt(articles: NewsArticle[]): PromptPair {
  return {
    system:
      "You are an editor curating a personal morning briefing. Identify the most globally significant news stories from a list of recent articles and summarize them in a punchy, contextual style.",
    prompt: `From these articles published in the last 24 hours, pick the 3 most globally important. For each, write:
- A punchy, declarative title (rewrite the original if it's weak, generic, or clickbait)
- A 1–2 sentence summary that says what happened AND why it matters (include specific names, numbers, or context where helpful)

Prioritize: world events, major politics, economics, science, technology breakthroughs, significant societal stories.
De-prioritize: sports, celebrity gossip, local US stories without broader implications.

Return ONLY a JSON object in this exact shape, no surrounding text or markdown:
{
  "headlines": [
    { "title": "...", "summary": "...", "source": "...", "url": "..." }
  ]
}

Preserve the source and url from the original article you pick.

Articles:
${JSON.stringify(articles, null, 2)}`,
  };
}

type CalendarEventForPrompt = {
  time: string;
  summary: string;
  location?: string;
  source: string;
};

type WeatherForPrompt = {
  condition: string;
  high: number;
  low: number;
  precipitation: number;
};

export function clothingPrompt(weather: WeatherForPrompt): PromptPair {
  return {
    system:
      "You give a short, practical clothing recommendation based on today's weather. Tone: like a thoughtful friend, not a fashion magazine.",
    prompt: `Today's weather:
- Condition: ${weather.condition}
- High: ${weather.high}°C
- Low: ${weather.low}°C
- Rain chance: ${weather.precipitation}%

Write a 1-sentence clothing/wear recommendation under 14 words. Be specific (mention items by name) and include relevant accessories (umbrella, sunglasses, sunscreen) when appropriate.

Tone reference (do not copy verbatim):
- "Light jacket and umbrella — pack for showers."
- "Sunglasses and shorts weather, sunscreen if you'll be outside."
- "Winter coat, gloves, and a scarf — bundle up."
- "Rainproof shell and waterproof shoes."

Just the sentence. No quotes, no preamble.`,
  };
}

export function calendarSummaryPrompt(
  events: CalendarEventForPrompt[]
): PromptPair {
  const count = events.length;
  return {
    system:
      "You write a short, warm closing message for a daily briefing's calendar section. The tone is like a friendly personal assistant who knows the user well — not formal, not overly cheerful, just observational and human.",
    prompt: `Look at today's calendar (${count} event${count === 1 ? "" : "s"}) and write a 1–2 sentence closing message that:
1. Captures the shape of the day (empty / light / busy / scattered / packed)
2. Notes something specific or human (a free morning, a fun event, a long stretch, etc.)
3. Has a warm, conversational tone — like a personal assistant signing off

Keep it under 25 words. Plain prose only — no bullets, no headers, no quotes around your output. May include one fitting emoji if it adds something.

Tone reference (match the vibe, do not copy):
- "Clear day — nothing on the books. Enjoy the long weekend. 🎉"
- "Busy afternoon into evening — and a movie to cap it off. Have a good one!"
- "One meeting in the afternoon — morning's all yours. Have a good one!"

Today's events:
${JSON.stringify(events, null, 2)}`,
  };
}
