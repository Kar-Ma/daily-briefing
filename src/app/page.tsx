import { cookies } from "next/headers";
import LocationSwitcher from "./location-switcher";
import {
  getCalendarEvents,
  getCalendarSummary,
  formatEventTime,
  sourceColorClass,
} from "@/lib/calendar";
import { getHeadlines } from "@/lib/news";

type Location = {
  lat: number;
  lon: number;
  label: string;
};

type Weather = {
  high: number;
  low: number;
  code: number;
  precipitation: number;
};

async function getLocation(): Promise<Location> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("location");
  if (cookie?.value) {
    try {
      return JSON.parse(cookie.value);
    } catch {
      // fall through to env defaults
    }
  }
  return {
    lat: Number(process.env.LOCATION_LAT) || 51.9244,
    lon: Number(process.env.LOCATION_LON) || 4.4777,
    label: process.env.LOCATION_LABEL || "Rotterdam",
  };
}

async function getWeather(location: Location): Promise<Weather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lon));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url);
  const data = await res.json();

  return {
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    code: data.daily.weather_code[0],
    precipitation: data.daily.precipitation_probability_max[0],
  };
}

function describeWeather(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "Clear and sunny" };
  if (code === 1) return { emoji: "🌤️", label: "Mostly sunny" };
  if (code === 2) return { emoji: "⛅", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "Foggy" };
  if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "Rainy" };
  if (code >= 71 && code <= 77) return { emoji: "❄️", label: "Snow" };
  if (code >= 80 && code <= 82) return { emoji: "🌧️", label: "Rain showers" };
  if (code >= 85 && code <= 86) return { emoji: "🌨️", label: "Snow showers" };
  if (code >= 95) return { emoji: "⛈️", label: "Thunderstorm" };
  return { emoji: "🌡️", label: "Weather data" };
}

export default async function Home() {
  const location = await getLocation();
  const [weather, events, headlines] = await Promise.all([
    getWeather(location),
    getCalendarEvents(),
    getHeadlines(),
  ]);
  const calendarSummary = await getCalendarSummary(events);
  const condition = describeWeather(weather.code);

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
                      className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
