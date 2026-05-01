import LocationSwitcher from "./location-switcher";
import { getLocation } from "@/lib/location";
import {
  getWeather,
  describeWeather,
  getClothingRecommendation,
} from "@/lib/weather";
import {
  getCalendarEvents,
  getCalendarSummary,
  formatEventTime,
  sourceColorClass,
} from "@/lib/calendar";
import { getHeadlines } from "@/lib/news";

export default async function Home() {
  const location = await getLocation();
  const [weather, events, headlines] = await Promise.all([
    getWeather(location),
    getCalendarEvents(),
    getHeadlines(),
  ]);
  const condition = describeWeather(weather.code);
  const [calendarSummary, clothing] = await Promise.all([
    getCalendarSummary(events),
    getClothingRecommendation(weather, condition.label),
  ]);

  const now = new Date();
  const dateString = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-6 py-12">
      <main className="mx-auto max-w-2xl space-y-6">
        <header className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Good morning, Karthik
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{dateString}</p>
        </header>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Weather
            </h2>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              <LocationSwitcher label={location.label} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-5xl">{condition.emoji}</span>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {condition.label}
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                High {weather.high}° · Low {weather.low}°
                {weather.precipitation >= 30 && (
                  <span> · {weather.precipitation}% chance of rain</span>
                )}
              </p>
            </div>
          </div>
          {clothing && (
            <p className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              {clothing}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Top Headlines
          </h2>
          {headlines.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Headlines unavailable — check your API keys in <code>.env.local</code>.
            </p>
          ) : (
            <ol className="mt-3 space-y-4 text-zinc-900 dark:text-zinc-100">
              {headlines.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-zinc-400 font-mono text-sm pt-1 shrink-0">
                    {i + 1}
                  </span>
                  <div className="space-y-1">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {h.title}
                    </a>
                    {h.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {h.description}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {h.source}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Today
          </h2>
          {events.length > 0 && (
            <ul className="mt-3 space-y-3 text-zinc-900 dark:text-zinc-100">
              {events.map((event, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${sourceColorClass(event.source.color)}`}
                    title={event.source.name}
                  />
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400 w-24 shrink-0">
                    {formatEventTime(event)}
                  </span>
                  <span>{event.summary}</span>
                </li>
              ))}
            </ul>
          )}
          {calendarSummary ? (
            <p
              className={`text-sm text-zinc-600 dark:text-zinc-400 ${
                events.length > 0
                  ? "mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                  : "mt-3"
              }`}
            >
              {calendarSummary}
            </p>
          ) : (
            events.length === 0 && (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Nothing on the calendar today.
              </p>
            )
          )}
        </section>
      </main>
    </div>
  );
}
