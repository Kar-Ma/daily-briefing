import { cookies } from "next/headers";

export type Location = {
  lat: number;
  lon: number;
  label: string;
};

export async function getLocation(): Promise<Location> {
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
