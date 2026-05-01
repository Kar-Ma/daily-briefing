import * as ical from "node-ical";
import { unstable_cache } from "next/cache";
import { callLLM } from "./llm";

export type CalendarSource = {
  name: string;
  color: string;
};

export type CalendarEvent = {
  start: Date;
  end: Date;
  summary: string;
  location?: string;
  allDay: boolean;
  source: CalendarSource;
};

type SourceConfig = {
  url: string;
  name: string;
  color: string;
};

function getSources(): SourceConfig[] {
  const sources: SourceConfig[] = [];
  for (let i = 1; ; i++) {
    const url = process.env[`CALENDAR_${i}_URL`];
    if (!url) break;
    sources.push({
      url,
      name: process.env[`CALENDAR_${i}_NAME`] || `Calendar ${i}`,
      color: process.env[`CALENDAR_${i}_COLOR`] || "blue",
    });
  }
  return sources;
}

async function fetchSource(source: SourceConfig): Promise<CalendarEvent[]> {
  try {
    const res = await fetch(source.url, { cache: "no-store" });
    const text = await res.text();
    const data = ical.parseICS(text);

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    const events: CalendarEvent[] = [];
    const sourceTag: CalendarSource = { name: source.name, color: source.color };

    for (const key in data) {
      const item = data[key];
      if (item.type !== "VEVENT") continue;
      const event = item as ical.VEvent;

      const allDay = event.datetype === "date";

      if (event.rrule) {
        const instances = event.rrule.between(dayStart, dayEnd, true);
        const duration = event.end.getTime() - event.start.getTime();
        for (const instanceStart of instances) {
          events.push({
            start: instanceStart,
            end: new Date(instanceStart.getTime() + duration),
            summary: event.summary || "(no title)",
            location: event.location,
            allDay,
            source: sourceTag,
          });
        }
      } else {
        if (event.start <= dayEnd && event.end > dayStart) {
          events.push({
            start: event.start,
            end: event.end,
            summary: event.summary || "(no title)",
            location: event.location,
            allDay,
            source: sourceTag,
          });
        }
      }
    }

    return events;
  } catch (e) {
    console.error(`Calendar fetch failed for ${source.name}:`, e);
    return [];
  }
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const sources = getSources();
  if (sources.length === 0) return [];

  const eventArrays = await Promise.all(sources.map(fetchSource));
  const events = eventArrays.flat();
  events.sort((a, b) => a.start.getTime() - b.start.getTime());
  return events;
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return "All day";
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(event.start)}–${fmt(event.end)}`;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
  fuchsia: "bg-fuchsia-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
};

export function sourceColorClass(color: string): string {
  return COLOR_CLASSES[color] || "bg-zinc-400";
}

const SUMMARY_CACHE_SECONDS = 60 * 60 * 24;
const SUMMARY_FALLBACK_MODEL = "claude-haiku-4-5-20251001";

async function generateCalendarSummary(
  events: CalendarEvent[],
  model: string
): Promise<string> {
  const eventsForPrompt = events.map((e) => ({
    time: e.allDay
      ? "all day"
      : `${e.start.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}–${e.end.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
    summary: e.summary,
    location: e.location,
    source: e.source.name,
  }));

  const systemPrompt =
    "You write a short, warm closing message for a daily briefing's calendar section. The tone is like a friendly personal assistant who knows the user well — not formal, not overly cheerful, just observational and human.";

  const prompt = `Look at today's calendar (${eventsForPrompt.length} event${eventsForPrompt.length === 1 ? "" : "s"}) and write a 1–2 sentence closing message that:
1. Captures the shape of the day (empty / light / busy / scattered / packed)
2. Notes something specific or human (a free morning, a fun event, a long stretch, etc.)
3. Has a warm, conversational tone — like a personal assistant signing off

Keep it under 25 words. Plain prose only — no bullets, no headers, no quotes around your output. May include one fitting emoji if it adds something.

Tone reference (match the vibe, do not copy):
- "Clear day — nothing on the books. Enjoy the long weekend. 🎉"
- "Busy afternoon into evening — and a movie to cap it off. Have a good one!"
- "One meeting in the afternoon — morning's all yours. Have a good one!"

Today's events:
${JSON.stringify(eventsForPrompt, null, 2)}`;

  try {
    const response = await callLLM({
      prompt,
      systemPrompt,
      model,
      maxTokens: 120,
    });
    return response.trim().replace(/^["']|["']$/g, "");
  } catch (e) {
    console.error("Calendar summary failed:", e);
    return "";
  }
}

const getCachedSummary = unstable_cache(
  generateCalendarSummary,
  ["calendar-summary"],
  { revalidate: SUMMARY_CACHE_SECONDS }
);

export async function getCalendarSummary(
  events: CalendarEvent[]
): Promise<string> {
  const model =
    process.env.CALENDAR_MODEL ||
    process.env.DEFAULT_LLM_MODEL ||
    SUMMARY_FALLBACK_MODEL;
  return getCachedSummary(events, model);
}
