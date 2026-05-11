import { useMemo } from "react";

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  isNext: boolean;
  passed: boolean;
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export function usePrayerTimes(): { prayers: PrayerTime[]; nextPrayer: PrayerTime | null; timeToNext: string } {
  const prayers = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const times = [
      { name: "Fajr", arabicName: "الفجر", hour: 5, minute: 15 },
      { name: "Dhuhr", arabicName: "الظهر", hour: 12, minute: 30 },
      { name: "Asr", arabicName: "العصر", hour: 15, minute: 45 },
      { name: "Maghrib", arabicName: "المغرب", hour: 18, minute: 20 },
      { name: "Isha", arabicName: "العشاء", hour: 20, minute: 0 },
    ];

    let nextIndex = -1;
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      const prayerMinutes = t.hour * 60 + t.minute;
      if (prayerMinutes > currentMinutes) {
        nextIndex = i;
        break;
      }
    }

    return times.map((t, i) => {
      const prayerMinutes = t.hour * 60 + t.minute;
      return {
        name: t.name,
        arabicName: t.arabicName,
        time: formatTime(t.hour, t.minute),
        isNext: i === nextIndex,
        passed: prayerMinutes <= currentMinutes && i !== nextIndex,
      };
    });
  }, []);

  const nextPrayer = prayers.find(p => p.isNext) ?? null;

  const timeToNext = useMemo(() => {
    if (!nextPrayer) return "";
    const times = [
      { name: "Fajr", hour: 5, minute: 15 },
      { name: "Dhuhr", hour: 12, minute: 30 },
      { name: "Asr", hour: 15, minute: 45 },
      { name: "Maghrib", hour: 18, minute: 20 },
      { name: "Isha", hour: 20, minute: 0 },
    ];
    const found = times.find(t => t.name === nextPrayer.name);
    if (!found) return "";
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const prayerMins = found.hour * 60 + found.minute;
    const diff = prayerMins - nowMins;
    if (diff <= 0) return "Now";
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, [nextPrayer]);

  return { prayers, nextPrayer, timeToNext };
}
