"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocation(formData: FormData) {
  const city = formData.get("city");
  if (typeof city !== "string" || !city.trim()) return;

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city.trim());
  url.searchParams.set("count", "1");

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) return;

  const result = data.results[0];
  const location = {
    lat: result.latitude,
    lon: result.longitude,
    label: result.name,
  };

  const cookieStore = await cookies();
  cookieStore.set("location", JSON.stringify(location), {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/");
}
