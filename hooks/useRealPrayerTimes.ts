import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { fetchPrayerTimesByCoords, fetchPrayerTimesByCity, formatPrayerTimes, type FormattedPrayer, type PrayerTimesResponse } from "@/services/prayerTimesApi";

interface PrayerState {
  prayers: FormattedPrayer[];
  nextPrayer: FormattedPrayer | null;
  timeToNext: string;
  isLoading: boolean;
  locationName: string;
  hijriDate: string;
  hijriMonth: string;
  hijriYear: string;
  gregorianDate: string;
}

function getTimeToNext(prayer: FormattedPrayer | null): string {
  if (!prayer) return "";
  const [timePart, ampm] = prayer.time.split(" ");
  const [hStr, mStr] = (timePart ?? "").split(":");
  let h = parseInt(hStr ?? "0");
  const m = parseInt(mStr ?? "0");
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const prayerMins = h * 60 + m;
  let diff = prayerMins - nowMins;
  if (diff <= 0) diff += 24 * 60;
  if (diff <= 0) return "Now";
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function useRealPrayerTimes(): PrayerState {
  const [state, setState] = useState<PrayerState>({
    prayers: [],
    nextPrayer: null,
    timeToNext: "",
    isLoading: true,
    locationName: "Makkah, SA",
    hijriDate: "",
    hijriMonth: "",
    hijriYear: "",
    gregorianDate: "",
  });

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      let data: PrayerTimesResponse;
      let locName = "Makkah, SA";

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          locName = `${geo?.city ?? ""}, ${geo?.country ?? ""}`.trim();
          data = await fetchPrayerTimesByCoords(loc.coords.latitude, loc.coords.longitude);
        } else {
          data = await fetchPrayerTimesByCity("Makkah", "SA");
        }
      } catch {
        data = await fetchPrayerTimesByCity("Makkah", "SA");
      }

      const prayers = formatPrayerTimes(data);
      const nextPrayer = prayers.find(p => p.isNext) ?? null;
      const timeToNext = getTimeToNext(nextPrayer);

      setState({
        prayers,
        nextPrayer,
        timeToNext,
        isLoading: false,
        locationName: locName || "Makkah, SA",
        hijriDate: data.date.hijri.day,
        hijriMonth: data.date.hijri.month.en,
        hijriYear: data.date.hijri.year,
        gregorianDate: data.date.readable,
      });
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        prayers: getFallbackPrayers(),
        nextPrayer: getFallbackPrayers().find(p => p.isNext) ?? null,
      }));
    }
  };

  return state;
}

function getFallbackPrayers(): FormattedPrayer[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const times = [
    { name: "Fajr", arabicName: "الفجر", h: 5, m: 15 },
    { name: "Dhuhr", arabicName: "الظهر", h: 12, m: 30 },
    { name: "Asr", arabicName: "العصر", h: 15, m: 45 },
    { name: "Maghrib", arabicName: "المغرب", h: 18, m: 20 },
    { name: "Isha", arabicName: "العشاء", h: 20, m: 0 },
  ];

  let nextIndex = -1;
  for (let i = 0; i < times.length; i++) {
    const mins = (times[i]?.h ?? 0) * 60 + (times[i]?.m ?? 0);
    if (mins > currentMinutes) { nextIndex = i; break; }
  }

  return times.map((t, i) => {
    const totalMins = t.h * 60 + t.m;
    const ampm = t.h >= 12 ? "PM" : "AM";
    const h12 = t.h % 12 || 12;
    return {
      name: t.name,
      arabicName: t.arabicName,
      time: `${h12}:${t.m.toString().padStart(2, "0")} ${ampm}`,
      time24: `${t.h.toString().padStart(2, "0")}:${t.m.toString().padStart(2, "0")}`,
      isNext: i === nextIndex,
      passed: totalMins <= currentMinutes && i !== nextIndex,
    };
  });
}
