export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
}

export interface PrayerTimesResponse {
  timings: PrayerTimesData;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: { en: string; ar: string; number: number };
      year: string;
    };
    gregorian: { date: string };
  };
  meta: { latitude: number; longitude: number; timezone: string; method: { id: number; name: string } };
}

function formatTo12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr ?? "0");
  const m = parseInt(mStr ?? "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export async function fetchPrayerTimesByCoords(
  lat: number,
  lon: number,
  method: number = 2
): Promise<PrayerTimesResponse> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prayer times API error: ${res.status}`);
  const json = await res.json() as { data: PrayerTimesResponse };
  return json.data;
}

export async function fetchPrayerTimesByCity(
  city: string = "Makkah",
  country: string = "SA"
): Promise<PrayerTimesResponse> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${country}&method=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prayer times API error: ${res.status}`);
  const json = await res.json() as { data: PrayerTimesResponse };
  return json.data;
}

export interface FormattedPrayer {
  name: string;
  arabicName: string;
  time: string;
  time24: string;
  isNext: boolean;
  passed: boolean;
}

export function formatPrayerTimes(data: PrayerTimesResponse): FormattedPrayer[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerKeys: Array<{ key: keyof PrayerTimesData; name: string; arabicName: string }> = [
    { key: "Fajr", name: "Fajr", arabicName: "الفجر" },
    { key: "Dhuhr", name: "Dhuhr", arabicName: "الظهر" },
    { key: "Asr", name: "Asr", arabicName: "العصر" },
    { key: "Maghrib", name: "Maghrib", arabicName: "المغرب" },
    { key: "Isha", name: "Isha", arabicName: "العشاء" },
  ];

  const prayers = prayerKeys.map(p => {
    const raw = data.timings[p.key];
    const time24 = raw?.split(" ")[0] ?? "00:00";
    const [hStr, mStr] = time24.split(":");
    const totalMins = parseInt(hStr ?? "0") * 60 + parseInt(mStr ?? "0");
    return { ...p, time: formatTo12h(time24), time24, totalMins };
  });

  let nextIndex = -1;
  for (let i = 0; i < prayers.length; i++) {
    if ((prayers[i]?.totalMins ?? 0) > currentMinutes) {
      nextIndex = i;
      break;
    }
  }

  return prayers.map((p, i) => ({
    name: p.name,
    arabicName: p.arabicName,
    time: p.time,
    time24: p.time24,
    isNext: i === nextIndex,
    passed: p.totalMins <= currentMinutes && i !== nextIndex,
  }));
}
