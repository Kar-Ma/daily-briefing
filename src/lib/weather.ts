import { unstable_cache } from "next/cache";
import { callLLM } from "./llm";
import { clothingPrompt } from "./prompts";
import type { Location } from "./location";

export type Weather = {
  high: number;
  low: number;
  code: number;
  precipitation: number;
};

export type WeatherCondition = {
  emoji: string;
  label: string;
};

export async function getWeather(location: Location): Promise<Weather> {
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

export function describeWeather(code: number): WeatherCondition {
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

const CLOTHING_CACHE_SECONDS = 60 * 60 * 24;
const CLOTHING_FALLBACK_MODEL = "claude-haiku-4-5-20251001";

async function generateClothingRecommendation(
  weather: Weather,
  conditionLabel: string,
  model: string
): Promise<string> {
  const { system, prompt } = clothingPrompt({
    condition: conditionLabel,
    high: weather.high,
    low: weather.low,
    precipitation: weather.precipitation,
  });

  try {
    const response = await callLLM({
      prompt,
      systemPrompt: system,
      model,
      maxTokens: 80,
    });
    return response.trim().replace(/^["']|["']$/g, "");
  } catch (e) {
    console.error("Clothing recommendation failed:", e);
    return "";
  }
}

const getCachedClothing = unstable_cache(
  generateClothingRecommendation,
  ["clothing-recommendation"],
  { revalidate: CLOTHING_CACHE_SECONDS }
);

export async function getClothingRecommendation(
  weather: Weather,
  conditionLabel: string
): Promise<string> {
  const model =
    process.env.CLOTHING_MODEL ||
    process.env.DEFAULT_LLM_MODEL ||
    CLOTHING_FALLBACK_MODEL;
  return getCachedClothing(weather, conditionLabel, model);
}
